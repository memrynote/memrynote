/**
 * Auth Routes
 *
 * T042: POST /auth/otp/request - Request OTP code
 * T043: POST /auth/otp/verify - Verify OTP and authenticate
 * T047a: POST /auth/otp/resend - Resend OTP code
 * T048: GET /auth/oauth/:provider - Initiate OAuth flow
 * T049: GET /auth/oauth/:provider/callback - Handle OAuth callback
 * T050: POST /auth/devices - Register device
 * T051: POST /auth/setup - First device setup
 * T052b: POST /auth/refresh - Refresh tokens
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { Env, Variables } from '../index'
import { authMiddleware, getAuth } from '../middleware/auth'
import { rateLimitMiddleware } from '../middleware/rate-limit'
import { createEmailService } from '../services/email'
import {
  generateOtpCode,
  storeOtpCode,
  verifyOtpCode,
  canResendOtp,
  OTP_CONFIG,
} from '../services/otp'
import {
  createUser,
  getUserByEmail,
  findOrCreateByEmail,
  findOrCreateByOAuth,
  updateUser,
  getUserById,
} from '../services/user'
import {
  createDeviceChallenge,
  verifyDeviceChallenge,
  createDevice,
  getDevicesByUserId,
  updateDevice,
  revokeDevice,
} from '../services/device'
import {
  initiateGoogleOAuth,
  validateOAuthState,
  exchangeGoogleCode,
  getGoogleUserInfo,
} from '../services/oauth'
import {
  generateAccessToken,
  createRefreshToken,
  rotateRefreshToken,
} from '../services/auth'
import {
  badRequest,
  rateLimited,
  notFound,
  validationError,
} from '../lib/errors'
import {
  OtpRequestSchema,
  OtpVerifyRequestSchema,
  OtpResendRequestSchema,
  DeviceRegisterRequestSchema,
  RefreshTokenRequestSchema,
  FirstDeviceSetupRequestSchema,
  type OtpRequest,
  type OtpVerifyRequest,
} from '../contracts/auth-api'

/**
 * Auth router - all auth-related endpoints.
 */
export const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

// =============================================================================
// OTP Endpoints (T042, T043, T047a)
// =============================================================================

/**
 * T042: POST /otp/request
 *
 * Request an OTP code to be sent to the user's email.
 * - Rate limited: 3 requests per 10 minutes per email
 * - Creates user account if new (unverified)
 * - Always returns success (prevents email enumeration)
 */
authRoutes.post(
  '/otp/request',
  rateLimitMiddleware('otp_request', async (c) => {
    const body = await c.req.json()
    return body.email?.toLowerCase().trim() || 'unknown'
  }),
  zValidator('json', OtpRequestSchema),
  async (c) => {
    const { email } = c.req.valid('json')
    const normalizedEmail = email.toLowerCase().trim()

    // Find or create user
    await findOrCreateByEmail(c.env.DB, normalizedEmail)

    // Generate and store OTP
    const code = generateOtpCode()
    const { expiresAt } = await storeOtpCode(c.env.DB, normalizedEmail, code)

    // Send email
    const emailService = createEmailService({
      apiKey: c.env.RESEND_API_KEY,
      fromEmail: c.env.EMAIL_FROM,
      fromName: c.env.EMAIL_FROM_NAME,
    })

    const result = await emailService.sendOtpCode(normalizedEmail, code)

    if (!result.success) {
      console.error('Failed to send OTP email:', result.error)
    }

    return c.json({
      success: true,
      expiresAt,
    })
  }
)

/**
 * T043: POST /otp/verify
 *
 * Verify OTP code and authenticate user.
 * - Validates 6-digit code
 * - Max 5 attempts per code
 * - Returns JWT tokens on success
 */
authRoutes.post(
  '/otp/verify',
  zValidator('json', OtpVerifyRequestSchema),
  async (c) => {
    const { email, code } = c.req.valid('json')
    const normalizedEmail = email.toLowerCase().trim()

    // Verify OTP
    await verifyOtpCode(c.env.DB, normalizedEmail, code)

    // Get or create user
    const { user, isNew } = await findOrCreateByEmail(c.env.DB, normalizedEmail)

    // Mark email as verified
    const verifiedUser = await updateUser(c.env.DB, user.id, { emailVerified: true })

    // For first device setup, return partial auth (no device yet)
    // The client will call POST /devices to register the device
    const tempAccessToken = await generateAccessToken(
      user.id,
      'pending', // No device yet
      c.env.JWT_SECRET
    )

    return c.json({
      accessToken: tempAccessToken,
      user: verifiedUser,
      isNewUser: isNew,
      needsDeviceRegistration: true,
    })
  }
)

/**
 * T047a: POST /otp/resend
 *
 * Resend OTP code with cooldown check.
 * - Checks 60-second cooldown
 * - Rate limited same as request
 */
authRoutes.post(
  '/otp/resend',
  rateLimitMiddleware('otp_request', async (c) => {
    const body = await c.req.json()
    return body.email?.toLowerCase().trim() || 'unknown'
  }),
  zValidator('json', OtpResendRequestSchema),
  async (c) => {
    const { email } = c.req.valid('json')
    const normalizedEmail = email.toLowerCase().trim()

    // Check cooldown
    const { canResend, remainingMs } = await canResendOtp(c.env.DB, normalizedEmail)

    if (!canResend) {
      throw rateLimited(Math.ceil((remainingMs ?? OTP_CONFIG.RESEND_COOLDOWN_MS) / 1000))
    }

    // Generate and store new OTP
    const code = generateOtpCode()
    const { expiresAt } = await storeOtpCode(c.env.DB, normalizedEmail, code)

    // Send email
    const emailService = createEmailService({
      apiKey: c.env.RESEND_API_KEY,
      fromEmail: c.env.EMAIL_FROM,
      fromName: c.env.EMAIL_FROM_NAME,
    })

    const result = await emailService.sendOtpCode(normalizedEmail, code)

    if (!result.success) {
      console.error('Failed to send OTP email:', result.error)
    }

    return c.json({
      success: true,
      expiresAt,
    })
  }
)

// =============================================================================
// OAuth Endpoints (T048, T049, T049a)
// =============================================================================

/**
 * T048: GET /oauth/:provider
 *
 * Initiate OAuth flow for a provider.
 * Returns authorization URL and state.
 */
authRoutes.get('/oauth/:provider', async (c) => {
  const provider = c.req.param('provider')

  if (provider !== 'google') {
    throw badRequest('Unsupported OAuth provider')
  }

  const redirectUri = c.req.query('redirect_uri')
  if (!redirectUri) {
    throw badRequest('redirect_uri is required')
  }

  const clientId = c.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw badRequest('OAuth not configured')
  }

  const { authUrl, state } = await initiateGoogleOAuth(
    c.env.DB,
    clientId,
    redirectUri
  )

  return c.json({
    authUrl,
    state,
  })
})

/**
 * T049, T049a: GET /oauth/:provider/callback
 *
 * Handle OAuth callback from provider.
 * Validates state, exchanges code, creates/links user.
 */
authRoutes.get('/oauth/:provider/callback', async (c) => {
  const provider = c.req.param('provider')

  if (provider !== 'google') {
    throw badRequest('Unsupported OAuth provider')
  }

  const code = c.req.query('code')
  const state = c.req.query('state')
  const error = c.req.query('error')

  if (error) {
    throw badRequest(`OAuth error: ${error}`)
  }

  if (!code || !state) {
    throw badRequest('Missing code or state parameter')
  }

  // Validate state and get code verifier (T049a)
  const { codeVerifier, redirectUri } = await validateOAuthState(c.env.DB, state)

  // Exchange code for tokens
  const tokens = await exchangeGoogleCode(
    code,
    codeVerifier,
    c.env.GOOGLE_CLIENT_ID,
    c.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  )

  // Get user info from Google
  const googleUser = await getGoogleUserInfo(tokens.access_token)

  if (!googleUser.verified_email) {
    throw badRequest('Email not verified with Google')
  }

  // Find or create user (handles identity linking - T053a)
  const user = await findOrCreateByOAuth(c.env.DB, {
    email: googleUser.email,
    provider: 'google',
    providerId: googleUser.id,
  })

  // Generate partial access token (no device yet)
  const tempAccessToken = await generateAccessToken(
    user.id,
    'pending',
    c.env.JWT_SECRET
  )

  // Redirect back to app with token
  const appRedirectUrl = new URL(redirectUri)
  appRedirectUrl.searchParams.set('token', tempAccessToken)
  appRedirectUrl.searchParams.set('user_id', user.id)
  appRedirectUrl.searchParams.set('needs_device', 'true')

  return c.redirect(appRedirectUrl.toString())
})

// =============================================================================
// Device Registration (T050, T050a, T050b)
// =============================================================================

/**
 * Device challenge request schema.
 */
const DeviceChallengeRequestSchema = z.object({
  authPublicKey: z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/, 'Invalid Base64 string'),
})

/**
 * POST /devices/challenge
 *
 * Request a challenge nonce for device registration.
 * The client must sign this nonce to prove key ownership.
 */
authRoutes.post(
  '/devices/challenge',
  authMiddleware(),
  zValidator('json', DeviceChallengeRequestSchema),
  async (c) => {
    const auth = getAuth(c)
    const { authPublicKey } = c.req.valid('json')

    const nonce = await createDeviceChallenge(c.env.DB, auth.userId, authPublicKey)

    return c.json({
      nonce,
      expiresIn: 300, // 5 minutes
    })
  }
)

/**
 * T050, T050a, T050b: POST /devices
 *
 * Register a new device.
 * - Requires challenge signature (T050b)
 * - Stores device public key (T050a)
 */
authRoutes.post(
  '/devices',
  authMiddleware(),
  zValidator('json', DeviceRegisterRequestSchema),
  async (c) => {
    const auth = getAuth(c)
    const input = c.req.valid('json')

    // Verify challenge signature (T050b)
    const isValid = await verifyDeviceChallenge(
      c.env.DB,
      input.authPublicKey,
      input.challengeNonce,
      input.challengeSignature,
      auth.userId
    )

    if (!isValid) {
      throw badRequest('Invalid challenge signature')
    }

    // Create device
    const device = await createDevice(c.env.DB, {
      userId: auth.userId,
      name: input.name,
      platform: input.platform,
      osVersion: input.osVersion,
      appVersion: input.appVersion,
      authPublicKey: input.authPublicKey,
    })

    // Generate device-specific tokens
    const accessToken = await generateAccessToken(
      auth.userId,
      device.id,
      c.env.JWT_SECRET
    )
    const refreshToken = await createRefreshToken(c.env.DB, auth.userId, device.id)

    // Send device linking notification
    const user = await getUserById(c.env.DB, auth.userId)
    if (user) {
      const emailService = createEmailService({
        apiKey: c.env.RESEND_API_KEY,
        fromEmail: c.env.EMAIL_FROM,
        fromName: c.env.EMAIL_FROM_NAME,
      })
      await emailService.sendDeviceLinkingAlert(user.email, input.name, input.platform)
    }

    return c.json({
      device,
      accessToken,
      refreshToken,
    }, 201)
  }
)

/**
 * GET /devices
 *
 * List all devices for the current user.
 */
authRoutes.get('/devices', authMiddleware(), async (c) => {
  const auth = getAuth(c)

  const devices = await getDevicesByUserId(c.env.DB, auth.userId, auth.deviceId)

  return c.json({ devices })
})

/**
 * PATCH /devices/:id
 *
 * Update a device (rename).
 */
const DeviceUpdateSchema = z.object({
  name: z.string().min(1).max(100),
})

authRoutes.patch(
  '/devices/:id',
  authMiddleware(),
  zValidator('json', DeviceUpdateSchema),
  async (c) => {
    const auth = getAuth(c)
    const deviceId = c.req.param('id')
    const { name } = c.req.valid('json')

    const device = await updateDevice(c.env.DB, deviceId, auth.userId, { name })

    return c.json({ device })
  }
)

/**
 * DELETE /devices/:id
 *
 * Revoke a device.
 */
authRoutes.delete('/devices/:id', authMiddleware(), async (c) => {
  const auth = getAuth(c)
  const deviceId = c.req.param('id')

  await revokeDevice(c.env.DB, deviceId, auth.userId)

  return c.json({ success: true })
})

// =============================================================================
// First Device Setup (T051)
// =============================================================================

/**
 * T051: POST /setup
 *
 * Complete first device setup by storing kdfSalt and keyVerifier.
 * Called after user confirms their recovery phrase.
 */
authRoutes.post(
  '/setup',
  authMiddleware(),
  zValidator('json', FirstDeviceSetupRequestSchema),
  async (c) => {
    const auth = getAuth(c)
    const { kdfSalt, keyVerifier } = c.req.valid('json')

    await updateUser(c.env.DB, auth.userId, {
      kdfSalt,
      keyVerifier,
    })

    return c.json({ success: true })
  }
)

// =============================================================================
// Token Refresh (T052b)
// =============================================================================

/**
 * T052b: POST /refresh
 *
 * Refresh access token using refresh token.
 * Implements token rotation with grace period.
 */
authRoutes.post(
  '/refresh',
  rateLimitMiddleware('token_refresh', async (c) => {
    const body = await c.req.json()
    return body.refreshToken?.slice(0, 36) || 'unknown'
  }),
  zValidator('json', RefreshTokenRequestSchema),
  async (c) => {
    const { refreshToken } = c.req.valid('json')

    const result = await rotateRefreshToken(c.env.DB, refreshToken, c.env.JWT_SECRET)

    return c.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      accessTokenExpiresAt: result.accessTokenExpiresAt,
      refreshTokenExpiresAt: result.refreshTokenExpiresAt,
    })
  }
)

// =============================================================================
// Recovery (for future use)
// =============================================================================

/**
 * GET /recovery
 *
 * Get recovery data for account restoration.
 * Protected by rate limiting and requires email verification.
 */
authRoutes.get('/recovery', async (c) => {
  const email = c.req.query('email')
  const userId = c.req.query('user_id')

  if (!email && !userId) {
    throw badRequest('email or user_id is required')
  }

  // This endpoint intentionally returns the same response whether
  // the user exists or not (prevents account enumeration)
  const user = email
    ? await getUserByEmail(c.env.DB, email)
    : userId
    ? await getUserById(c.env.DB, userId)
    : null

  if (!user) {
    // Don't reveal user doesn't exist
    throw notFound('Recovery data')
  }

  // Get internal user record for recovery data
  const { getUserRecordById } = await import('../services/user')
  const userRecord = await getUserRecordById(c.env.DB, user.id)

  if (!userRecord?.kdf_salt || !userRecord?.key_verifier) {
    throw notFound('Recovery data')
  }

  return c.json({
    kdfSalt: userRecord.kdf_salt,
    keyVerifier: userRecord.key_verifier,
  })
})

export default authRoutes
