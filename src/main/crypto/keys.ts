/**
 * Key Derivation Module
 *
 * Implements HKDF, Argon2id master key derivation, and key generation.
 */

import sodium from 'sodium-native'
import { ensureSodiumReady } from './sodium'
import { CryptoError, CryptoErrorCode } from './errors'
import {
  HKDF_CONTEXTS,
  ARGON2_PARAMS,
  XCHACHA_PARAMS,
  ED25519_PARAMS
} from '@shared/contracts/crypto'
import type { DerivedKeys, DeviceSigningKeyPair } from '@shared/contracts/crypto'

/**
 * Derive a key using HKDF with a context string.
 *
 * @param masterKey - 32-byte master key
 * @param context - Context string from HKDF_CONTEXTS
 * @param length - Output key length (default: 32)
 * @returns Derived key
 * @throws CryptoError if derivation fails
 */
export async function deriveKey(
  masterKey: Uint8Array,
  context: string,
  length: number = 32
): Promise<Uint8Array> {
  const sodium = await ensureSodiumReady()

  if (masterKey.length !== 32) {
    throw new CryptoError(
      `Invalid master key length: expected 32 bytes, got ${masterKey.length}`,
      CryptoErrorCode.INVALID_KEY_LENGTH
    )
  }

  try {
    // Use sodium's crypto_kdf_derive_from_key for HKDF-like derivation
    // Context must be exactly 8 characters (padded or truncated)
    const contextStr = context.slice(0, 8).padEnd(8, '\0')
    const subkeyId = contextToSubkeyId(context)

    return sodium.crypto_kdf_derive_from_key(length, subkeyId, contextStr, masterKey)
  } catch (error) {
    throw new CryptoError('Key derivation failed', CryptoErrorCode.KEY_DERIVATION_FAILED, error)
  }
}

/**
 * Map context string to a unique subkey ID.
 */
function contextToSubkeyId(context: string): number {
  switch (context) {
    case HKDF_CONTEXTS.VAULT_KEY:
      return 1
    case HKDF_CONTEXTS.SIGNING_KEY:
      return 2
    case HKDF_CONTEXTS.VERIFY_KEY:
      return 3
    case HKDF_CONTEXTS.LINKING_ENC:
      return 4
    case HKDF_CONTEXTS.LINKING_MAC:
      return 5
    case HKDF_CONTEXTS.KEY_VERIFY_INPUT:
      return 6
    default:
      // Hash the context for unknown contexts
      return Math.abs(hashCode(context)) % 1000000
  }
}

/**
 * Simple hash code for unknown context strings.
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

/**
 * Derive master key from recovery phrase entropy using Argon2id.
 * Uses sodium-native for Argon2id which has full algorithm support.
 *
 * @param entropy - 32 bytes from recovery phrase
 * @param salt - 16-byte salt (from server)
 * @returns 32-byte master key
 * @throws CryptoError if derivation fails
 */
export function deriveMasterKey(entropy: Uint8Array, salt: Uint8Array): Uint8Array {
  if (entropy.length !== 32) {
    throw new CryptoError(
      `Invalid entropy length: expected 32 bytes, got ${entropy.length}`,
      CryptoErrorCode.INVALID_KEY_LENGTH
    )
  }

  if (salt.length !== 16) {
    throw new CryptoError(
      `Invalid salt length: expected 16 bytes, got ${salt.length}`,
      CryptoErrorCode.INVALID_KEY_LENGTH
    )
  }

  try {
    // Use sodium-native for Argon2id (full algorithm support)
    const output = Buffer.alloc(ARGON2_PARAMS.keyLength)
    const passwordBuffer = Buffer.from(entropy)
    const saltBuffer = Buffer.from(salt)

    sodium.crypto_pwhash(
      output,
      passwordBuffer,
      saltBuffer,
      ARGON2_PARAMS.timeCost,
      ARGON2_PARAMS.memoryCost * 1024, // Convert KiB to bytes
      sodium.crypto_pwhash_ALG_ARGON2ID13
    )

    return new Uint8Array(output)
  } catch (error) {
    throw new CryptoError(
      'Master key derivation failed',
      CryptoErrorCode.KEY_DERIVATION_FAILED,
      error
    )
  }
}

/**
 * Derive all sub-keys from master key.
 *
 * @param masterKey - 32-byte master key
 * @returns DerivedKeys object with vault key, signing keypair, and verify key
 * @throws CryptoError if derivation fails
 */
export async function deriveAllKeys(masterKey: Uint8Array): Promise<DerivedKeys> {
  const sodium = await ensureSodiumReady()

  // Derive vault key
  const vaultKey = await deriveKey(masterKey, HKDF_CONTEXTS.VAULT_KEY, XCHACHA_PARAMS.keySize)

  // Derive signing key seed and generate Ed25519 keypair
  const signingKeySeed = await deriveKey(
    masterKey,
    HKDF_CONTEXTS.SIGNING_KEY,
    ED25519_PARAMS.seedSize
  )
  const signingKeyPair = sodium.crypto_sign_seed_keypair(signingKeySeed) as {
    publicKey: Uint8Array
    privateKey: Uint8Array
  }

  // Derive verify key
  const verifyKey = await deriveKey(masterKey, HKDF_CONTEXTS.VERIFY_KEY, 32)

  return {
    vaultKey,
    signingKeyPair: {
      publicKey: signingKeyPair.publicKey,
      privateKey: signingKeyPair.privateKey
    },
    verifyKey
  }
}

/**
 * Generate a random file key for encrypting an item.
 *
 * @returns 32-byte random key
 */
export async function generateFileKey(): Promise<Uint8Array> {
  const sodium = await ensureSodiumReady()
  return sodium.randombytes_buf(XCHACHA_PARAMS.keySize)
}

/**
 * Generate a new Ed25519 device signing keypair.
 *
 * @param deviceId - The device ID to associate with this keypair
 * @returns DeviceSigningKeyPair
 */
export async function generateDeviceSigningKeyPair(
  deviceId: string
): Promise<DeviceSigningKeyPair> {
  const sodium = await ensureSodiumReady()
  const keyPair = sodium.crypto_sign_keypair() as {
    publicKey: Uint8Array
    privateKey: Uint8Array
  }

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    deviceId
  }
}

/**
 * Get the public key from a device signing keypair.
 * Used for device registration with the server.
 *
 * @param keyPair - The device signing keypair
 * @returns Base64-encoded public key
 */
export function getDevicePublicKeyBase64(keyPair: DeviceSigningKeyPair): string {
  return uint8ArrayToBase64(keyPair.publicKey)
}

/**
 * Generate a random salt for Argon2id.
 *
 * @returns 16-byte random salt
 */
export async function generateSalt(): Promise<Uint8Array> {
  const sodium = await ensureSodiumReady()
  // crypto_pwhash_SALTBYTES is 16 bytes
  return sodium.randombytes_buf(16)
}

/**
 * Generate a random nonce for XChaCha20-Poly1305.
 *
 * @returns 24-byte random nonce
 */
export async function generateNonce(): Promise<Uint8Array> {
  const sodium = await ensureSodiumReady()
  return sodium.randombytes_buf(XCHACHA_PARAMS.nonceSize)
}

/**
 * Convert Uint8Array to Base64 string.
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  // Use Buffer in Node.js environment
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }
  // Fallback for browser
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert Base64 string to Uint8Array.
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  // Use Buffer in Node.js environment
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'))
  }
  // Fallback for browser
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// =============================================================================
// T058: Key Verifier Generation
// =============================================================================

/**
 * Generate a key verifier from the master key.
 * Used for server-side verification without exposing the master key.
 *
 * The verifier is:
 * 1. Derive KEY_VERIFY_INPUT from master key using HKDF
 * 2. Hash the derived key with BLAKE2b to produce the verifier
 *
 * @param masterKey - 32-byte master key
 * @returns 32-byte key verifier
 * @throws CryptoError if generation fails
 */
export async function generateKeyVerifier(masterKey: Uint8Array): Promise<Uint8Array> {
  if (masterKey.length !== 32) {
    throw new CryptoError(
      `Invalid master key length: expected 32 bytes, got ${masterKey.length}`,
      CryptoErrorCode.INVALID_KEY_LENGTH
    )
  }

  try {
    const verifyInput = await deriveKey(masterKey, HKDF_CONTEXTS.KEY_VERIFY_INPUT, 32)
    // Use sodium-native's BLAKE2b hash (crypto_generichash)
    const hash = Buffer.alloc(32)
    sodium.crypto_generichash(hash, Buffer.from(verifyInput))
    return new Uint8Array(hash)
  } catch (error) {
    throw new CryptoError(
      'Key verifier generation failed',
      CryptoErrorCode.KEY_DERIVATION_FAILED,
      error
    )
  }
}

// =============================================================================
// T059: Vault Key Derivation
// =============================================================================

/**
 * Derive the vault key from master key.
 * Used for encrypting/decrypting file keys.
 *
 * @param masterKey - 32-byte master key
 * @returns 32-byte vault key
 * @throws CryptoError if derivation fails
 */
export async function deriveVaultKey(masterKey: Uint8Array): Promise<Uint8Array> {
  return deriveKey(masterKey, HKDF_CONTEXTS.VAULT_KEY, XCHACHA_PARAMS.keySize)
}

// =============================================================================
// T060: Signing Keypair Derivation
// =============================================================================

/**
 * Derive Ed25519 signing keypair from master key.
 * This is the user-level signing keypair (different from device keypair).
 *
 * @param masterKey - 32-byte master key
 * @returns Ed25519 keypair with publicKey and privateKey
 * @throws CryptoError if derivation fails
 */
export async function deriveSigningKeyPair(
  masterKey: Uint8Array
): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array }> {
  const sodium = await ensureSodiumReady()

  if (masterKey.length !== 32) {
    throw new CryptoError(
      `Invalid master key length: expected 32 bytes, got ${masterKey.length}`,
      CryptoErrorCode.INVALID_KEY_LENGTH
    )
  }

  try {
    const signingKeySeed = await deriveKey(
      masterKey,
      HKDF_CONTEXTS.SIGNING_KEY,
      ED25519_PARAMS.seedSize
    )
    const keyPair = sodium.crypto_sign_seed_keypair(signingKeySeed) as {
      publicKey: Uint8Array
      privateKey: Uint8Array
    }
    return keyPair
  } catch (error) {
    throw new CryptoError(
      'Signing keypair derivation failed',
      CryptoErrorCode.KEY_DERIVATION_FAILED,
      error
    )
  }
}

// =============================================================================
// T060: Verify Key Derivation
// =============================================================================

/**
 * Derive the verify key from master key.
 * Used for key verification processes.
 *
 * @param masterKey - 32-byte master key
 * @returns 32-byte verify key
 * @throws CryptoError if derivation fails
 */
export async function deriveVerifyKey(masterKey: Uint8Array): Promise<Uint8Array> {
  return deriveKey(masterKey, HKDF_CONTEXTS.VERIFY_KEY, 32)
}

/**
 * Compare two byte arrays in constant time.
 * Used for secure comparison of key verifiers and other secrets.
 *
 * @param a - First byte array
 * @param b - Second byte array
 * @returns true if arrays are equal
 */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false
  }
  // Use sodium-native's constant-time comparison
  return sodium.sodium_memcmp(Buffer.from(a), Buffer.from(b))
}
