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
}
