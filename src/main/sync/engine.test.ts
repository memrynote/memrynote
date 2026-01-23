/**
 * Sync Engine Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SyncEngine } from './engine'

vi.mock('electron', () => ({
  BrowserWindow: {
    getAllWindows: vi.fn().mockReturnValue([])
  }
}))

vi.mock('./queue', () => ({
  getSyncQueue: vi.fn().mockReturnValue({
    isEmpty: vi.fn().mockReturnValue(true),
    getAll: vi.fn().mockReturnValue([]),
    remove: vi.fn(),
    updateAttempt: vi.fn()
  })
}))

vi.mock('./network', () => ({
  getNetworkMonitor: vi.fn().mockReturnValue({
    isOnline: vi.fn().mockReturnValue(true),
    on: vi.fn()
  })
}))

vi.mock('./websocket', () => ({
  getWebSocketManager: vi.fn().mockReturnValue({
    on: vi.fn()
  })
}))

const mockDbSelect = vi.fn().mockReturnThis()
const mockDbFrom = vi.fn().mockReturnThis()
const mockDbWhere = vi.fn().mockReturnThis()
const mockDbLimit = vi.fn().mockResolvedValue([])
const mockDbInsert = vi.fn().mockReturnThis()
const mockDbValues = vi.fn().mockReturnThis()
const mockDbOnConflictDoUpdate = vi.fn().mockResolvedValue(undefined)

vi.mock('../database/client', () => ({
  getDatabase: () => ({
    select: mockDbSelect,
    from: mockDbFrom,
    where: mockDbWhere,
    limit: mockDbLimit,
    insert: mockDbInsert,
    values: mockDbValues,
    onConflictDoUpdate: mockDbOnConflictDoUpdate
  })
}))

vi.mock('../crypto', () => ({
  generateFileKey: vi.fn().mockResolvedValue(new Uint8Array(32)),
  wrapFileKey: vi.fn().mockResolvedValue({
    encryptedKey: 'mock-encrypted-key',
    keyNonce: 'mock-key-nonce'
  }),
  unwrapFileKey: vi.fn().mockResolvedValue(new Uint8Array(32)),
  encrypt: vi.fn().mockResolvedValue({
    ciphertext: new Uint8Array([1, 2, 3]),
    nonce: new Uint8Array(24)
  }),
  decrypt: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  uint8ArrayToBase64: vi.fn().mockReturnValue('base64-data'),
  base64ToUint8Array: vi.fn().mockReturnValue(new Uint8Array(32)),
  retrieveKeyMaterial: vi.fn().mockResolvedValue({
    masterKey: 'mock-master-key',
    kdfSalt: 'mock-salt',
    deviceSigningKey: 'mock-signing-key',
    devicePublicKey: 'mock-public-key',
    deviceId: 'mock-device-id',
    userId: 'mock-user-id'
  }),
  retrieveDeviceKeyPair: vi.fn().mockResolvedValue({
    publicKey: new Uint8Array(32),
    privateKey: new Uint8Array(64),
    deviceId: 'mock-device-id'
  }),
  deriveVaultKey: vi.fn().mockResolvedValue(new Uint8Array(32)),
  secureZero: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('../crypto/signatures', () => ({
  signPayloadBase64: vi.fn().mockResolvedValue('mock-signature'),
  verifyPayload: vi.fn().mockResolvedValue({ valid: true })
}))

vi.mock('./api-client', () => {
  class MockSyncApiError extends Error {
    constructor(
      message: string,
      public readonly status: number,
      public readonly code?: string
    ) {
      super(message)
      this.name = 'SyncApiError'
    }
  }

  return {
    getSyncApiClient: vi.fn().mockReturnValue({
      pushItems: vi.fn().mockResolvedValue({
        accepted: [],
        rejected: [],
        conflicts: [],
        serverCursor: 0
      }),
      pullItems: vi.fn().mockResolvedValue({
        items: [],
        hasMore: false,
        nextCursor: 0,
        serverTime: Date.now()
      })
    }),
    SyncApiError: MockSyncApiError
  }
})

describe('SyncEngine', () => {
  let engine: SyncEngine

  beforeEach(() => {
    vi.clearAllMocks()
    engine = new SyncEngine()
  })

  describe('status', () => {
    it('should start with idle status', () => {
      // #given / #when / #then
      expect(engine.status).toBe('idle')
    })
  })

  describe('initialize', () => {
    it('should load status from database', async () => {
      // #given
      mockDbLimit.mockResolvedValueOnce([{ value: 'syncing' }])

      // #when
      await engine.initialize()

      // #then
      expect(engine.status).toBe('syncing')
    })
  })

  describe('push', () => {
    it('should return null when queue is empty', async () => {
      // #given
      await engine.initialize()

      // #when
      const result = await engine.push()

      // #then
      expect(result).toBeNull()
    })

    it('should emit sync:status-changed when starting push', async () => {
      // #given
      const { getSyncQueue } = await import('./queue')
      vi.mocked(getSyncQueue).mockReturnValue({
        isEmpty: vi.fn().mockReturnValue(false),
        getAll: vi.fn().mockReturnValue([
          {
            id: 'queue-1',
            type: 'task',
            itemId: 'task-123',
            operation: 'create',
            payload: '{"title":"Test"}',
            priority: 0,
            attempts: 0,
            lastAttempt: null,
            errorMessage: null,
            createdAt: '2024-01-01T00:00:00.000Z'
          }
        ]),
        remove: vi.fn(),
        updateAttempt: vi.fn()
      } as never)

      const onStatusChanged = vi.fn()
      engine.on('sync:status-changed', onStatusChanged)
      await engine.initialize()

      // #when
      await engine.push()

      // #then
      expect(onStatusChanged).toHaveBeenCalledWith('syncing')
    })
  })

  describe('pull', () => {
    it('should return null when offline', async () => {
      // #given
      const { getNetworkMonitor } = await import('./network')
      vi.mocked(getNetworkMonitor).mockReturnValue({
        isOnline: vi.fn().mockReturnValue(false),
        on: vi.fn()
      } as never)

      engine = new SyncEngine()
      await engine.initialize()

      // #when
      const result = await engine.pull()

      // #then
      expect(result).toBeNull()
      expect(engine.status).toBe('offline')
    })
  })

  describe('pause/resume', () => {
    it('should set status to paused', async () => {
      // #given
      await engine.initialize()

      // #when
      engine.pause()

      // #then
      expect(engine.status).toBe('paused')
    })

    it('should resume from paused to idle', async () => {
      // #given
      await engine.initialize()
      engine.pause()

      // #when
      engine.resume()

      // #then
      expect(engine.status).toBe('idle')
    })

    it('should not resume if not paused', async () => {
      // #given
      await engine.initialize()
      expect(engine.status).toBe('idle')

      // #when
      engine.resume()

      // #then
      expect(engine.status).toBe('idle')
    })
  })

  describe('encryptItem', () => {
    it('should encrypt item data and return encrypted item', async () => {
      // #given
      await engine.initialize()

      // #when
      const encrypted = await engine.encryptItem('task', 'task-123', { title: 'Test' })

      // #then
      expect(encrypted.itemType).toBe('task')
      expect(encrypted.itemId).toBe('task-123')
      expect(encrypted.encryptedData).toBeTruthy()
      expect(encrypted.encryptedKey).toBeTruthy()
      expect(encrypted.signature).toBeTruthy()
      expect(encrypted.signerDeviceId).toBe('mock-device-id')
    })

    it('should include content hash and size', async () => {
      // #given
      await engine.initialize()

      // #when
      const encrypted = await engine.encryptItem('task', 'task-123', { title: 'Test' })

      // #then
      expect(encrypted.contentHash).toBeTruthy()
      expect(encrypted.sizeBytes).toBeGreaterThan(0)
    })
  })

  describe('decryptItem', () => {
    it('should verify signature and decrypt item', async () => {
      // #given
      await engine.initialize()
      const item = {
        itemType: 'task' as const,
        itemId: 'task-123',
        userId: 'user-123',
        encryptedData: 'base64-data',
        encryptedKey: 'base64-key',
        keyNonce: 'base64-key-nonce',
        dataNonce: 'base64-data-nonce',
        deleted: false,
        cryptoVersion: 1,
        sizeBytes: 100,
        contentHash: 'abc123',
        signerDeviceId: 'mock-device-id',
        signature: 'mock-signature',
        serverCursor: 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      const { decrypt } = await import('../crypto')
      vi.mocked(decrypt).mockResolvedValue(
        new TextEncoder().encode(JSON.stringify({ title: 'Test' }))
      )

      // #when
      const decrypted = await engine.decryptItem(item, 'base64-public-key')

      // #then
      expect(decrypted.itemType).toBe('task')
      expect(decrypted.itemId).toBe('task-123')
      expect(decrypted.data).toEqual({ title: 'Test' })
    })

    it('should throw on invalid signature', async () => {
      // #given
      await engine.initialize()
      const item = {
        itemType: 'task' as const,
        itemId: 'task-123',
        userId: 'user-123',
        encryptedData: 'base64-data',
        encryptedKey: 'base64-key',
        keyNonce: 'base64-key-nonce',
        dataNonce: 'base64-data-nonce',
        deleted: false,
        cryptoVersion: 1,
        sizeBytes: 100,
        contentHash: 'abc123',
        signerDeviceId: 'mock-device-id',
        signature: 'invalid-signature',
        serverCursor: 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      const { verifyPayload } = await import('../crypto/signatures')
      vi.mocked(verifyPayload).mockResolvedValue({ valid: false, error: 'Invalid signature' })

      // #when / #then
      await expect(engine.decryptItem(item, 'base64-public-key')).rejects.toThrow(
        'Signature verification failed'
      )
    })
  })

  describe('sync lock', () => {
    it('should prevent concurrent push operations', async () => {
      // #given
      const { getSyncQueue } = await import('./queue')
      vi.mocked(getSyncQueue).mockReturnValue({
        isEmpty: vi.fn().mockReturnValue(false),
        getAll: vi.fn().mockReturnValue([
          {
            id: 'queue-1',
            type: 'task',
            itemId: 'task-123',
            operation: 'create',
            payload: '{"title":"Test"}',
            priority: 0,
            attempts: 0,
            lastAttempt: null,
            errorMessage: null,
            createdAt: '2024-01-01T00:00:00.000Z'
          }
        ]),
        remove: vi.fn(),
        updateAttempt: vi.fn()
      } as never)

      await engine.initialize()

      // Simulate a slow push by delaying the API response
      const { getSyncApiClient } = await import('./api-client')
      vi.mocked(getSyncApiClient).mockReturnValue({
        pushItems: vi.fn().mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    accepted: ['task-123'],
                    rejected: [],
                    conflicts: [],
                    serverCursor: 1
                  }),
                100
              )
            )
        ),
        pullItems: vi.fn().mockResolvedValue({
          items: [],
          hasMore: false,
          nextCursor: 0,
          serverTime: Date.now()
        })
      } as never)

      // #when
      const push1 = engine.push()
      const push2 = engine.push()

      const [_result1, result2] = await Promise.all([push1, push2])

      // #then - second push should return null because first is in progress
      expect(result2).toBeNull()
    })

    it('should expose isSyncing property', async () => {
      // #given
      await engine.initialize()

      // #then
      expect(engine.isSyncing).toBe(false)
    })
  })

  describe('session expired', () => {
    it('should have session-expired event type defined', () => {
      // #then - verify the event type is properly defined
      expect(engine.listenerCount('sync:session-expired')).toBe(0)
      const handler = vi.fn()
      engine.on('sync:session-expired', handler)
      expect(engine.listenerCount('sync:session-expired')).toBe(1)
    })
  })
})
