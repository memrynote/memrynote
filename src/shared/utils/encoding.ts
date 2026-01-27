/**
 * Base64 Encoding Utilities
 *
 * Isomorphic base64 encoding/decoding that works in both Node.js and browser environments.
 * Uses lib0/buffer which is bundled with Yjs for consistent encoding across environments.
 *
 * @module shared/utils/encoding
 */

import * as buffer from 'lib0/buffer'

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  return buffer.toBase64(bytes)
}

export function base64ToUint8Array(base64: string): Uint8Array {
  return buffer.fromBase64(base64)
}
