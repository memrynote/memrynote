/**
 * Test Helpers for Crypto Module
 *
 * Utility functions for crypto tests.
 *
 * @module main/crypto/__helpers__
 */

import sodium from 'sodium-native'

// =============================================================================
// Buffer Comparison
// =============================================================================

/**
 * Assert two buffers are equal.
 */
export function expectBufferEqual(a: Buffer | Uint8Array, b: Buffer | Uint8Array): void {
  expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true)
}

/**
 * Assert two buffers are NOT equal.
 */
export function expectBufferNotEqual(a: Buffer | Uint8Array, b: Buffer | Uint8Array): void {
  expect(Buffer.from(a).equals(Buffer.from(b))).toBe(false)
}

/**
 * Check if buffer contains all zeros.
 */
export function isZeroed(buf: Buffer | Uint8Array): boolean {
  const b = Buffer.from(buf)
  for (let i = 0; i < b.length; i++) {
    if (b[i] !== 0) return false
  }
  return true
}

// =============================================================================
// Random Key Generation
// =============================================================================

/**
 * Generate a random 32-byte key for testing.
 */
export function randomKey(size: number = 32): Buffer {
  const key = Buffer.alloc(size)
  sodium.randombytes_buf(key)
  return key
}

/**
 * Generate a random 24-byte nonce for testing.
 */
export function randomNonce(size: number = 24): Buffer {
  const nonce = Buffer.alloc(size)
  sodium.randombytes_buf(nonce)
  return nonce
}

/**
 * Generate a random 16-byte salt for testing.
 */
export function randomSalt(size: number = 16): Buffer {
  const salt = Buffer.alloc(size)
  sodium.randombytes_buf(salt)
  return salt
}

// =============================================================================
// Key Pair Generation
// =============================================================================

/**
 * Generate a deterministic Ed25519 key pair from a seed.
 */
export function generateTestKeyPair(seed?: Buffer): { publicKey: Buffer; secretKey: Buffer } {
  const seedBuffer = seed ?? randomKey(32)

  const publicKey = Buffer.alloc(32)
  const secretKey = Buffer.alloc(64)

  sodium.crypto_sign_seed_keypair(publicKey, secretKey, seedBuffer)

  return { publicKey, secretKey }
}

// =============================================================================
// Deterministic Test Keys
// =============================================================================

/**
 * Create deterministic test keys for reproducible tests.
 * Each index produces a unique but deterministic key.
 */
export function createDeterministicKey(index: number, length: number = 32): Buffer {
  const key = Buffer.alloc(length)
  for (let i = 0; i < length; i++) {
    key[i] = (index + i) % 256
  }
  return key
}

/**
 * Create a test master key with a specific pattern.
 */
export function createTestMasterKey(pattern: number = 0x42): Buffer {
  return Buffer.alloc(32, pattern)
}

// =============================================================================
// Assertion Helpers
// =============================================================================

/**
 * Assert a function throws with a specific error message.
 */
export async function expectToThrowAsync(
  fn: () => Promise<unknown>,
  errorPattern: string | RegExp
): Promise<void> {
  try {
    await fn()
    throw new Error('Expected function to throw')
  } catch (error) {
    if (error instanceof Error) {
      if (typeof errorPattern === 'string') {
        expect(error.message).toContain(errorPattern)
      } else {
        expect(error.message).toMatch(errorPattern)
      }
    } else {
      throw error
    }
  }
}

/**
 * Assert a sync function throws with a specific error message.
 */
export function expectToThrow(fn: () => unknown, errorPattern: string | RegExp): void {
  try {
    fn()
    throw new Error('Expected function to throw')
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Expected function to throw') {
        throw error
      }
      if (typeof errorPattern === 'string') {
        expect(error.message).toContain(errorPattern)
      } else {
        expect(error.message).toMatch(errorPattern)
      }
    } else {
      throw error
    }
  }
}

// =============================================================================
// Timing Helpers
// =============================================================================

/**
 * Wait for a specified number of milliseconds.
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// =============================================================================
// Base64 Helpers
// =============================================================================

/**
 * Convert buffer to Base64.
 */
export function toBase64(buf: Buffer | Uint8Array): string {
  return Buffer.from(buf).toString('base64')
}

/**
 * Convert Base64 to buffer.
 */
export function fromBase64(str: string): Buffer {
  return Buffer.from(str, 'base64')
}

/**
 * Assert a string is valid Base64.
 */
export function expectValidBase64(str: string): void {
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  expect(str).toMatch(base64Regex)
}
