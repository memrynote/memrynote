/**
 * Sync API Contracts
 *
 * Defines core types and schemas for the sync engine.
 *
 * NOTE: This file is derived from src/shared/contracts/sync-api.ts
 * Keep in sync with the client-side contract.
 */

import { z } from 'zod'

// =============================================================================
// Constants
// =============================================================================

export const SYNC_ITEM_TYPES = [
  'task',
  'note',
  'inbox',
  'filter',
  'project',
  'settings',
  'journal'
] as const
export type SyncItemType = (typeof SYNC_ITEM_TYPES)[number]

export const SYNC_OPERATIONS = ['create', 'update', 'delete'] as const
export type SyncOperation = (typeof SYNC_OPERATIONS)[number]

export const DEVICE_PLATFORMS = ['macos', 'windows', 'linux', 'ios', 'android'] as const
export type DevicePlatform = (typeof DEVICE_PLATFORMS)[number]

export const AUTH_METHODS = ['email', 'oauth'] as const
export type AuthMethod = (typeof AUTH_METHODS)[number]

export const AUTH_PROVIDERS = ['google'] as const
export type AuthProvider = (typeof AUTH_PROVIDERS)[number]

export const LINKING_SESSION_STATUS = [
  'pending',
  'scanned',
  'approved',
  'completed',
  'expired'
] as const
export type LinkingSessionStatus = (typeof LINKING_SESSION_STATUS)[number]

// =============================================================================
// Common Schemas
// =============================================================================

const Base64Schema = z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/, 'Invalid Base64 string')
const UuidSchema = z.string().uuid()

export const VectorClockSchema = z.record(z.string(), z.number().int().nonnegative())
export type VectorClock = z.infer<typeof VectorClockSchema>

// =============================================================================
// User Types
// =============================================================================

export const UserSchema = z.object({
  id: UuidSchema,
  email: z.string().email().max(255),
  emailVerified: z.boolean(),
  authMethod: z.enum(AUTH_METHODS),
  authProvider: z.enum(AUTH_PROVIDERS).optional(),
  authProviderId: z.string().optional(),
  kdfSalt: Base64Schema.optional(),
  keyVerifier: Base64Schema.optional(),
  storageUsed: z.number().int().nonnegative(),
  storageLimit: z.number().int().positive(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive()
})

export type User = z.infer<typeof UserSchema>

export const UserPublicSchema = UserSchema.omit({
  kdfSalt: true,
  keyVerifier: true,
  authProviderId: true
})

export type UserPublic = z.infer<typeof UserPublicSchema>

// =============================================================================
// Device Types
// =============================================================================

export const DeviceSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema.optional(),
  name: z.string().min(1).max(100),
  platform: z.enum(DEVICE_PLATFORMS),
  osVersion: z.string().optional(),
  appVersion: z.string(),
  authPublicKey: Base64Schema,
  linkedAt: z.number().int().positive(),
  lastSyncAt: z.number().int().positive().optional(),
  isCurrentDevice: z.boolean().optional(),
  revokedAt: z.number().int().positive().optional()
})

export type Device = z.infer<typeof DeviceSchema>

// =============================================================================
// Sync Item Schemas
// =============================================================================

export const SyncItemPushSchema = z.object({
  itemType: z.enum(SYNC_ITEM_TYPES),
  itemId: UuidSchema,
  encryptedData: Base64Schema,
  encryptedKey: Base64Schema,
  keyNonce: Base64Schema,
  dataNonce: Base64Schema,
  clock: VectorClockSchema.optional(),
  stateVector: Base64Schema.optional(),
  deleted: z.boolean(),
  cryptoVersion: z.number().int().positive(),
  sizeBytes: z.number().int().nonnegative(),
  contentHash: z.string(),
  signerDeviceId: UuidSchema,
  signature: Base64Schema
})

export type SyncItemPush = z.infer<typeof SyncItemPushSchema>

export const SyncItemResponseSchema = z.object({
  itemType: z.enum(SYNC_ITEM_TYPES),
  itemId: UuidSchema,
  userId: UuidSchema,
  encryptedData: Base64Schema,
  encryptedKey: Base64Schema,
  keyNonce: Base64Schema,
  dataNonce: Base64Schema,
  clock: VectorClockSchema.optional(),
  stateVector: Base64Schema.optional(),
  deleted: z.boolean(),
  cryptoVersion: z.number().int().positive(),
  sizeBytes: z.number().int().nonnegative(),
  contentHash: z.string(),
  signerDeviceId: UuidSchema,
  signature: Base64Schema,
  serverCursor: z.number().int().nonnegative(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive()
})

export type SyncItemResponse = z.infer<typeof SyncItemResponseSchema>

// =============================================================================
// API Request/Response Types
// =============================================================================

export const PushSyncRequestSchema = z.object({
  items: z.array(SyncItemPushSchema),
  deviceClock: VectorClockSchema
})

export type PushSyncRequest = z.infer<typeof PushSyncRequestSchema>

export const PushSyncResponseSchema = z.object({
  accepted: z.array(UuidSchema),
  rejected: z.array(
    z.object({
      itemId: UuidSchema,
      reason: z.string()
    })
  ),
  conflicts: z.array(
    z.object({
      itemId: UuidSchema,
      serverItem: SyncItemResponseSchema
    })
  ),
  serverCursor: z.number().int().nonnegative()
})

export type PushSyncResponse = z.infer<typeof PushSyncResponseSchema>

export const PullSyncRequestSchema = z.object({
  cursor: z.number().int().nonnegative(),
  limit: z.number().int().positive().max(100).default(50),
  types: z.array(z.enum(SYNC_ITEM_TYPES)).optional()
})

export type PullSyncRequest = z.infer<typeof PullSyncRequestSchema>

export const PullSyncResponseSchema = z.object({
  items: z.array(SyncItemResponseSchema),
  hasMore: z.boolean(),
  nextCursor: z.number().int().nonnegative(),
  serverTime: z.number().int().positive()
})

export type PullSyncResponse = z.infer<typeof PullSyncResponseSchema>

export const SyncStatusResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'maintenance']),
  serverCursor: z.number().int().nonnegative(),
  pendingItems: z.number().int().nonnegative(),
  lastSyncAt: z.number().int().positive().optional(),
  storageUsed: z.number().int().nonnegative(),
  storageLimit: z.number().int().positive()
})

export type SyncStatusResponse = z.infer<typeof SyncStatusResponseSchema>

// =============================================================================
// OTP Types
// =============================================================================

export const OTP_SECURITY = {
  codeLength: 6,
  codeMin: 0,
  codeMax: 999999,
  expiryMs: 10 * 60 * 1000,
  maxAttempts: 5,
  rateLimitRequests: 3,
  rateLimitWindowMs: 10 * 60 * 1000
} as const

// =============================================================================
// Helper Functions
// =============================================================================

export function validateSyncItemPush(item: unknown): SyncItemPush {
  return SyncItemPushSchema.parse(item)
}

export function validatePushRequest(request: unknown): PushSyncRequest {
  return PushSyncRequestSchema.parse(request)
}

export function validatePullRequest(request: unknown): PullSyncRequest {
  return PullSyncRequestSchema.parse(request)
}
