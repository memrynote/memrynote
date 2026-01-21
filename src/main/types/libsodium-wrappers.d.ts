declare module 'libsodium-wrappers' {
  export interface SodiumWrappers {
    ready: Promise<void>
    crypto_aead_xchacha20poly1305_ietf_encrypt(
      message: Uint8Array,
      additionalData: Uint8Array | null,
      secretNonce: Uint8Array | null,
      nonce: Uint8Array,
      key: Uint8Array
    ): Uint8Array
    crypto_aead_xchacha20poly1305_ietf_decrypt(
      secretNonce: Uint8Array | null,
      ciphertext: Uint8Array,
      additionalData: Uint8Array | null,
      nonce: Uint8Array,
      key: Uint8Array
    ): Uint8Array
    crypto_kdf_derive_from_key(
      length: number,
      subkeyId: number,
      context: string,
      masterKey: Uint8Array
    ): Uint8Array
    crypto_sign_seed_keypair(seed: Uint8Array): { publicKey: Uint8Array; privateKey: Uint8Array }
    crypto_sign_keypair(): { publicKey: Uint8Array; privateKey: Uint8Array }
    crypto_sign_detached(message: Uint8Array, privateKey: Uint8Array): Uint8Array
    crypto_sign_verify_detached(
      signature: Uint8Array,
      message: Uint8Array,
      publicKey: Uint8Array
    ): boolean
    randombytes_buf(length: number): Uint8Array
    memzero(data: Uint8Array): void
  }

  const sodium: SodiumWrappers
  export default sodium
}
