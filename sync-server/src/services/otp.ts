/**
 * T044: OTP Generation Service
 * T044a: OTP Storage with SHA-256 Hashing
 * T044c: OTP Attempt Tracking
 *
 * Implements OTP (One-Time Password) generation, secure storage, and verification
 * for passwordless email authentication.
 */

import { otpInvalid, otpExpired, otpMaxAttempts, databaseError } from '../lib/errors'

/**
 * OTP configuration constants.
 */
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MS: 10 * 60 * 1000, // 10 minutes
  MAX_ATTEMPTS: 5,
  RATE_LIMIT_REQUESTS: 3,
  RATE_LIMIT_WINDOW_MS: 10 * 60 * 1000, // 10 minutes
  RESEND_COOLDOWN_MS: 60 * 1000, // 60 seconds
} as const

/**
 * OTP record structure from database.
 */
interface OtpRecord {
  id: string
  email: string
  code_hash: string
  created_at: number
  expires_at: number
  attempts: number
  used: number
}

/**
 * Result of OTP verification.
 */
export interface OtpVerifyResult {
  valid: boolean
  otpId: string
}

/**
 * Generate a cryptographically secure 6-digit OTP code.
 *
 * Uses Web Crypto API for secure random number generation.
 *
 * @returns 6-digit OTP code as a string (padded with leading zeros if needed)
 */
export function generateOtpCode(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const code = array[0] % 1000000
  return code.toString().padStart(OTP_CONFIG.LENGTH, '0')
}

/**
 * Hash an OTP code using SHA-256.
 *
 * Codes are never stored in plaintext to prevent exposure in case of database breach.
 *
 * @param code - The OTP code to hash
 * @returns Hex-encoded SHA-256 hash
 */
export async function hashOtpCode(code: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(code)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Perform constant-time comparison of two strings.
 *
 * Prevents timing attacks by always comparing all characters.
 *
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/**
 * Store a new OTP code in the database.
 *
 * Deletes any existing unused OTP for the same email before creating a new one.
 * This prevents OTP flooding and ensures only one valid code exists per email.
 *
 * @param db - D1 database instance
 * @param email - Email address to associate with the OTP
 * @param code - The plaintext OTP code (will be hashed before storage)
 * @returns Object with OTP ID and expiration timestamp
 */
export async function storeOtpCode(
  db: D1Database,
  email: string,
  code: string
): Promise<{ id: string; expiresAt: number }> {
  const normalizedEmail = email.toLowerCase().trim()

  // Delete any existing unused OTPs for this email
  await db.prepare('DELETE FROM otp_codes WHERE email = ? AND used = 0').bind(normalizedEmail).run()

  const id = crypto.randomUUID()
  const codeHash = await hashOtpCode(code)
  const now = Date.now()
  const expiresAt = now + OTP_CONFIG.EXPIRY_MS

  const result = await db
    .prepare(
      `
      INSERT INTO otp_codes (id, email, code_hash, created_at, expires_at, attempts, used)
      VALUES (?, ?, ?, ?, ?, 0, 0)
    `
    )
    .bind(id, normalizedEmail, codeHash, now, expiresAt)
    .run()

  if (!result.success) {
    throw databaseError('Failed to store OTP code')
  }

  return { id, expiresAt }
}

/**
 * Verify an OTP code submitted by the user.
 *
 * Security measures:
 * - Increments attempt counter BEFORE checking code (prevents timing attacks)
 * - Uses constant-time comparison for hash verification
 * - Invalidates code after max attempts exceeded
 * - Marks code as used after successful verification
 *
 * @param db - D1 database instance
 * @param email - Email address to verify
 * @param code - The submitted OTP code
 * @returns Verification result with OTP ID
 * @throws SyncError if verification fails
 */
export async function verifyOtpCode(
  db: D1Database,
  email: string,
  code: string
): Promise<OtpVerifyResult> {
  const normalizedEmail = email.toLowerCase().trim()
  const now = Date.now()

  // Find the most recent unused OTP for this email
  const record = await db
    .prepare(
      `
      SELECT id, code_hash, expires_at, attempts, used
      FROM otp_codes
      WHERE email = ? AND used = 0
      ORDER BY created_at DESC
      LIMIT 1
    `
    )
    .bind(normalizedEmail)
    .first<OtpRecord>()

  if (!record) {
    throw otpInvalid()
  }

  // Check if already expired
  if (record.expires_at < now) {
    throw otpExpired()
  }

  // Increment attempts BEFORE checking (security: prevents timing attacks)
  await db
    .prepare('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?')
    .bind(record.id)
    .run()

  // Check if max attempts exceeded (use current attempts + 1)
  if (record.attempts + 1 > OTP_CONFIG.MAX_ATTEMPTS) {
    // Mark as used to invalidate
    await db.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').bind(record.id).run()
    throw otpMaxAttempts()
  }

  // Hash the submitted code and compare
  const submittedHash = await hashOtpCode(code)

  if (!timingSafeEqual(submittedHash, record.code_hash)) {
    throw otpInvalid()
  }

  // Mark OTP as used
  await db.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').bind(record.id).run()

  return { valid: true, otpId: record.id }
}

/**
 * Check if an OTP can be resent (cooldown period has passed).
 *
 * @param db - D1 database instance
 * @param email - Email address to check
 * @returns Object with canResend flag and remainingMs if in cooldown
 */
export async function canResendOtp(
  db: D1Database,
  email: string
): Promise<{ canResend: boolean; remainingMs?: number }> {
  const normalizedEmail = email.toLowerCase().trim()
  const now = Date.now()

  // Find the most recent OTP for this email
  const record = await db
    .prepare(
      `
      SELECT created_at
      FROM otp_codes
      WHERE email = ?
      ORDER BY created_at DESC
      LIMIT 1
    `
    )
    .bind(normalizedEmail)
    .first<{ created_at: number }>()

  if (!record) {
    return { canResend: true }
  }

  const cooldownEnd = record.created_at + OTP_CONFIG.RESEND_COOLDOWN_MS
  if (now < cooldownEnd) {
    return { canResend: false, remainingMs: cooldownEnd - now }
  }

  return { canResend: true }
}

/**
 * Get OTP status for an email (for debugging/admin purposes).
 *
 * @param db - D1 database instance
 * @param email - Email address to check
 * @returns OTP status or null if none exists
 */
export async function getOtpStatus(
  db: D1Database,
  email: string
): Promise<{
  exists: boolean
  attempts?: number
  expiresAt?: number
  expired?: boolean
  used?: boolean
} | null> {
  const normalizedEmail = email.toLowerCase().trim()
  const now = Date.now()

  const record = await db
    .prepare(
      `
      SELECT attempts, expires_at, used
      FROM otp_codes
      WHERE email = ?
      ORDER BY created_at DESC
      LIMIT 1
    `
    )
    .bind(normalizedEmail)
    .first<{ attempts: number; expires_at: number; used: number }>()

  if (!record) {
    return { exists: false }
  }

  return {
    exists: true,
    attempts: record.attempts,
    expiresAt: record.expires_at,
    expired: record.expires_at < now,
    used: record.used === 1,
  }
}

/**
 * Clean up expired OTP codes.
 *
 * Should be called periodically (e.g., via cron job) to remove old codes.
 *
 * @param db - D1 database instance
 * @param retainUsedForMs - How long to retain used codes (for audit, default 1 hour)
 * @returns Number of deleted records
 */
export async function cleanupExpiredOtps(
  db: D1Database,
  retainUsedForMs: number = 60 * 60 * 1000
): Promise<number> {
  const now = Date.now()
  const usedCleanupTime = now - retainUsedForMs

  // Delete expired unused codes and old used codes
  const result = await db
    .prepare(
      `
      DELETE FROM otp_codes
      WHERE (expires_at < ? AND used = 0)
         OR (used = 1 AND created_at < ?)
    `
    )
    .bind(now, usedCleanupTime)
    .run()

  return result.meta.changes ?? 0
}
