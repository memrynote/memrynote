/**
 * Auth IPC handlers.
 * T050c: Device registration IPC handler
 * T050d: Persist device_id in local SQLite
 * T050e: Device registration service for renderer
 *
 * Handles OAuth, OTP, and device registration flows from renderer.
 *
 * @module ipc/auth-handlers
 */

import { ipcMain, BrowserWindow, shell } from 'electron'
import { AuthChannels } from '@shared/contracts/ipc-sync'
import type {
  StartOAuthRequest,
  StartOAuthResponse,
  GetSessionResponse,
  LogoutResponse
} from '@shared/contracts/ipc-sync'
import { StartOAuthRequestSchema } from '@shared/contracts/ipc-sync'
import { createValidatedHandler, createHandler } from './validate'
import { z } from 'zod'
import { OAuthServer } from '../auth/oauth-server'
import {
  generateDeviceSigningKeyPair,
  signPayloadBase64,
  uint8ArrayToBase64,
  storeKeyMaterial,
  storeDeviceKeyPair,
  retrieveKeyMaterial,
  deleteKeyMaterial,
  hasKeyMaterial
} from '../crypto'
import { getLocalConfig, setLocalConfig } from '../db/local-config'

// =============================================================================
// Configuration
// =============================================================================

const SYNC_SERVER_URL = process.env.SYNC_SERVER_URL || 'http://localhost:8787'

// =============================================================================
// Types
// =============================================================================

interface OtpRequestResponse {
  success: boolean
  expiresAt: number
}

interface OtpVerifyResponse {
  accessToken: string
  user: {
    id: string
    email: string
    emailVerified: boolean
    authMethod: 'email' | 'oauth'
    authProvider?: 'google'
    storageUsed: number
    storageLimit: number
    createdAt: number
    updatedAt: number
  }
  isNewUser: boolean
  needsDeviceRegistration: boolean
}

interface DeviceChallengeResponse {
  nonce: string
  expiresIn: number
}

interface DeviceRegistrationResponse {
  device: {
    id: string
    name: string
    platform: string
    osVersion?: string
    appVersion: string
    lastSyncAt?: number
    createdAt: number
    updatedAt: number
  }
  accessToken: string
  refreshToken: string
}

interface SetupCompleteResponse {
  success: boolean
}

// =============================================================================
// Request Schemas
// =============================================================================

const OtpRequestSchema = z.object({
  email: z.string().email()
})

const OtpVerifyRequestSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6).regex(/^\d{6}$/)
})

const DeviceRegistrationRequestSchema = z.object({
  name: z.string().min(1).max(100),
  platform: z.enum(['macos', 'windows', 'linux']),
  osVersion: z.string().optional(),
  appVersion: z.string(),
  accessToken: z.string()
})

const FirstDeviceSetupRequestSchema = z.object({
  kdfSalt: z.string(),
  keyVerifier: z.string(),
  accessToken: z.string()
})

// =============================================================================
// State
// =============================================================================

let oauthServer: OAuthServer | null = null
let currentAccessToken: string | null = null
let currentRefreshToken: string | null = null
let currentUserId: string | null = null

// =============================================================================
// Helper Functions
// =============================================================================

async function fetchWithAuth(
  url: string,
  options: RequestInit & { accessToken?: string } = {}
): Promise<Response> {
  const headers = new Headers(options.headers)
  const token = options.accessToken || currentAccessToken

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  headers.set('Content-Type', 'application/json')

  return fetch(`${SYNC_SERVER_URL}${url}`, {
    ...options,
    headers
  })
}

function emitAuthEvent(channel: string, data: unknown): void {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(channel, data)
  })
}

// =============================================================================
// Auth Handlers Registration
// =============================================================================

export function registerAuthHandlers(): void {
  // ============================================================================
  // OTP Flow
  // ============================================================================

  ipcMain.handle(
    'auth:request-otp',
    createValidatedHandler(OtpRequestSchema, async (input): Promise<OtpRequestResponse> => {
      const response = await fetch(`${SYNC_SERVER_URL}/api/v1/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.email })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to request OTP')
      }

      return response.json()
    })
  )

  ipcMain.handle(
    'auth:verify-otp',
    createValidatedHandler(OtpVerifyRequestSchema, async (input): Promise<OtpVerifyResponse> => {
      const response = await fetch(`${SYNC_SERVER_URL}/api/v1/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.email, code: input.code })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Invalid OTP')
      }

      const result: OtpVerifyResponse = await response.json()

      // Store access token temporarily (no device yet)
      currentAccessToken = result.accessToken
      currentUserId = result.user.id

      // Store user ID in local config (T050d)
      await setLocalConfig('user_id', result.user.id)

      return result
    })
  )

  ipcMain.handle(
    'auth:resend-otp',
    createValidatedHandler(OtpRequestSchema, async (input): Promise<OtpRequestResponse> => {
      const response = await fetch(`${SYNC_SERVER_URL}/api/v1/auth/otp/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.email })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to resend OTP')
      }

      return response.json()
    })
  )

  // ============================================================================
  // OAuth Flow
  // ============================================================================

  ipcMain.handle(
    AuthChannels.invoke.START_OAUTH,
    createValidatedHandler(StartOAuthRequestSchema, async (input): Promise<StartOAuthResponse> => {
      try {
        // Create OAuth server for callback (if not already running)
        if (!oauthServer) {
          oauthServer = new OAuthServer()
        }

        // Start listening for callback
        const callbackPromise = oauthServer.waitForCallback()

        // Get auth URL from server
        const redirectUri = `http://localhost:${oauthServer.port}/callback`
        const response = await fetch(
          `${SYNC_SERVER_URL}/api/v1/auth/oauth/${input.provider}?redirect_uri=${encodeURIComponent(redirectUri)}`
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to initiate OAuth')
        }

        const { authUrl } = await response.json()

        // Open browser for OAuth
        await shell.openExternal(authUrl)

        // Wait for callback (async - handle result when it comes)
        callbackPromise
          .then(async (result) => {
            if (result.success && result.token) {
              currentAccessToken = result.token
              currentUserId = result.userId || null

              if (result.userId) {
                await setLocalConfig('user_id', result.userId)
              }

              emitAuthEvent(AuthChannels.events.OAUTH_CALLBACK, {
                success: true,
                token: result.token,
                userId: result.userId,
                needsDevice: result.needsDevice
              })
            } else {
              emitAuthEvent(AuthChannels.events.OAUTH_CALLBACK, {
                success: false,
                error: result.error || 'OAuth failed'
              })
            }
          })
          .catch((error) => {
            emitAuthEvent(AuthChannels.events.OAUTH_CALLBACK, {
              success: false,
              error: error.message
            })
          })

        return { success: true, authUrl }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'OAuth initialization failed'
        }
      }
    })
  )

  // ============================================================================
  // Device Registration (T050c)
  // ============================================================================

  ipcMain.handle(
    'auth:register-device',
    createValidatedHandler(
      DeviceRegistrationRequestSchema,
      async (input): Promise<DeviceRegistrationResponse> => {
        // 1. Generate device signing keypair
        const deviceId = crypto.randomUUID()
        const keyPair = await generateDeviceSigningKeyPair(deviceId)
        const publicKeyBase64 = uint8ArrayToBase64(keyPair.publicKey)

        // 2. Request challenge from server
        const challengeResponse = await fetchWithAuth('/api/v1/auth/devices/challenge', {
          method: 'POST',
          accessToken: input.accessToken,
          body: JSON.stringify({ authPublicKey: publicKeyBase64 })
        })

        if (!challengeResponse.ok) {
          const error = await challengeResponse.json()
          throw new Error(error.message || 'Failed to get device challenge')
        }

        const { nonce } = (await challengeResponse.json()) as DeviceChallengeResponse

        // 3. Sign the challenge with device private key
        const signature = await signPayloadBase64(new TextEncoder().encode(nonce), keyPair)

        // 4. Register device with server
        const registerResponse = await fetchWithAuth('/api/v1/auth/devices', {
          method: 'POST',
          accessToken: input.accessToken,
          body: JSON.stringify({
            name: input.name,
            platform: input.platform,
            osVersion: input.osVersion,
            appVersion: input.appVersion,
            authPublicKey: publicKeyBase64,
            challengeNonce: nonce,
            challengeSignature: signature
          })
        })

        if (!registerResponse.ok) {
          const error = await registerResponse.json()
          throw new Error(error.message || 'Failed to register device')
        }

        const result: DeviceRegistrationResponse = await registerResponse.json()

        // 5. Store device ID in local SQLite (T050d)
        await setLocalConfig('device_id', result.device.id)

        // 6. Store device keypair in OS keychain
        await storeDeviceKeyPair(result.device.id, keyPair)

        // 7. Update current tokens
        currentAccessToken = result.accessToken
        currentRefreshToken = result.refreshToken

        // Store refresh token locally
        await setLocalConfig('refresh_token', result.refreshToken)

        emitAuthEvent(AuthChannels.events.SESSION_CHANGED, {
          isAuthenticated: true,
          deviceId: result.device.id
        })

        return result
      }
    )
  )

  // ============================================================================
  // First Device Setup (T050f)
  // ============================================================================

  ipcMain.handle(
    'auth:complete-setup',
    createValidatedHandler(
      FirstDeviceSetupRequestSchema,
      async (input): Promise<SetupCompleteResponse> => {
        // Send kdfSalt and keyVerifier to server
        const response = await fetchWithAuth('/api/v1/auth/setup', {
          method: 'POST',
          accessToken: input.accessToken,
          body: JSON.stringify({
            kdfSalt: input.kdfSalt,
            keyVerifier: input.keyVerifier
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to complete setup')
        }

        return { success: true }
      }
    )
  )

  // ============================================================================
  // Session Management
  // ============================================================================

  ipcMain.handle(
    AuthChannels.invoke.GET_SESSION,
    createHandler(async (): Promise<GetSessionResponse> => {
      try {
        // Check if we have stored credentials
        const hasKeys = await hasKeyMaterial()
        const deviceId = await getLocalConfig('device_id')
        const userId = await getLocalConfig('user_id')
        const refreshToken = await getLocalConfig('refresh_token')

        if (!hasKeys || !deviceId || !userId) {
          return { isAuthenticated: false }
        }

        // Try to get a fresh access token if we have a refresh token
        if (refreshToken && !currentAccessToken) {
          try {
            const response = await fetch(`${SYNC_SERVER_URL}/api/v1/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            })

            if (response.ok) {
              const result = await response.json()
              currentAccessToken = result.accessToken
              currentRefreshToken = result.refreshToken
              await setLocalConfig('refresh_token', result.refreshToken)
            }
          } catch {
            // Refresh failed - user needs to re-authenticate
          }
        }

        return {
          isAuthenticated: !!currentAccessToken,
          user: userId
            ? {
                id: userId,
                email: '',
                emailVerified: true,
                authMethod: 'email',
                storageUsed: 0,
                storageLimit: 0,
                createdAt: 0,
                updatedAt: 0
              }
            : undefined
        }
      } catch {
        return { isAuthenticated: false }
      }
    })
  )

  ipcMain.handle(
    AuthChannels.invoke.REFRESH_SESSION,
    createHandler(async (): Promise<{ success: boolean; error?: string }> => {
      try {
        const refreshToken = currentRefreshToken || (await getLocalConfig('refresh_token'))

        if (!refreshToken) {
          return { success: false, error: 'No refresh token available' }
        }

        const response = await fetch(`${SYNC_SERVER_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        })

        if (!response.ok) {
          const error = await response.json()
          emitAuthEvent(AuthChannels.events.SESSION_EXPIRED, {})
          return { success: false, error: error.message }
        }

        const result = await response.json()
        currentAccessToken = result.accessToken
        currentRefreshToken = result.refreshToken
        await setLocalConfig('refresh_token', result.refreshToken)

        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Refresh failed'
        }
      }
    })
  )

  ipcMain.handle(
    AuthChannels.invoke.LOGOUT,
    createHandler(async (): Promise<LogoutResponse> => {
      try {
        // Clear local state
        currentAccessToken = null
        currentRefreshToken = null
        currentUserId = null

        // Clear stored credentials
        await setLocalConfig('device_id', null)
        await setLocalConfig('user_id', null)
        await setLocalConfig('refresh_token', null)
        await deleteKeyMaterial()

        emitAuthEvent(AuthChannels.events.SESSION_CHANGED, {
          isAuthenticated: false
        })

        return { success: true }
      } catch {
        return { success: false }
      }
    })
  )

  ipcMain.handle(
    AuthChannels.invoke.GET_ACCESS_TOKEN,
    createHandler(async (): Promise<{ token: string | null }> => {
      return { token: currentAccessToken }
    })
  )

  console.log('[IPC] Auth handlers registered')
}

export function unregisterAuthHandlers(): void {
  const allChannels = [
    'auth:request-otp',
    'auth:verify-otp',
    'auth:resend-otp',
    'auth:register-device',
    'auth:complete-setup',
    ...Object.values(AuthChannels.invoke)
  ]

  allChannels.forEach((channel) => {
    ipcMain.removeHandler(channel)
  })

  if (oauthServer) {
    oauthServer.close()
    oauthServer = null
  }

  console.log('[IPC] Auth handlers unregistered')
}

// Export for external use
export { emitAuthEvent, currentAccessToken, currentUserId }
