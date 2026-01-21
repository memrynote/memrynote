/**
 * T050: Device Registration Endpoint
 * T050a: Require Device Signing Public Key
 * T050b: Device Registration Challenge/Response
 *
 * Implements secure device registration with Ed25519 challenge/response verification.
 */

import { badRequest, notFound, databaseError, forbidden } from '../lib/errors'

/**
 * Device challenge configuration.
 */
export const DEVICE_CONFIG = {
  CHALLENGE_EXPIRY_MS: 5 * 60 * 1000, // 5 minutes
  MAX_DEVICES_PER_USER: 10,
} as const

/**
 * Device record structure from database.
 */
export interface DeviceRecord {
  id: string
  user_id: string
  name: string
  platform: string
  os_version: string | null
  app_version: string
  auth_public_key: string
  last_sync_at: number | null
  created_at: number
  updated_at: number
  revoked_at: number | null
}

/**
 * Device challenge record structure.
 */
interface DeviceChallengeRecord {
  public_key: string
  nonce: string
  user_id: string
  expires_at: number
  created_at: number
}

/**
 * Public device data (safe to return in API responses).
 */
export interface DevicePublic {
  id: string
  name: string
  platform: string
  osVersion?: string
  appVersion: string
  lastSyncAt?: number
  createdAt: number
  updatedAt: number
  isCurrent?: boolean
}

/**
 * Input for creating a new device.
 */
export interface CreateDeviceInput {
  userId: string
  name: string
  platform: string
  osVersion?: string
  appVersion: string
  authPublicKey: string
}

/**
 * Input for updating a device.
 */
export interface UpdateDeviceInput {
  name?: string
  lastSyncAt?: number
}

/**
 * Convert a database record to public device format.
 */
function toPublicDevice(record: DeviceRecord, currentDeviceId?: string): DevicePublic {
  return {
    id: record.id,
    name: record.name,
    platform: record.platform,
    osVersion: record.os_version ?? undefined,
    appVersion: record.app_version,
    lastSyncAt: record.last_sync_at ?? undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    isCurrent: currentDeviceId ? record.id === currentDeviceId : undefined,
  }
}

/**
 * Create a device registration challenge.
 *
 * The client must sign this nonce with their device private key to prove
 * they own the corresponding public key.
 *
 * @param db - D1 database instance
 * @param userId - User ID requesting the challenge
 * @param publicKey - Device's Ed25519 public key (Base64)
 * @returns Challenge nonce
 */
export async function createDeviceChallenge(
  db: D1Database,
  userId: string,
  publicKey: string
): Promise<string> {
  const now = Date.now()

  // Clean up any existing challenge for this public key
  await db.prepare('DELETE FROM device_challenges WHERE public_key = ?').bind(publicKey).run()

  // Clean up expired challenges
  await db.prepare('DELETE FROM device_challenges WHERE expires_at < ?').bind(now).run()

  // Generate random nonce
  const nonce = crypto.randomUUID()
  const expiresAt = now + DEVICE_CONFIG.CHALLENGE_EXPIRY_MS

  const result = await db
    .prepare(
      `
      INSERT INTO device_challenges (public_key, nonce, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `
    )
    .bind(publicKey, nonce, userId, expiresAt, now)
    .run()

  if (!result.success) {
    throw databaseError('Failed to create device challenge')
  }

  return nonce
}

/**
 * Verify a device registration challenge signature.
 *
 * @param db - D1 database instance
 * @param publicKey - Device's Ed25519 public key (Base64)
 * @param nonce - Challenge nonce
 * @param signature - Signature over the nonce (Base64)
 * @param userId - Expected user ID
 * @returns True if verification succeeded
 */
export async function verifyDeviceChallenge(
  db: D1Database,
  publicKey: string,
  nonce: string,
  signature: string,
  userId: string
): Promise<boolean> {
  const now = Date.now()

  // Get the challenge
  const challenge = await db
    .prepare(
      `
      SELECT nonce, user_id, expires_at
      FROM device_challenges
      WHERE public_key = ?
    `
    )
    .bind(publicKey)
    .first<DeviceChallengeRecord>()

  if (!challenge) {
    return false
  }

  // Delete the challenge (one-time use)
  await db.prepare('DELETE FROM device_challenges WHERE public_key = ?').bind(publicKey).run()

  // Check expiry
  if (challenge.expires_at < now) {
    return false
  }

  // Check nonce matches
  if (challenge.nonce !== nonce) {
    return false
  }

  // Check user matches
  if (challenge.user_id !== userId) {
    return false
  }

  // Verify Ed25519 signature
  try {
    const publicKeyBytes = base64ToUint8Array(publicKey)
    const nonceBytes = new TextEncoder().encode(nonce)
    const signatureBytes = base64ToUint8Array(signature)

    const key = await crypto.subtle.importKey('raw', publicKeyBytes, 'Ed25519', false, ['verify'])

    const isValid = await crypto.subtle.verify('Ed25519', key, signatureBytes, nonceBytes)

    return isValid
  } catch {
    return false
  }
}

/**
 * Create a new device in the database.
 *
 * @param db - D1 database instance
 * @param input - Device creation input
 * @returns Created device's public data
 */
export async function createDevice(db: D1Database, input: CreateDeviceInput): Promise<DevicePublic> {
  const now = Date.now()

  // Check if user has too many devices
  const deviceCount = await db
    .prepare('SELECT COUNT(*) as count FROM devices WHERE user_id = ? AND revoked_at IS NULL')
    .bind(input.userId)
    .first<{ count: number }>()

  if (deviceCount && deviceCount.count >= DEVICE_CONFIG.MAX_DEVICES_PER_USER) {
    throw forbidden(`Maximum of ${DEVICE_CONFIG.MAX_DEVICES_PER_USER} devices allowed`)
  }

  // Check if public key is already registered (prevent duplicate registrations)
  const existingDevice = await db
    .prepare('SELECT id FROM devices WHERE auth_public_key = ?')
    .bind(input.authPublicKey)
    .first()

  if (existingDevice) {
    throw badRequest('Device with this public key is already registered')
  }

  const id = crypto.randomUUID()

  const result = await db
    .prepare(
      `
      INSERT INTO devices (
        id, user_id, name, platform, os_version, app_version,
        auth_public_key, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
    .bind(
      id,
      input.userId,
      input.name,
      input.platform,
      input.osVersion ?? null,
      input.appVersion,
      input.authPublicKey,
      now,
      now
    )
    .run()

  if (!result.success) {
    throw databaseError('Failed to create device')
  }

  // Initialize device sync state
  await db
    .prepare(
      `
      INSERT INTO device_sync_state (device_id, user_id, last_cursor_seen, updated_at)
      VALUES (?, ?, 0, ?)
    `
    )
    .bind(id, input.userId, now)
    .run()

  const device = await getDeviceById(db, id)
  if (!device) {
    throw databaseError('Device created but not found')
  }

  return device
}

/**
 * Get a device by its ID.
 *
 * @param db - D1 database instance
 * @param id - Device ID
 * @returns Device's public data or null if not found
 */
export async function getDeviceById(db: D1Database, id: string): Promise<DevicePublic | null> {
  const record = await db
    .prepare('SELECT * FROM devices WHERE id = ? AND revoked_at IS NULL')
    .bind(id)
    .first<DeviceRecord>()

  return record ? toPublicDevice(record) : null
}

/**
 * Get all devices for a user.
 *
 * @param db - D1 database instance
 * @param userId - User ID
 * @param currentDeviceId - Current device ID (for marking as current)
 * @returns Array of device public data
 */
export async function getDevicesByUserId(
  db: D1Database,
  userId: string,
  currentDeviceId?: string
): Promise<DevicePublic[]> {
  const result = await db
    .prepare(
      `
      SELECT * FROM devices
      WHERE user_id = ? AND revoked_at IS NULL
      ORDER BY created_at DESC
    `
    )
    .bind(userId)
    .all<DeviceRecord>()

  return (result.results ?? []).map((r) => toPublicDevice(r, currentDeviceId))
}

/**
 * Update a device's data.
 *
 * @param db - D1 database instance
 * @param id - Device ID
 * @param userId - User ID (for authorization)
 * @param input - Fields to update
 * @returns Updated device's public data
 */
export async function updateDevice(
  db: D1Database,
  id: string,
  userId: string,
  input: UpdateDeviceInput
): Promise<DevicePublic> {
  const now = Date.now()

  // Verify device belongs to user
  const device = await db
    .prepare('SELECT * FROM devices WHERE id = ? AND user_id = ? AND revoked_at IS NULL')
    .bind(id, userId)
    .first<DeviceRecord>()

  if (!device) {
    throw notFound('Device')
  }

  const updates: string[] = ['updated_at = ?']
  const values: (string | number | null)[] = [now]

  if (input.name !== undefined) {
    updates.push('name = ?')
    values.push(input.name)
  }

  if (input.lastSyncAt !== undefined) {
    updates.push('last_sync_at = ?')
    values.push(input.lastSyncAt)
  }

  values.push(id)

  const result = await db
    .prepare(`UPDATE devices SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()

  if (!result.success) {
    throw databaseError('Failed to update device')
  }

  const updated = await getDeviceById(db, id)
  if (!updated) {
    throw notFound('Device')
  }

  return updated
}

/**
 * Revoke (soft delete) a device.
 *
 * @param db - D1 database instance
 * @param id - Device ID
 * @param userId - User ID (for authorization)
 * @returns True if device was revoked
 */
export async function revokeDevice(db: D1Database, id: string, userId: string): Promise<boolean> {
  const now = Date.now()

  // Verify device belongs to user
  const device = await db
    .prepare('SELECT * FROM devices WHERE id = ? AND user_id = ? AND revoked_at IS NULL')
    .bind(id, userId)
    .first<DeviceRecord>()

  if (!device) {
    throw notFound('Device')
  }

  const result = await db
    .prepare('UPDATE devices SET revoked_at = ?, updated_at = ? WHERE id = ?')
    .bind(now, now, id)
    .run()

  return (result.meta.changes ?? 0) > 0
}

/**
 * Get device public key (for signature verification).
 *
 * @param db - D1 database instance
 * @param deviceId - Device ID
 * @returns Public key (Base64) or null if device not found
 */
export async function getDevicePublicKey(
  db: D1Database,
  deviceId: string
): Promise<string | null> {
  const record = await db
    .prepare('SELECT auth_public_key FROM devices WHERE id = ? AND revoked_at IS NULL')
    .bind(deviceId)
    .first<{ auth_public_key: string }>()

  return record?.auth_public_key ?? null
}

/**
 * Update device's last sync timestamp.
 *
 * @param db - D1 database instance
 * @param deviceId - Device ID
 */
export async function updateDeviceLastSync(db: D1Database, deviceId: string): Promise<void> {
  const now = Date.now()

  await db
    .prepare('UPDATE devices SET last_sync_at = ?, updated_at = ? WHERE id = ?')
    .bind(now, now, deviceId)
    .run()
}

/**
 * Clean up expired device challenges.
 *
 * @param db - D1 database instance
 * @returns Number of deleted records
 */
export async function cleanupDeviceChallenges(db: D1Database): Promise<number> {
  const now = Date.now()

  const result = await db
    .prepare('DELETE FROM device_challenges WHERE expires_at < ?')
    .bind(now)
    .run()

  return result.meta.changes ?? 0
}

/**
 * Base64 to Uint8Array conversion helper.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}
