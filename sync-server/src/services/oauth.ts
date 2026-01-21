/**
 * T048: OAuth Initiation
 * T049: OAuth Callback Handler
 * T049a: OAuth State Parameter Validation (CSRF Protection)
 *
 * Implements Google OAuth 2.0 with PKCE for secure authentication.
 */

import { badRequest, databaseError } from '../lib/errors'

/**
 * OAuth configuration constants.
 */
export const OAUTH_CONFIG = {
  STATE_EXPIRY_MS: 10 * 60 * 1000, // 10 minutes
  CODE_VERIFIER_LENGTH: 64,
  GOOGLE_AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  GOOGLE_TOKEN_URL: 'https://oauth2.googleapis.com/token',
  GOOGLE_USERINFO_URL: 'https://www.googleapis.com/oauth2/v2/userinfo',
} as const

/**
 * OAuth state record structure.
 */
interface OAuthStateRecord {
  state: string
  code_verifier: string
  redirect_uri: string
  created_at: number
  expires_at: number
}

/**
 * Google user info response.
 */
export interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name?: string
  picture?: string
}

/**
 * OAuth initiation result.
 */
export interface OAuthInitResult {
  authUrl: string
  state: string
}

/**
 * OAuth token response from Google.
 */
interface GoogleTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
  id_token?: string
}

/**
 * Generate a cryptographically secure random string.
 *
 * @param length - Length of the string to generate
 * @returns Random hex string
 */
function generateSecureRandom(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2))
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length)
}

/**
 * Generate PKCE code verifier.
 *
 * A high-entropy cryptographic random string using unreserved characters.
 *
 * @returns Code verifier string (43-128 characters)
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64UrlEncode(array)
}

/**
 * Generate PKCE code challenge from verifier.
 *
 * code_challenge = BASE64URL(SHA256(code_verifier))
 *
 * @param verifier - Code verifier string
 * @returns Code challenge string
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(hash))
}

/**
 * Base64 URL encode (RFC 4648).
 *
 * @param data - Data to encode
 * @returns Base64 URL encoded string
 */
function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Store OAuth state for CSRF protection.
 *
 * The state parameter is stored with the code verifier to validate the callback
 * and complete PKCE flow.
 *
 * @param db - D1 database instance
 * @param state - Random state token
 * @param codeVerifier - PKCE code verifier
 * @param redirectUri - Redirect URI for the callback
 */
export async function storeOAuthState(
  db: D1Database,
  state: string,
  codeVerifier: string,
  redirectUri: string
): Promise<void> {
  const now = Date.now()
  const expiresAt = now + OAUTH_CONFIG.STATE_EXPIRY_MS

  // Clean up any existing expired states first
  await db.prepare('DELETE FROM oauth_states WHERE expires_at < ?').bind(now).run()

  const result = await db
    .prepare(
      `
      INSERT INTO oauth_states (state, code_verifier, redirect_uri, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `
    )
    .bind(state, codeVerifier, redirectUri, now, expiresAt)
    .run()

  if (!result.success) {
    throw databaseError('Failed to store OAuth state')
  }
}

/**
 * Validate and retrieve OAuth state.
 *
 * The state is deleted after retrieval (one-time use) to prevent replay attacks.
 *
 * @param db - D1 database instance
 * @param state - State token from callback
 * @returns State record with code verifier
 * @throws SyncError if state is invalid or expired
 */
export async function validateOAuthState(
  db: D1Database,
  state: string
): Promise<{ codeVerifier: string; redirectUri: string }> {
  const now = Date.now()

  const record = await db
    .prepare(
      `
      SELECT state, code_verifier, redirect_uri, expires_at
      FROM oauth_states
      WHERE state = ?
    `
    )
    .bind(state)
    .first<OAuthStateRecord>()

  if (!record) {
    throw badRequest('Invalid OAuth state parameter')
  }

  // Delete the state immediately (one-time use)
  await db.prepare('DELETE FROM oauth_states WHERE state = ?').bind(state).run()

  if (record.expires_at < now) {
    throw badRequest('OAuth state has expired')
  }

  return {
    codeVerifier: record.code_verifier,
    redirectUri: record.redirect_uri,
  }
}

/**
 * Build Google OAuth authorization URL.
 *
 * @param params - OAuth parameters
 * @returns Authorization URL
 */
export function buildGoogleAuthUrl(params: {
  clientId: string
  redirectUri: string
  state: string
  codeChallenge: string
  scope?: string
}): string {
  const url = new URL(OAUTH_CONFIG.GOOGLE_AUTH_URL)

  url.searchParams.set('client_id', params.clientId)
  url.searchParams.set('redirect_uri', params.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', params.scope ?? 'email profile')
  url.searchParams.set('state', params.state)
  url.searchParams.set('code_challenge', params.codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')

  return url.toString()
}

/**
 * Initiate OAuth flow for Google.
 *
 * @param db - D1 database instance
 * @param clientId - Google OAuth client ID
 * @param redirectUri - Callback URL
 * @returns Authorization URL and state
 */
export async function initiateGoogleOAuth(
  db: D1Database,
  clientId: string,
  redirectUri: string
): Promise<OAuthInitResult> {
  const state = generateSecureRandom(32)
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Store state for validation in callback
  await storeOAuthState(db, state, codeVerifier, redirectUri)

  const authUrl = buildGoogleAuthUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge,
  })

  return { authUrl, state }
}

/**
 * Exchange authorization code for tokens.
 *
 * @param code - Authorization code from callback
 * @param codeVerifier - PKCE code verifier
 * @param clientId - Google OAuth client ID
 * @param clientSecret - Google OAuth client secret
 * @param redirectUri - Callback URL (must match initiation)
 * @returns Token response
 */
export async function exchangeGoogleCode(
  code: string,
  codeVerifier: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<GoogleTokenResponse> {
  const response = await fetch(OAUTH_CONFIG.GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw badRequest(`Failed to exchange OAuth code: ${error}`)
  }

  return await response.json()
}

/**
 * Get user info from Google.
 *
 * @param accessToken - Google access token
 * @returns Google user info
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(OAUTH_CONFIG.GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw badRequest('Failed to get Google user info')
  }

  return await response.json()
}

/**
 * Clean up expired OAuth states.
 *
 * @param db - D1 database instance
 * @returns Number of deleted records
 */
export async function cleanupExpiredOAuthStates(db: D1Database): Promise<number> {
  const now = Date.now()

  const result = await db.prepare('DELETE FROM oauth_states WHERE expires_at < ?').bind(now).run()

  return result.meta.changes ?? 0
}
