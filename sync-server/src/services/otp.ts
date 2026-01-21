/**
 * T044, T044a, T044c: OTP Service
 *
 * Provides OTP code generation, hashing, verification, and attempt tracking.
 * Uses cryptographically secure random generation and SHA-256 hashing.
 */

import { OTP_SECURITY } from '../contracts/sync-api'
import { hashToken } from './auth'
import { otpInvalid, otpExpired, otpMaxAttempts, SyncError, ErrorCode } from '../lib/errors'

export interface OtpRecord {
  id: string
  email: string
  code_hash: string
  created_at: number
  expires_at: number
  attempts: number
  used: number
}

export interface CreateOtpResult {
  code: string
  expiresAt: number
  otpId: string
}

export type OtpVerifyResult =
  | { success: true; otpId: string; email: string }
  | { success: false; error: SyncError }

/**
 * Generate a cryptographically random 6-digit OTP code.
 * Uses crypto.getRandomValues() for secure randomness.
 */
export const generateOtpCode = (): string => {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const code = array[0] % 1000000
  return code.toString().padStart(6, '0')
}

/**
 * Hash an OTP code using SHA-256.
 * Reuses the hashToken function from auth service.
 */
export const hashOtpCode = hashToken

/**
 * Constant-time comparison of two hex strings.
 * Prevents timing attacks during OTP verification.
 */
const constantTimeCompare = (a: string, b: string): boolean => {
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
 * Invalidate all existing unused OTP codes for an email.
 * Called before creating a new OTP to ensure only one active code exists.
 */
export const invalidateExistingOtps = async (db: D1Database, email: string): Promise<void> => {
  await db
    .prepare(`UPDATE otp_codes SET used = 1 WHERE email = ? AND used = 0`)
    .bind(email)
    .run()
}

/**
 * Create a new OTP code for an email address.
 * Invalidates any existing unused codes first.
 *
 * @param db - D1 database
 * @param email - Email address to send OTP to
 * @returns Generated code and expiration time
 */
export const createOtp = async (db: D1Database, email: string): Promise<CreateOtpResult> => {
  await invalidateExistingOtps(db, email)

  const code = generateOtpCode()
  const codeHash = await hashOtpCode(code)
  const now = Date.now()
  const expiresAt = now + OTP_SECURITY.expiryMs
  const id = crypto.randomUUID()

  await db
    .prepare(
      `INSERT INTO otp_codes (id, email, code_hash, created_at, expires_at, attempts, used)
       VALUES (?, ?, ?, ?, ?, 0, 0)`
    )
    .bind(id, email, codeHash, now, expiresAt)
    .run()

  return { code, expiresAt, otpId: id }
}

/**
 * Increment attempt count for an OTP code.
 *
 * @param db - D1 database
 * @param otpId - OTP record ID
 * @returns Updated attempt count
 */
const incrementAttempts = async (db: D1Database, otpId: string): Promise<number> => {
  await db.prepare(`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?`).bind(otpId).run()

  const record = await db
    .prepare(`SELECT attempts FROM otp_codes WHERE id = ?`)
    .bind(otpId)
    .first<{ attempts: number }>()

  return record?.attempts ?? 0
}

/**
 * Mark an OTP code as used.
 *
 * @param db - D1 database
 * @param otpId - OTP record ID
 */
const markOtpUsed = async (db: D1Database, otpId: string): Promise<void> => {
  await db.prepare(`UPDATE otp_codes SET used = 1 WHERE id = ?`).bind(otpId).run()
}

/**
 * Verify an OTP code for an email address.
 * Tracks verification attempts and enforces attempt limits.
 *
 * @param db - D1 database
 * @param email - Email address
 * @param code - OTP code to verify
 * @returns Verification result with success status or error
 */
export const verifyOtp = async (
  db: D1Database,
  email: string,
  code: string
): Promise<OtpVerifyResult> => {
  const now = Date.now()

  const record = await db
    .prepare(
      `SELECT id, code_hash, expires_at, attempts, used
       FROM otp_codes
       WHERE email = ? AND used = 0
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .bind(email)
    .first<OtpRecord>()

  if (!record) {
    return { success: false, error: otpInvalid() }
  }

  if (record.expires_at < now) {
    return { success: false, error: otpExpired() }
  }

  if (record.attempts >= OTP_SECURITY.maxAttempts) {
    return { success: false, error: otpMaxAttempts() }
  }

  const attempts = await incrementAttempts(db, record.id)

  if (attempts > OTP_SECURITY.maxAttempts) {
    return { success: false, error: otpMaxAttempts() }
  }

  const inputHash = await hashOtpCode(code)
  const isValid = constantTimeCompare(inputHash, record.code_hash)

  if (!isValid) {
    return { success: false, error: otpInvalid() }
  }

  await markOtpUsed(db, record.id)

  return { success: true, otpId: record.id, email }
}

/**
 * Get the latest unused OTP for an email to check resend eligibility.
 *
 * @param db - D1 database
 * @param email - Email address
 * @returns OTP record or null
 */
export const getLatestOtp = async (
  db: D1Database,
  email: string
): Promise<Pick<OtpRecord, 'id' | 'created_at' | 'expires_at'> | null> => {
  return await db
    .prepare(
      `SELECT id, created_at, expires_at
       FROM otp_codes
       WHERE email = ? AND used = 0
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .bind(email)
    .first()
}

/**
 * Clean up expired OTP codes.
 * Should be called periodically via cron.
 *
 * @param db - D1 database
 * @returns Number of deleted records
 */
export const cleanupExpiredOtps = async (db: D1Database): Promise<number> => {
  const now = Date.now()
  const cutoff = now - OTP_SECURITY.expiryMs * 2 // Keep for 2x expiry for audit

  const result = await db
    .prepare(`DELETE FROM otp_codes WHERE expires_at < ?`)
    .bind(cutoff)
    .run()

  return result.meta.changes ?? 0
}
