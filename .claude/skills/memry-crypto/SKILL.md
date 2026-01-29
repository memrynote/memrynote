---
name: memry-crypto
description: |
  Guide for Memry's E2E encryption system: XChaCha20-Poly1305 encryption, Argon2id key derivation,
  Ed25519 signatures, X25519 device linking, and OS keychain storage.
  Triggers: "encrypt", "decrypt", "key derivation", "master key", "vault key", "signing",
  "signature", "keychain", "recovery phrase", "device linking", "E2EE", "XChaCha20",
  "Argon2", "Ed25519", "X25519", "crypto error", "key storage", "wrap key", "unwrap key",
  "file key", "EncryptedItem", "CryptoError"
---

# Memry Crypto

## Architecture

```
Recovery Phrase (24 words BIP39)
        ↓ phraseToEntropy()
    Entropy (32 bytes)
        ↓ deriveMasterKey() + KDF Salt
    Master Key (32 bytes, Argon2id)
        ↓ deriveAllKeys() via HKDF
┌───────┴───────┬──────────────┐
│               │              │
Vault Key    SigningKeyPair  VerifyKey
(32 bytes)   (Ed25519)       (32 bytes)
    │
    ↓ wrapFileKey()
File Keys (random 32 bytes per item)
    │
    ↓ encrypt() XChaCha20-Poly1305
Encrypted Data
```

## Key Files

| File | Purpose |
|------|---------|
| `src/main/crypto/encryption.ts` | encrypt/decrypt, wrap/unwrap keys |
| `src/main/crypto/keys.ts` | deriveMasterKey, deriveAllKeys, linking keys |
| `src/main/crypto/keychain.ts` | OS keychain via keytar |
| `src/main/crypto/signatures.ts` | signPayload, verifyPayload |
| `src/main/crypto/recovery.ts` | BIP39 phrase generation/validation |
| `src/main/crypto/cbor.ts` | Canonical CBOR for deterministic signing |
| `src/main/crypto/errors.ts` | CryptoError, CryptoErrorCode |
| `src/shared/contracts/crypto.ts` | Types, constants, Zod schemas |
| `src/main/ipc/crypto-handlers.ts` | IPC handlers |

## Algorithm Constants

From `@shared/contracts/crypto`:

```typescript
CRYPTO_VERSION = 1

ARGON2_PARAMS = { memoryCost: 65536, timeCost: 3, keyLength: 32 }
XCHACHA_PARAMS = { nonceSize: 24, keySize: 32, tagSize: 16 }
ED25519_PARAMS = { publicKeySize: 32, privateKeySize: 64, signatureSize: 64 }
X25519_PARAMS = { publicKeySize: 32, privateKeySize: 32, sharedSecretSize: 32 }

HKDF_CONTEXTS = {
  VAULT_KEY: 'memry-vault-key-v1',
  SIGNING_KEY: 'memry-signing-key-v1',
  VERIFY_KEY: 'memry-verify-key-v1',
  LINKING_ENC: 'memry-linking-enc-v1',
  LINKING_MAC: 'memry-linking-mac-v1',
}
```

## Common Operations

### Encrypt Item Content

```typescript
import { encryptWithWrappedKey, generateFileKey } from '../crypto/encryption'

const fileKey = await generateFileKey()
const { encryptedData, dataNonce, encryptedKey, keyNonce } =
  await encryptWithWrappedKey(plaintext, fileKey, vaultKey)
```

### Decrypt Item Content

```typescript
import { decryptWithWrappedKey } from '../crypto/encryption'

const plaintext = await decryptWithWrappedKey(
  base64ToUint8Array(encryptedData),
  base64ToUint8Array(dataNonce),
  base64ToUint8Array(encryptedKey),
  base64ToUint8Array(keyNonce),
  vaultKey
)
```

### Derive Keys from Recovery Phrase

```typescript
import { phraseToEntropy } from '../crypto/recovery'
import { deriveMasterKey, deriveAllKeys, generateSalt } from '../crypto/keys'

const entropy = phraseToEntropy(phraseWords)
const salt = generateSalt() // 16 bytes, store on server
const masterKey = deriveMasterKey(entropy, salt)
const { vaultKey, signingKeyPair, verifyKey } = await deriveAllKeys(masterKey)
```

### Sign Payload (Canonical CBOR)

```typescript
import { signPayload, verifyPayload } from '../crypto/signatures'
import type { SignaturePayloadV1 } from '@shared/contracts/crypto'

const payload: SignaturePayloadV1 = {
  id, type, cryptoVersion: 1,
  encryptedKey, keyNonce, encryptedData, dataNonce
}
const { signature, signerDeviceId } = await signPayload(payload, privateKey, deviceId)
const result = await verifyPayload(payload, signature, publicKey)
```

### Keychain Storage

```typescript
import { storeKeyMaterial, retrieveKeyMaterial, hasKeyMaterial } from '../crypto/keychain'

await storeKeyMaterial({ masterKey, kdfSalt, deviceSigningKey, devicePublicKey, deviceId, userId })
const material = await retrieveKeyMaterial()
```

## EncryptedItem Structure

```typescript
interface EncryptedItem {
  id: string
  type: 'note' | 'task' | 'project' | 'settings' | 'inbox' | 'filter' | 'journal'
  cryptoVersion: 1
  encryptedKey: string    // Base64, file key wrapped with vault key
  keyNonce: string        // Base64, 24 bytes
  encryptedData: string   // Base64
  dataNonce: string       // Base64, 24 bytes
  signature: string       // Base64, Ed25519
  signerDeviceId: string
  clock?: VectorClock
}
```

## Error Handling

```typescript
import { CryptoError, CryptoErrorCode, isCryptoError } from '../crypto/errors'

try {
  await decrypt(ciphertext, nonce, key)
} catch (error) {
  if (isCryptoError(error)) {
    switch (error.code) {
      case CryptoErrorCode.DECRYPTION_FAILED:
      case CryptoErrorCode.INVALID_KEY_LENGTH:
      case CryptoErrorCode.SIGNATURE_INVALID:
      case CryptoErrorCode.KEYCHAIN_ERROR:
      // ...
    }
  }
}
```

## Security Patterns

```typescript
import { secureZero } from '../crypto'

// Always zero sensitive keys after use
try {
  const result = await encrypt(data, key)
  return result
} finally {
  await secureZero(key)
}
```

## IPC Channels

From `CryptoChannels` in `@shared/contracts/ipc-sync`:

| Channel | Purpose |
|---------|---------|
| `crypto:encrypt-item` | Encrypt and wrap item |
| `crypto:decrypt-item` | Unwrap and decrypt item |
| `crypto:derive-keys` | Derive from phrase + salt |
| `crypto:sign-item` | Sign payload |
| `crypto:verify-signature` | Verify signature |
| `crypto:has-keys` | Check keychain |
| `crypto:delete-keys` | Secure keychain deletion |

## Testing

```bash
pnpm vitest src/main/crypto/
```

## References

- [API Reference](references/api-reference.md) - Full function signatures and types
