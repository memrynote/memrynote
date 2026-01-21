/**
 * Crypto IPC handlers tests
 *
 * @module ipc/crypto-handlers.test
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { mockIpcMain, resetIpcMocks, invokeHandler } from '@tests/utils/mock-ipc'
import { CryptoChannels } from '@shared/contracts/ipc-sync'
import { CRYPTO_VERSION } from '@shared/contracts/crypto'
import type { EncryptedItem } from '@shared/contracts/crypto'

const handleCalls: unknown[][] = []
const removeHandlerCalls: string[] = []
const mockSend = vi.fn()

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: unknown) => {
      handleCalls.push([channel, handler])
      mockIpcMain.handle(channel, handler as Parameters<typeof mockIpcMain.handle>[1])
    }),
    removeHandler: vi.fn((channel: string) => {
      removeHandlerCalls.push(channel)
      mockIpcMain.removeHandler(channel)
    })
  },
  BrowserWindow: {
    getAllWindows: vi.fn(() => [{ webContents: { send: mockSend } }])
  }
}))

vi.mock('../crypto', () => ({
  generateRecoveryPhrase: vi.fn(() => Array(24).fill('word')),
  validateRecoveryPhrase: vi.fn(() => true),
  phraseToEntropy: vi.fn(() => new Uint8Array(32)),
  deriveMasterKey: vi.fn(() => new Uint8Array(32)),
  deriveAllKeys: vi.fn(() => ({
    vaultKey: new Uint8Array(32),
    signingKeyPair: { publicKey: new Uint8Array(32), privateKey: new Uint8Array(64) },
    verifyKey: new Uint8Array(32)
  })),
  generateFileKey: vi.fn(() => new Uint8Array(32)),
  uint8ArrayToBase64: vi.fn((arr: Uint8Array) => Buffer.from(arr).toString('base64')),
  base64ToUint8Array: vi.fn((str: string) => new Uint8Array(Buffer.from(str, 'base64'))),
  encryptWithWrappedKey: vi.fn(() => ({
    encryptedKey: 'encKey123',
    keyNonce: 'keyNonce123',
    encryptedData: 'encData123',
    dataNonce: 'dataNonce123'
  })),
  decryptWithWrappedKey: vi.fn(() => new TextEncoder().encode('decrypted')),
  signPayloadBase64: vi.fn(() => 'signature123'),
  verifyPayload: vi.fn(() => ({ valid: true })),
  retrieveKeyMaterial: vi.fn(() => ({
    masterKey: 'base64masterkey',
    deviceSigningKey: 'base64devkey',
    devicePublicKey: 'base64pubkey',
    deviceId: 'device-123',
    userId: 'user-123'
  })),
  deleteKeyMaterial: vi.fn(),
  hasKeyMaterial: vi.fn(() => true),
  retrieveDeviceKeyPair: vi.fn(() => ({
    publicKey: new Uint8Array(32),
    privateKey: new Uint8Array(64),
    deviceId: 'device-123'
  })),
  isCryptoError: vi.fn(() => false),
  secureZero: vi.fn()
}))

import { registerCryptoHandlers, unregisterCryptoHandlers } from './crypto-handlers'
import * as crypto from '../crypto'

describe('crypto-handlers', () => {
  beforeEach(() => {
    resetIpcMocks()
    vi.clearAllMocks()
    handleCalls.length = 0
    removeHandlerCalls.length = 0
    mockSend.mockClear()
  })

  afterEach(() => {
    unregisterCryptoHandlers()
  })

  describe('registerCryptoHandlers', () => {
    it('should register all crypto handlers', () => {
      // #when
      registerCryptoHandlers()

      // #then
      const registeredChannels = handleCalls.map(([channel]) => channel)
      expect(registeredChannels).toContain(CryptoChannels.invoke.HAS_KEYS)
      expect(registeredChannels).toContain(CryptoChannels.invoke.GENERATE_RECOVERY_PHRASE)
      expect(registeredChannels).toContain(CryptoChannels.invoke.DERIVE_KEYS)
      expect(registeredChannels).toContain(CryptoChannels.invoke.ENCRYPT_ITEM)
      expect(registeredChannels).toContain(CryptoChannels.invoke.DECRYPT_ITEM)
      expect(registeredChannels).toContain(CryptoChannels.invoke.SIGN_ITEM)
      expect(registeredChannels).toContain(CryptoChannels.invoke.VERIFY_SIGNATURE)
    })
  })

  describe('unregisterCryptoHandlers', () => {
    it('should unregister all crypto handlers', () => {
      // #given
      registerCryptoHandlers()

      // #when
      unregisterCryptoHandlers()

      // #then
      const unregisteredChannels = removeHandlerCalls
      expect(unregisteredChannels).toContain(CryptoChannels.invoke.HAS_KEYS)
      expect(unregisteredChannels).toContain(CryptoChannels.invoke.GENERATE_RECOVERY_PHRASE)
    })
  })

  describe('HAS_KEYS', () => {
    it('should return hasKeys: true when keys exist', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.hasKeyMaterial as Mock).mockResolvedValue(true)
      ;(crypto.retrieveKeyMaterial as Mock).mockResolvedValue({
        deviceId: 'device-123',
        userId: 'user-456'
      })

      // #when
      const result = await invokeHandler(CryptoChannels.invoke.HAS_KEYS)

      // #then
      expect(result).toEqual({
        hasKeys: true,
        deviceId: 'device-123',
        userId: 'user-456'
      })
    })

    it('should return hasKeys: false when no keys exist', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.hasKeyMaterial as Mock).mockResolvedValue(false)

      // #when
      const result = await invokeHandler(CryptoChannels.invoke.HAS_KEYS)

      // #then
      expect(result).toEqual({ hasKeys: false })
    })

    it('should return hasKeys: false on error', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.hasKeyMaterial as Mock).mockRejectedValue(new Error('Keychain error'))

      // #when
      const result = await invokeHandler(CryptoChannels.invoke.HAS_KEYS)

      // #then
      expect(result).toEqual({ hasKeys: false })
    })
  })

  describe('GENERATE_RECOVERY_PHRASE', () => {
    it('should generate a 24-word recovery phrase', async () => {
      // #given
      registerCryptoHandlers()
      const mockPhrase = [
        'abandon',
        'ability',
        'able',
        'about',
        'above',
        'absent',
        'absorb',
        'abstract',
        'absurd',
        'abuse',
        'access',
        'accident',
        'account',
        'accuse',
        'achieve',
        'acid',
        'acoustic',
        'acquire',
        'across',
        'act',
        'action',
        'actor',
        'actress',
        'actual'
      ]
      ;(crypto.generateRecoveryPhrase as Mock).mockReturnValue(mockPhrase)

      // #when
      const result = (await invokeHandler(CryptoChannels.invoke.GENERATE_RECOVERY_PHRASE)) as {
        phrase: string[]
      }

      // #then
      expect(result.phrase).toEqual(mockPhrase)
      expect(result.phrase).toHaveLength(24)
    })
  })

  describe('DERIVE_KEYS', () => {
    it('should derive keys from valid recovery phrase', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.validateRecoveryPhrase as Mock).mockReturnValue(true)
      ;(crypto.deriveAllKeys as Mock).mockResolvedValue({
        vaultKey: new Uint8Array(32),
        signingKeyPair: { publicKey: new Uint8Array(32), privateKey: new Uint8Array(64) },
        verifyKey: new Uint8Array(32).fill(1)
      })

      const input = {
        phrase: Array(24).fill('word'),
        kdfSalt: Buffer.from(new Uint8Array(16)).toString('base64')
      }

      // #when
      const result = (await invokeHandler(CryptoChannels.invoke.DERIVE_KEYS, input)) as {
        success: boolean
        keyVerifier?: string
      }

      // #then
      expect(result.success).toBe(true)
      expect(result.keyVerifier).toBeDefined()
    })

    it('should return error for invalid recovery phrase', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.validateRecoveryPhrase as Mock).mockReturnValue(false)

      const input = {
        phrase: Array(24).fill('invalidword'),
        kdfSalt: Buffer.from(new Uint8Array(16)).toString('base64')
      }

      // #when
      const result = (await invokeHandler(CryptoChannels.invoke.DERIVE_KEYS, input)) as {
        success: boolean
        error?: string
      }

      // #then
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid recovery phrase')
    })

    it('should securely zero derived keys after use', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.validateRecoveryPhrase as Mock).mockReturnValue(true)
      const mockKeys = {
        vaultKey: new Uint8Array(32),
        signingKeyPair: { publicKey: new Uint8Array(32), privateKey: new Uint8Array(64) },
        verifyKey: new Uint8Array(32)
      }
      ;(crypto.deriveAllKeys as Mock).mockResolvedValue(mockKeys)

      const input = {
        phrase: Array(24).fill('word'),
        kdfSalt: Buffer.from(new Uint8Array(16)).toString('base64')
      }

      // #when
      await invokeHandler(CryptoChannels.invoke.DERIVE_KEYS, input)

      // #then
      expect(crypto.secureZero).toHaveBeenCalled()
    })
  })

  describe('ENCRYPT_ITEM', () => {
    it('should encrypt item successfully', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.retrieveKeyMaterial as Mock).mockResolvedValue({
        masterKey: 'base64masterkey',
        deviceSigningKey: 'base64devkey',
        devicePublicKey: 'base64pubkey',
        deviceId: '550e8400-e29b-41d4-a716-446655440001',
        userId: 'user-123'
      })
      ;(crypto.retrieveDeviceKeyPair as Mock).mockResolvedValue({
        publicKey: new Uint8Array(32),
        privateKey: new Uint8Array(64),
        deviceId: '550e8400-e29b-41d4-a716-446655440001'
      })

      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'note',
        operation: 'create' as const,
        data: 'test content'
      }

      // #when
      const result = (await invokeHandler(CryptoChannels.invoke.ENCRYPT_ITEM, input)) as {
        success: boolean
        item?: EncryptedItem
      }

      // #then
      expect(result.success).toBe(true)
      expect(result.item).toBeDefined()
      expect(result.item?.id).toBe(input.id)
      expect(result.item?.type).toBe('note')
      expect(result.item?.cryptoVersion).toBe(CRYPTO_VERSION)
      expect(result.item?.signature).toBe('signature123')
    })

    it('should return error when no keys available', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.retrieveKeyMaterial as Mock).mockResolvedValue(null)

      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'note',
        operation: 'create' as const,
        data: 'test content'
      }

      // #when
      const result = (await invokeHandler(CryptoChannels.invoke.ENCRYPT_ITEM, input)) as {
        success: boolean
        error?: string
      }

      // #then
      expect(result.success).toBe(false)
      expect(result.error).toContain('No keys available')
    })

    it('should return error when no device keypair available', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.retrieveKeyMaterial as Mock).mockResolvedValue({
        masterKey: 'base64masterkey',
        deviceSigningKey: 'base64devkey',
        devicePublicKey: 'base64pubkey',
        deviceId: '550e8400-e29b-41d4-a716-446655440001',
        userId: 'user-123'
      })
      ;(crypto.retrieveDeviceKeyPair as Mock).mockResolvedValue(null)

      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'note',
        operation: 'create' as const,
        data: 'test content'
      }

      // #when
      const result = (await invokeHandler(CryptoChannels.invoke.ENCRYPT_ITEM, input)) as {
        success: boolean
        error?: string
      }

      // #then
      expect(result.success).toBe(false)
      expect(result.error).toContain('No device keypair available')
    })
  })

  describe('DECRYPT_ITEM', () => {
    it('should decrypt item successfully', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.retrieveKeyMaterial as Mock).mockResolvedValue({
        masterKey: 'base64masterkey',
        deviceSigningKey: 'base64devkey',
        devicePublicKey: 'base64pubkey',
        deviceId: '550e8400-e29b-41d4-a716-446655440001',
        userId: 'user-123'
      })
      ;(crypto.decryptWithWrappedKey as Mock).mockResolvedValue(
        new TextEncoder().encode('decrypted content')
      )

      const encryptedItem: EncryptedItem = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'note',
        cryptoVersion: CRYPTO_VERSION,
        encryptedKey: 'encKey',
        keyNonce: 'keyNonce',
        encryptedData: 'encData',
        dataNonce: 'dataNonce',
        signature: 'sig',
        signerDeviceId: '550e8400-e29b-41d4-a716-446655440001'
      }

      // #when
      const result = (await invokeHandler(CryptoChannels.invoke.DECRYPT_ITEM, {
        item: encryptedItem
      })) as {
        success: boolean
        data?: string
      }

      // #then
      expect(result.success).toBe(true)
      expect(result.data).toBe('decrypted content')
    })

    it('should return error when no keys available', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.retrieveKeyMaterial as Mock).mockResolvedValue(null)

      const encryptedItem: EncryptedItem = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'note',
        cryptoVersion: CRYPTO_VERSION,
        encryptedKey: 'encKey',
        keyNonce: 'keyNonce',
        encryptedData: 'encData',
        dataNonce: 'dataNonce',
        signature: 'sig',
        signerDeviceId: '550e8400-e29b-41d4-a716-446655440001'
      }

      // #when
      const result = (await invokeHandler(CryptoChannels.invoke.DECRYPT_ITEM, {
        item: encryptedItem
      })) as {
        success: boolean
        error?: string
      }

      // #then
      expect(result.success).toBe(false)
      expect(result.error).toContain('No keys available')
    })
  })

  describe('VERIFY_SIGNATURE', () => {
    it('should verify valid signature', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.verifyPayload as Mock).mockResolvedValue({ valid: true })

      const encryptedItem: EncryptedItem = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'note',
        cryptoVersion: CRYPTO_VERSION,
        encryptedKey: 'encKey',
        keyNonce: 'keyNonce',
        encryptedData: 'encData',
        dataNonce: 'dataNonce',
        signature: 'validSig',
        signerDeviceId: '550e8400-e29b-41d4-a716-446655440001'
      }

      // #when
      const result = (await invokeHandler(CryptoChannels.invoke.VERIFY_SIGNATURE, {
        item: encryptedItem,
        signerPublicKey: 'publicKey123'
      })) as { valid: boolean }

      // #then
      expect(result.valid).toBe(true)
    })

    it('should reject invalid signature', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.verifyPayload as Mock).mockResolvedValue({
        valid: false,
        error: 'Signature mismatch'
      })

      const encryptedItem: EncryptedItem = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'note',
        cryptoVersion: CRYPTO_VERSION,
        encryptedKey: 'encKey',
        keyNonce: 'keyNonce',
        encryptedData: 'encData',
        dataNonce: 'dataNonce',
        signature: 'invalidSig',
        signerDeviceId: '550e8400-e29b-41d4-a716-446655440001'
      }

      // #when
      const result = (await invokeHandler(CryptoChannels.invoke.VERIFY_SIGNATURE, {
        item: encryptedItem,
        signerPublicKey: 'publicKey123'
      })) as { valid: boolean; error?: string }

      // #then
      expect(result.valid).toBe(false)
    })

    it('should include clock metadata in verification when present', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.verifyPayload as Mock).mockResolvedValue({ valid: true })

      const encryptedItem: EncryptedItem = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'note',
        cryptoVersion: CRYPTO_VERSION,
        encryptedKey: 'encKey',
        keyNonce: 'keyNonce',
        encryptedData: 'encData',
        dataNonce: 'dataNonce',
        signature: 'validSig',
        signerDeviceId: '550e8400-e29b-41d4-a716-446655440001',
        clock: { 'device-a': 1, 'device-b': 2 },
        fieldClocks: { title: { 'device-a': 1 } }
      }

      // #when
      await invokeHandler(CryptoChannels.invoke.VERIFY_SIGNATURE, {
        item: encryptedItem,
        signerPublicKey: 'publicKey123'
      })

      // #then
      expect(crypto.verifyPayload).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            clock: { 'device-a': 1, 'device-b': 2 },
            fieldClocks: { title: { 'device-a': 1 } }
          }
        }),
        'validSig',
        'publicKey123'
      )
    })
  })

  describe('DELETE_KEYS', () => {
    it('should delete keys and emit event', async () => {
      // #given
      registerCryptoHandlers()

      // #when
      const result = (await invokeHandler(CryptoChannels.invoke.DELETE_KEYS)) as {
        success: boolean
      }

      // #then
      expect(result.success).toBe(true)
      expect(crypto.deleteKeyMaterial).toHaveBeenCalled()
      expect(mockSend).toHaveBeenCalledWith(CryptoChannels.events.KEYS_DELETED, {})
    })

    it('should return error on delete failure', async () => {
      // #given
      registerCryptoHandlers()
      ;(crypto.deleteKeyMaterial as Mock).mockRejectedValue(new Error('Delete failed'))

      // #when
      const result = (await invokeHandler(CryptoChannels.invoke.DELETE_KEYS)) as {
        success: boolean
      }

      // #then
      expect(result.success).toBe(false)
    })
  })
})
