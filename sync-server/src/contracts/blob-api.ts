/**
 * Blob API Contracts
 *
 * Defines request/response schemas for all blob (attachment) endpoints.
 *
 * NOTE: This file is derived from src/shared/contracts/blob-api.ts
 * Keep in sync with the client-side contract.
 */

import { z } from 'zod'

// =============================================================================
// Common Schemas
// =============================================================================

const Base64Schema = z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/, 'Invalid Base64 string')
const UuidSchema = z.uuid()
const HashSchema = z
  .string()
  .length(64)
  .regex(/^[a-f0-9]{64}$/, 'Invalid SHA-256 hash')

// =============================================================================
// Constants
// =============================================================================

export const BLOB_CONSTANTS = {
  DEFAULT_CHUNK_SIZE: 8 * 1024 * 1024,
  MAX_FILE_SIZE: 100 * 1024 * 1024,
  UPLOAD_SESSION_EXPIRY_MS: 24 * 60 * 60 * 1000,
  MAX_CHUNKS: 50
} as const

// =============================================================================
// Upload Init
// =============================================================================

export const UploadInitRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(127),
  totalSize: z.number().int().positive().max(BLOB_CONSTANTS.MAX_FILE_SIZE),
  totalChunks: z.number().int().positive().max(BLOB_CONSTANTS.MAX_CHUNKS),
  checksum: HashSchema
})
export type UploadInitRequest = z.infer<typeof UploadInitRequestSchema>

export const UploadInitResponseSchema = z.object({
  sessionId: UuidSchema,
  uploadUrl: z.url(),
  expiresAt: z.number().int().positive()
})
export type UploadInitResponse = z.infer<typeof UploadInitResponseSchema>

// =============================================================================
// Chunk Upload
// =============================================================================

export const ChunkUploadParamsSchema = z.object({
  sessionId: UuidSchema,
  index: z.coerce.number().int().nonnegative()
})
export type ChunkUploadParams = z.infer<typeof ChunkUploadParamsSchema>

export const ChunkUploadResponseSchema = z.object({
  received: z.boolean(),
  index: z.number().int().nonnegative()
})
export type ChunkUploadResponse = z.infer<typeof ChunkUploadResponseSchema>

// =============================================================================
// Upload Complete
// =============================================================================

export const UploadCompleteParamsSchema = z.object({
  sessionId: UuidSchema
})
export type UploadCompleteParams = z.infer<typeof UploadCompleteParamsSchema>

export const UploadCompleteRequestSchema = z.object({
  manifestSignature: Base64Schema
})
export type UploadCompleteRequest = z.infer<typeof UploadCompleteRequestSchema>

export const UploadCompleteResponseSchema = z.object({
  attachmentId: UuidSchema,
  manifestId: UuidSchema
})
export type UploadCompleteResponse = z.infer<typeof UploadCompleteResponseSchema>

// =============================================================================
// Chunk Check (Deduplication)
// =============================================================================

export const ChunkCheckParamsSchema = z.object({
  hash: HashSchema
})
export type ChunkCheckParams = z.infer<typeof ChunkCheckParamsSchema>

// =============================================================================
// Chunk Download
// =============================================================================

export const ChunkDownloadParamsSchema = z.object({
  hash: HashSchema
})
export type ChunkDownloadParams = z.infer<typeof ChunkDownloadParamsSchema>

// =============================================================================
// Manifest Operations
// =============================================================================

export const ManifestGetParamsSchema = z.object({
  attachmentId: UuidSchema
})
export type ManifestGetParams = z.infer<typeof ManifestGetParamsSchema>

export const EncryptedAttachmentManifestSchema = z.object({
  encryptedManifest: Base64Schema,
  manifestNonce: Base64Schema,
  encryptedFileKey: Base64Schema,
  keyNonce: Base64Schema,
  manifestSignature: Base64Schema
})
export type EncryptedAttachmentManifest = z.infer<typeof EncryptedAttachmentManifestSchema>

export const ManifestGetResponseSchema = EncryptedAttachmentManifestSchema
export type ManifestGetResponse = z.infer<typeof ManifestGetResponseSchema>

export const ManifestPutParamsSchema = z.object({
  attachmentId: UuidSchema
})
export type ManifestPutParams = z.infer<typeof ManifestPutParamsSchema>

export const ManifestPutRequestSchema = EncryptedAttachmentManifestSchema
export type ManifestPutRequest = z.infer<typeof ManifestPutRequestSchema>

export const ManifestPutResponseSchema = z.object({
  success: z.boolean()
})
export type ManifestPutResponse = z.infer<typeof ManifestPutResponseSchema>

// =============================================================================
// Upload Session Status
// =============================================================================

export const UploadStatusParamsSchema = z.object({
  sessionId: UuidSchema
})
export type UploadStatusParams = z.infer<typeof UploadStatusParamsSchema>

export const UploadStatusResponseSchema = z.object({
  sessionId: UuidSchema,
  filename: z.string(),
  totalSize: z.number().int().positive(),
  totalChunks: z.number().int().positive(),
  uploadedChunks: z.array(z.number().int().nonnegative()),
  expiresAt: z.number().int().positive(),
  status: z.enum(['pending', 'uploading', 'complete', 'expired'])
})
export type UploadStatusResponse = z.infer<typeof UploadStatusResponseSchema>

// =============================================================================
// Delete Attachment
// =============================================================================

export const DeleteAttachmentParamsSchema = z.object({
  attachmentId: UuidSchema
})
export type DeleteAttachmentParams = z.infer<typeof DeleteAttachmentParamsSchema>

export const DeleteAttachmentResponseSchema = z.object({
  success: z.boolean(),
  chunksDeleted: z.number().int().nonnegative()
})
export type DeleteAttachmentResponse = z.infer<typeof DeleteAttachmentResponseSchema>

// =============================================================================
// Helper Functions
// =============================================================================

export function validateUploadInitRequest(data: unknown): UploadInitRequest {
  return UploadInitRequestSchema.parse(data)
}

export function validateUploadCompleteRequest(data: unknown): UploadCompleteRequest {
  return UploadCompleteRequestSchema.parse(data)
}

export function validateManifestPutRequest(data: unknown): ManifestPutRequest {
  return ManifestPutRequestSchema.parse(data)
}
