/**
 * Linking API Contracts
 *
 * Defines request/response schemas for device linking endpoints.
 *
 * NOTE: This file is derived from src/shared/contracts/linking-api.ts
 * Keep in sync with the client-side contract.
 */

import { z } from 'zod'
import { LINKING_SESSION_STATUS, DeviceSchema } from './sync-api'

// =============================================================================
// Common Schemas
// =============================================================================

const Base64Schema = z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/, 'Invalid Base64 string')
const UuidSchema = z.uuid()

// =============================================================================
// Constants
// =============================================================================

export const LINKING_CONSTANTS = {
  SESSION_EXPIRY_MS: 10 * 60 * 1000,
  QR_REFRESH_INTERVAL_MS: 30 * 1000,
  EPHEMERAL_KEY_SIZE: 32
} as const

// =============================================================================
// Initiate Linking (Existing Device)
// =============================================================================

export const LinkingInitiateRequestSchema = z.object({
  deviceId: UuidSchema
})
export type LinkingInitiateRequest = z.infer<typeof LinkingInitiateRequestSchema>

export const LinkingInitiateResponseSchema = z.object({
  sessionId: UuidSchema,
  ephemeralPublicKey: Base64Schema,
  qrPayload: z.string(),
  expiresAt: z.number().int().positive()
})
export type LinkingInitiateResponse = z.infer<typeof LinkingInitiateResponseSchema>

// =============================================================================
// Scan QR Code (New Device)
// =============================================================================

export const LinkingScanRequestSchema = z.object({
  sessionId: UuidSchema,
  newDevicePublicKey: Base64Schema,
  newDeviceConfirm: Base64Schema
})
export type LinkingScanRequest = z.infer<typeof LinkingScanRequestSchema>

export const LinkingScanResponseSchema = z.object({
  status: z.literal('scanned')
})
export type LinkingScanResponse = z.infer<typeof LinkingScanResponseSchema>

// =============================================================================
// Approve Linking (Existing Device)
// =============================================================================

export const LinkingApproveRequestSchema = z.object({
  sessionId: UuidSchema,
  encryptedMasterKey: Base64Schema,
  encryptedKeyNonce: Base64Schema,
  keyConfirm: Base64Schema
})
export type LinkingApproveRequest = z.infer<typeof LinkingApproveRequestSchema>

export const LinkingApproveResponseSchema = z.object({
  status: z.literal('approved')
})
export type LinkingApproveResponse = z.infer<typeof LinkingApproveResponseSchema>

// =============================================================================
// Complete Linking (New Device)
// =============================================================================

export const LinkingCompleteRequestSchema = z.object({
  sessionId: UuidSchema,
  newDeviceConfirm: Base64Schema
})
export type LinkingCompleteRequest = z.infer<typeof LinkingCompleteRequestSchema>

export const LinkingCompleteResponseSchema = z.object({
  encryptedMasterKey: Base64Schema,
  encryptedKeyNonce: Base64Schema,
  keyConfirm: Base64Schema,
  device: DeviceSchema
})
export type LinkingCompleteResponse = z.infer<typeof LinkingCompleteResponseSchema>

// =============================================================================
// Session Status
// =============================================================================

export const LinkingStatusParamsSchema = z.object({
  sessionId: UuidSchema
})
export type LinkingStatusParams = z.infer<typeof LinkingStatusParamsSchema>

export const LinkingSessionSchema = z.object({
  id: UuidSchema,
  initiatorDeviceId: UuidSchema,
  ephemeralPublicKey: Base64Schema,
  newDevicePublicKey: Base64Schema.optional(),
  status: z.enum(LINKING_SESSION_STATUS),
  createdAt: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
  completedAt: z.number().int().positive().optional()
})
export type LinkingSession = z.infer<typeof LinkingSessionSchema>

export const LinkingStatusResponseSchema = LinkingSessionSchema
export type LinkingStatusResponse = z.infer<typeof LinkingStatusResponseSchema>

// =============================================================================
// Cancel Linking
// =============================================================================

export const LinkingCancelParamsSchema = z.object({
  sessionId: UuidSchema
})
export type LinkingCancelParams = z.infer<typeof LinkingCancelParamsSchema>

export const LinkingCancelResponseSchema = z.object({
  success: z.boolean()
})
export type LinkingCancelResponse = z.infer<typeof LinkingCancelResponseSchema>

// =============================================================================
// QR Payload
// =============================================================================

export const LinkingQRPayloadSchema = z.object({
  sessionId: UuidSchema,
  token: z.string().min(32),
  ephemeralPublicKey: Base64Schema,
  serverUrl: z.string().url()
})
export type LinkingQRPayload = z.infer<typeof LinkingQRPayloadSchema>

// =============================================================================
// Helper Functions
// =============================================================================

export function validateLinkingInitiateRequest(data: unknown): LinkingInitiateRequest {
  return LinkingInitiateRequestSchema.parse(data)
}

export function validateLinkingScanRequest(data: unknown): LinkingScanRequest {
  return LinkingScanRequestSchema.parse(data)
}

export function validateLinkingApproveRequest(data: unknown): LinkingApproveRequest {
  return LinkingApproveRequestSchema.parse(data)
}

export function validateLinkingCompleteRequest(data: unknown): LinkingCompleteRequest {
  return LinkingCompleteRequestSchema.parse(data)
}

export function validateLinkingQRPayload(data: unknown): LinkingQRPayload {
  return LinkingQRPayloadSchema.parse(data)
}
