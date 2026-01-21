declare module 'sodium-native' {
  export const crypto_pwhash_ALG_ARGON2ID13: number

  export function crypto_pwhash(
    output: Buffer,
    password: Buffer,
    salt: Buffer,
    opslimit: number,
    memlimit: number,
    alg: number
  ): void

  export function randombytes_buf(length: number): Buffer

  export function crypto_generichash(output: Buffer, input: Buffer, key?: Buffer): void

  export function sodium_memcmp(a: Buffer, b: Buffer): boolean

  export function memzero(buffer: Buffer): void

  export function crypto_kdf_derive_from_key(
    length: number,
    subkeyId: number,
    context: string,
    masterKey: Uint8Array
  ): Uint8Array

  export function crypto_sign_keypair(): { publicKey: Uint8Array; privateKey: Uint8Array }

  export function crypto_sign_seed_keypair(seed: Uint8Array): {
    publicKey: Uint8Array
    privateKey: Uint8Array
  }
}
