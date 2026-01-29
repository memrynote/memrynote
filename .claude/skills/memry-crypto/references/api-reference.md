# Crypto API Reference

## Encryption (`src/main/crypto/encryption.ts`)

### Core Encryption

```typescript
async function encrypt(
  plaintext: Uint8Array,
  key: Uint8Array,
  nonce?: Uint8Array
): Promise<{ ciphertext: Uint8Array; nonce: Uint8Array }>
```
XChaCha20-Poly1305 encryption. Key must be 32 bytes.

```typescript
async function decrypt(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  key: Uint8Array
): Promise<Uint8Array>
```
Throws `CryptoErrorCode.DECRYPTION_FAILED` on wrong key or tampered data.

### File Key Operations

```typescript
async function wrapFileKey(
  fileKey: Uint8Array,
  vaultKey: Uint8Array
): Promise<{ encryptedKey: string; keyNonce: string }>
```
Returns Base64-encoded wrapped key and nonce.

```typescript
async function unwrapFileKey(
  encryptedKey: string,
  keyNonce: string,
  vaultKey: Uint8Array
): Promise<Uint8Array>
```

### Convenience Functions

```typescript
async function encryptWithWrappedKey(
  plaintext: Uint8Array,
  fileKey: Uint8Array,
  vaultKey: Uint8Array
): Promise<{
  encryptedData: string   // Base64
  dataNonce: string       // Base64
  encryptedKey: string    // Base64
  keyNonce: string        // Base64
}>
```
Encrypts data with file key and wraps file key with vault key.

```typescript
async function decryptWithWrappedKey(
  encryptedData: Uint8Array,
  dataNonce: Uint8Array,
  encryptedKey: Uint8Array,
  keyNonce: Uint8Array,
  vaultKey: Uint8Array
): Promise<Uint8Array>
```

### Device Linking Encryption

```typescript
async function encryptMasterKeyForLinking(
  masterKey: Uint8Array,
  encKey: Uint8Array
): Promise<{ ciphertext: Uint8Array; nonce: Uint8Array }>
```

```typescript
async function decryptMasterKeyFromLinking(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  encKey: Uint8Array
): Promise<Uint8Array>
```

## Key Derivation (`src/main/crypto/keys.ts`)

### Master Key

```typescript
function deriveMasterKey(
  entropy: Uint8Array,   // 32 bytes from BIP39
  salt: Uint8Array       // 16 bytes, stored server-side
): Uint8Array            // 32-byte master key
```
Uses Argon2id (64MB memory, 3 iterations).

### Subkeys

```typescript
async function deriveAllKeys(masterKey: Uint8Array): Promise<{
  vaultKey: Uint8Array
  signingKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array }
  verifyKey: Uint8Array
}>
```

```typescript
async function deriveKey(
  masterKey: Uint8Array,
  context: string,      // From HKDF_CONTEXTS
  length: number
): Promise<Uint8Array>
```

```typescript
async function deriveVaultKey(masterKey: Uint8Array): Promise<Uint8Array>
async function deriveSigningKeyPair(masterKey: Uint8Array): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array }>
async function deriveVerifyKey(masterKey: Uint8Array): Promise<Uint8Array>
```

### Random Generation

```typescript
function generateFileKey(): Uint8Array   // 32 bytes
function generateNonce(): Uint8Array     // 24 bytes
function generateSalt(): Uint8Array      // 16 bytes
```

### Device Linking Keys

```typescript
function generateLinkingKeyPair(): { publicKey: string; privateKey: string }  // Base64 X25519
async function deriveLinkingKeys(
  myPrivateKey: Uint8Array,
  theirPublicKey: Uint8Array
): Promise<{ encryptionKey: Uint8Array; macKey: Uint8Array }>
```

### Key Verification

```typescript
async function generateKeyVerifier(masterKey: Uint8Array): Promise<Uint8Array>
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean
```

### Base64 Utilities

```typescript
function uint8ArrayToBase64(arr: Uint8Array): string
function base64ToUint8Array(str: string): Uint8Array
```

## Signatures (`src/main/crypto/signatures.ts`)

```typescript
async function signPayload(
  payload: SignaturePayloadV1,
  privateKey: Uint8Array,
  deviceId: string
): Promise<{ signature: Uint8Array; signerDeviceId: string }>
```
Signs canonical CBOR-encoded payload with Ed25519.

```typescript
async function signPayloadBase64(
  payload: SignaturePayloadV1,
  privateKey: Uint8Array,
  deviceId: string
): Promise<{ signature: string; signerDeviceId: string }>
```
Same as above but returns Base64 signature.

```typescript
async function verifyPayload(
  payload: SignaturePayloadV1,
  signature: string | Uint8Array,
  publicKey: string | Uint8Array
): Promise<{ valid: boolean; error?: string }>
```

```typescript
async function sign(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>
async function verify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): Promise<boolean>
```
Low-level Ed25519 operations.

## Recovery Phrase (`src/main/crypto/recovery.ts`)

```typescript
function generateRecoveryPhrase(): string[]  // 24 BIP39 words
function validateRecoveryPhrase(phrase: string[]): boolean
function phraseToEntropy(phrase: string[]): Uint8Array   // 32 bytes
function entropyToPhrase(entropy: Uint8Array): string[]
```

## Keychain (`src/main/crypto/keychain.ts`)

Service name: `com.memry.app`

### Key Material

```typescript
async function storeKeyMaterial(material: StoredKeyMaterial): Promise<void>
async function retrieveKeyMaterial(): Promise<StoredKeyMaterial | null>
async function hasKeyMaterial(): Promise<boolean>
async function deleteKeyMaterial(): Promise<void>
```

```typescript
interface StoredKeyMaterial {
  masterKey: string        // Base64
  kdfSalt: string          // Base64
  deviceSigningKey: string // Base64
  devicePublicKey: string  // Base64
  deviceId: string
  userId: string
}
```

### Device Keys

```typescript
async function storeDeviceKeyPair(keypair: { publicKey: string; privateKey: string; deviceId: string }): Promise<void>
async function retrieveDeviceKeyPair(): Promise<{ publicKey: string; privateKey: string; deviceId: string } | null>
async function hasDeviceKeyPair(): Promise<boolean>
async function deleteDeviceKeyPair(): Promise<void>
```

### Signing Keys

```typescript
async function storeSigningKeyPair(keypair: StoredSigningKeyPair): Promise<void>
async function retrieveSigningKeyPair(): Promise<StoredSigningKeyPair | null>
async function deleteSigningKeyPair(): Promise<void>

interface StoredSigningKeyPair {
  publicKey: string   // Base64
  privateKey: string  // Base64
}
```

### Auth Tokens

```typescript
async function storeAuthTokens(tokens: StoredAuthTokens): Promise<void>
async function retrieveAuthTokens(): Promise<StoredAuthTokens | null>
async function deleteAuthTokens(): Promise<void>

interface StoredAuthTokens {
  accessToken: string
  refreshToken: string
  userId: string
  email: string
  deviceId: string
}
```

### Cleanup

```typescript
async function deleteAllKeys(): Promise<void>  // Removes all keychain entries
```

## CBOR Encoding (`src/main/crypto/cbor.ts`)

```typescript
function encodeSignaturePayloadV1(payload: SignaturePayloadV1): Uint8Array
```
Canonical deterministic CBOR encoding for signing.

```typescript
function encodeCanonicalCbor(value: unknown): Uint8Array
function decodeCbor<T>(bytes: Uint8Array): T
```

## Memory Safety (`src/main/crypto/index.ts`)

```typescript
async function secureZero(buffer: Uint8Array): Promise<void>
function secureZeroSync(buffer: Uint8Array): void
```
Overwrites buffer with random bytes then zeros.

## Errors (`src/main/crypto/errors.ts`)

```typescript
class CryptoError extends Error {
  code: CryptoErrorCode
  cause?: unknown
}

function isCryptoError(error: unknown): error is CryptoError
```

### Error Codes

```typescript
enum CryptoErrorCode {
  INVALID_KEY_LENGTH = 'INVALID_KEY_LENGTH',
  INVALID_NONCE_LENGTH = 'INVALID_NONCE_LENGTH',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  KEY_DERIVATION_FAILED = 'KEY_DERIVATION_FAILED',
  KEY_GENERATION_FAILED = 'KEY_GENERATION_FAILED',
  KEY_NOT_FOUND = 'KEY_NOT_FOUND',
  SIGNATURE_INVALID = 'SIGNATURE_INVALID',
  ENCODING_FAILED = 'ENCODING_FAILED',
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  INVALID_RECOVERY_PHRASE = 'INVALID_RECOVERY_PHRASE',
  KEYCHAIN_ERROR = 'KEYCHAIN_ERROR',
  HMAC_FAILED = 'HMAC_FAILED',
  SODIUM_NOT_READY = 'SODIUM_NOT_READY',
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `libsodium-wrappers` | XChaCha20, Ed25519, Argon2id (WASM) |
| `sodium-native` | X25519, native crypto_scalarmult |
| `bip39` | Recovery phrase mnemonic |
| `cborg` | Canonical CBOR encoding |
| `keytar` | OS keychain (macOS/Windows/Linux) |
