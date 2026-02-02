/**
 * Token Utilities
 *
 * Helpers for decoding and validating access tokens.
 *
 * @module sync/token-utils
 */

const EXPIRY_SKEW_MS = 30_000

interface JwtPayload {
  exp?: number
}

export function getAccessTokenExpiryMs(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const decoded = Buffer.from(payload, 'base64url').toString('utf8')
    const parsed = JSON.parse(decoded) as JwtPayload
    if (typeof parsed.exp !== 'number') return null

    return parsed.exp * 1000
  } catch {
    return null
  }
}

export function isAccessTokenExpired(token: string, nowMs: number = Date.now()): boolean {
  const expMs = getAccessTokenExpiryMs(token)
  if (!expMs) return true
  return expMs - EXPIRY_SKEW_MS <= nowMs
}
