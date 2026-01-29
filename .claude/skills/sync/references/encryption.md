# Encryption Reference

## Key Derivation

### Master Key from Password (Argon2id)

```typescript
import { argon2id } from '@noble/hashes/argon2';

function deriveMasterKey(password: string, salt: Uint8Array): Uint8Array {
  return argon2id(password, salt, {
    t: 3,        // Time cost (iterations)
    m: 65536,    // Memory cost (64 MB)
    p: 4,        // Parallelism
    dkLen: 32,   // Output length (256 bits)
  });
}
```

### Subkey Derivation (HKDF)

```typescript
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';

function deriveSubkey(masterKey: Uint8Array, info: string): Uint8Array {
  return hkdf(sha256, masterKey, undefined, info, 32);
}

// Derive all subkeys
const contentKey = deriveSubkey(masterKey, 'memry-content-key');
const authKey = deriveSubkey(masterKey, 'memry-auth-key');
const signingKey = deriveSubkey(masterKey, 'memry-signing-key');
```

## Symmetric Encryption (XChaCha20-Poly1305)

### Encrypt

```typescript
import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { randomBytes } from '@noble/ciphers/webcrypto';

function encrypt(plaintext: Uint8Array, key: Uint8Array): Uint8Array {
  const nonce = randomBytes(24); // XChaCha20 uses 24-byte nonce
  const cipher = xchacha20poly1305(key, nonce);
  const ciphertext = cipher.encrypt(plaintext);

  // Prepend nonce to ciphertext
  const result = new Uint8Array(nonce.length + ciphertext.length);
  result.set(nonce);
  result.set(ciphertext, nonce.length);
  return result;
}
```

### Decrypt

```typescript
function decrypt(encrypted: Uint8Array, key: Uint8Array): Uint8Array {
  const nonce = encrypted.slice(0, 24);
  const ciphertext = encrypted.slice(24);
  const cipher = xchacha20poly1305(key, nonce);
  return cipher.decrypt(ciphertext);
}
```

### With Associated Data (AEAD)

```typescript
function encryptWithAD(
  plaintext: Uint8Array,
  key: Uint8Array,
  associatedData: Uint8Array
): Uint8Array {
  const nonce = randomBytes(24);
  const cipher = xchacha20poly1305(key, nonce, associatedData);
  const ciphertext = cipher.encrypt(plaintext);

  const result = new Uint8Array(nonce.length + ciphertext.length);
  result.set(nonce);
  result.set(ciphertext, nonce.length);
  return result;
}
```

## Signatures (Ed25519)

### Generate Signing Keypair

```typescript
import { ed25519 } from '@noble/curves/ed25519';

function generateSigningKeyPair() {
  const privateKey = randomBytes(32);
  const publicKey = ed25519.getPublicKey(privateKey);
  return { privateKey, publicKey };
}

// Or derive from master key
function deriveSigningKeyPair(masterKey: Uint8Array) {
  const privateKey = deriveSubkey(masterKey, 'memry-signing-key');
  const publicKey = ed25519.getPublicKey(privateKey);
  return { privateKey, publicKey };
}
```

### Sign

```typescript
function sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array {
  return ed25519.sign(message, privateKey);
}
```

### Verify

```typescript
function verify(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): boolean {
  return ed25519.verify(signature, message, publicKey);
}
```

### Sign Encrypted Payload

```typescript
function encryptAndSign(
  plaintext: Uint8Array,
  encryptionKey: Uint8Array,
  signingKey: Uint8Array
): { encrypted: Uint8Array; signature: Uint8Array } {
  const encrypted = encrypt(plaintext, encryptionKey);
  const signature = sign(encrypted, signingKey);
  return { encrypted, signature };
}

function verifyAndDecrypt(
  encrypted: Uint8Array,
  signature: Uint8Array,
  encryptionKey: Uint8Array,
  publicKey: Uint8Array
): Uint8Array {
  if (!verify(encrypted, signature, publicKey)) {
    throw new Error('Signature verification failed');
  }
  return decrypt(encrypted, encryptionKey);
}
```

## Device Linking (X25519 ECDH)

### Generate Key Exchange Pair

```typescript
import { x25519 } from '@noble/curves/ed25519';

function generateKeyExchangePair() {
  const privateKey = randomBytes(32);
  const publicKey = x25519.getPublicKey(privateKey);
  return { privateKey, publicKey };
}
```

### Compute Shared Secret

```typescript
function computeSharedSecret(
  ourPrivateKey: Uint8Array,
  theirPublicKey: Uint8Array
): Uint8Array {
  const sharedPoint = x25519.getSharedSecret(ourPrivateKey, theirPublicKey);
  // Derive actual key from shared point
  return hkdf(sha256, sharedPoint, undefined, 'memry-device-link', 32);
}
```

### Device Linking Flow

```typescript
// Device A (existing device with vault key)
const deviceA = {
  async initiateLink() {
    const { privateKey, publicKey } = generateKeyExchangePair();
    // Store privateKey temporarily
    // Send publicKey to server, get link code
    return { linkCode, privateKey };
  },

  async completeLink(theirPublicKey: Uint8Array, vaultKey: Uint8Array) {
    const sharedSecret = computeSharedSecret(this.privateKey, theirPublicKey);
    const encryptedVaultKey = encrypt(vaultKey, sharedSecret);
    // Send encryptedVaultKey to server
  }
};

// Device B (new device)
const deviceB = {
  async joinLink(linkCode: string) {
    const { privateKey, publicKey } = generateKeyExchangePair();
    // Send publicKey to server with link code
    // Receive encryptedVaultKey and their publicKey
    const sharedSecret = computeSharedSecret(privateKey, theirPublicKey);
    const vaultKey = decrypt(encryptedVaultKey, sharedSecret);
    return vaultKey;
  }
};
```

## Keychain Storage

### macOS Keychain

```typescript
import keytar from 'keytar';

const SERVICE = 'com.memry.vault';

async function storeKey(account: string, key: Uint8Array): Promise<void> {
  // Store as base64
  await keytar.setPassword(SERVICE, account, Buffer.from(key).toString('base64'));
}

async function retrieveKey(account: string): Promise<Uint8Array | null> {
  const stored = await keytar.getPassword(SERVICE, account);
  if (!stored) return null;
  return Uint8Array.from(Buffer.from(stored, 'base64'));
}

async function deleteKey(account: string): Promise<void> {
  await keytar.deletePassword(SERVICE, account);
}
```

### Keys to Store
```typescript
// Vault key (derived from password, used for encryption)
await storeKey(`${vaultId}-vault-key`, vaultKey);

// Auth key (for API authentication)
await storeKey(`${vaultId}-auth-key`, authKey);

// Device private key (for device identity)
await storeKey(`${deviceId}-device-key`, devicePrivateKey);
```

## Memory Safety

### Secure Zero

```typescript
function secureZero(buffer: Uint8Array): void {
  crypto.getRandomValues(buffer); // Overwrite with random
  buffer.fill(0);                 // Then zero
}

// Usage
const key = deriveKey(password, salt);
try {
  const result = encrypt(data, key);
  return result;
} finally {
  secureZero(key);
}
```

### Key Wrapper Class

```typescript
class SecureKey {
  private key: Uint8Array;
  private destroyed = false;

  constructor(key: Uint8Array) {
    this.key = new Uint8Array(key);
    secureZero(key); // Zero the input
  }

  use<T>(fn: (key: Uint8Array) => T): T {
    if (this.destroyed) throw new Error('Key destroyed');
    return fn(this.key);
  }

  destroy(): void {
    secureZero(this.key);
    this.destroyed = true;
  }
}
```

## Two-Layer Encryption

### Encrypt Item

```typescript
function encryptItem(
  item: object,
  contentKey: Uint8Array,
  vaultKey: Uint8Array,
  signingKey: Uint8Array
): EncryptedItem {
  // Serialize item
  const plaintext = new TextEncoder().encode(JSON.stringify(item));

  // Generate random content key for this item
  const itemKey = randomBytes(32);

  // Encrypt content with item key
  const encryptedContent = encrypt(plaintext, itemKey);

  // Encrypt item key with vault key
  const encryptedKey = encrypt(itemKey, vaultKey);

  // Sign the encrypted content
  const signature = sign(encryptedContent, signingKey);

  // Zero the item key
  secureZero(itemKey);

  return {
    encryptedContent: toBase64(encryptedContent),
    encryptedKey: toBase64(encryptedKey),
    signature: toBase64(signature),
  };
}
```

### Decrypt Item

```typescript
function decryptItem(
  encrypted: EncryptedItem,
  vaultKey: Uint8Array,
  publicKey: Uint8Array
): object {
  const encryptedContent = fromBase64(encrypted.encryptedContent);
  const encryptedKey = fromBase64(encrypted.encryptedKey);
  const signature = fromBase64(encrypted.signature);

  // Verify signature
  if (!verify(encryptedContent, signature, publicKey)) {
    throw new Error('Signature verification failed');
  }

  // Decrypt item key
  const itemKey = decrypt(encryptedKey, vaultKey);

  // Decrypt content
  const plaintext = decrypt(encryptedContent, itemKey);

  // Zero the item key
  secureZero(itemKey);

  return JSON.parse(new TextDecoder().decode(plaintext));
}
```
