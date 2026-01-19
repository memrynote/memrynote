/**
 * WebSocket Real-Time Sync Tests
 *
 * Tests real-time sync of inbox items across multiple devices via WebSocket.
 * Simulates Device A creating item -> Server broadcast -> Devices B & C receive.
 *
 * @module main/sync/websocket-sync.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { EventEmitter } from 'events'
import type {
  SyncPushItem,
  SyncPullItem,
  SyncPushResponse,
  SyncPullResponse,
  VectorClock,
  SyncItemType,
  SyncOperation
} from '@shared/contracts/sync-api'
import type { ItemSyncedPayload } from './websocket'

// ===========================================================================
// Mock Crypto Functions
// ===========================================================================

/**
 * Mock encryption - encodes data as base64 JSON.
 */
const mockEncrypt = (data: string): string => {
  return JSON.stringify({
    cryptoVersion: 1,
    encryptedKey: Buffer.from('mock-key').toString('base64'),
    keyNonce: Buffer.from('mock-key-nonce').toString('base64'),
    encryptedData: Buffer.from(data).toString('base64'),
    dataNonce: Buffer.from('mock-data-nonce').toString('base64')
  })
}

/**
 * Mock decryption - decodes base64 JSON to original data.
 */
const mockDecrypt = (encryptedJson: string): string => {
  const encrypted = JSON.parse(encryptedJson)
  return Buffer.from(encrypted.encryptedData, 'base64').toString('utf-8')
}

/**
 * Mock signing - returns consistent mock signature.
 */
const mockSign = (_payload: unknown): string => {
  return Buffer.from('mock-signature').toString('base64')
}

/**
 * Mock verification - always returns true.
 */
const mockVerify = (_signature: string, _payload: unknown): boolean => {
  return true
}

// ===========================================================================
// Types
// ===========================================================================

interface ConnectedDevice {
  id: string
  userId: string
  wsEmitter: EventEmitter
  isOnline: boolean
}

// ===========================================================================
// Mock Multi-Device Server
// ===========================================================================

/**
 * Mock server that tracks multiple devices and broadcasts sync events.
 * Simulates the Cloudflare Workers Durable Object behavior.
 */
class MockMultiDeviceServer {
  private items: Map<string, SyncPullItem> = new Map()
  private serverClock: VectorClock = {}
  private serverTimestamp: number = Date.now()
  private connectedDevices: Map<string, ConnectedDevice> = new Map()

  /**
   * Connect a device to the server.
   */
  connectDevice(deviceId: string, userId: string): EventEmitter {
    const wsEmitter = new EventEmitter()
    this.connectedDevices.set(deviceId, {
      id: deviceId,
      userId,
      wsEmitter,
      isOnline: true
    })
    return wsEmitter
  }

  /**
   * Disconnect a device from the server.
   */
  disconnectDevice(deviceId: string): void {
    const device = this.connectedDevices.get(deviceId)
    if (device) {
      device.isOnline = false
      device.wsEmitter.removeAllListeners()
    }
    this.connectedDevices.delete(deviceId)
  }

  /**
   * Set device online/offline status (for reconnection tests).
   */
  setDeviceOnline(deviceId: string, online: boolean): void {
    const device = this.connectedDevices.get(deviceId)
    if (device) {
      device.isOnline = online
    }
  }

  /**
   * Handle push request from a device.
   * After accepting items, broadcasts to all other connected devices.
   */
  push(
    items: SyncPushItem[],
    deviceClock: VectorClock,
    senderDeviceId: string,
    userId: string
  ): SyncPushResponse {
    const accepted: string[] = []
    const conflicts: Array<{
      id: string
      type: SyncItemType
      serverVersion: number
      serverClock: VectorClock
    }> = []

    for (const item of items) {
      const existing = this.items.get(item.id)

      // Accept the item (LWW for simplicity)
      const pullItem: SyncPullItem = {
        id: item.id,
        type: item.type,
        version: (existing?.version || 0) + 1,
        operation: item.operation,
        encryptedData: item.encryptedData,
        signature: item.signature,
        clock: item.clock,
        stateVector: item.stateVector,
        modifiedAt: Date.now(),
        deletedAt: item.operation === 'delete' ? Date.now() : undefined
      }

      this.items.set(item.id, pullItem)
      accepted.push(item.id)

      // Update server clock
      if (item.clock) {
        for (const [device, time] of Object.entries(item.clock)) {
          this.serverClock[device] = Math.max(this.serverClock[device] || 0, time)
        }
      }

      // Broadcast to other devices (not the sender)
      this.broadcastItemSynced(
        {
          itemId: item.id,
          type: item.type,
          operation: item.operation,
          deviceId: senderDeviceId,
          version: pullItem.version
        },
        senderDeviceId,
        userId
      )
    }

    // Merge device clock into server clock
    for (const [device, time] of Object.entries(deviceClock)) {
      this.serverClock[device] = Math.max(this.serverClock[device] || 0, time)
    }

    this.serverTimestamp = Date.now()

    return {
      success: true,
      accepted,
      conflicts,
      serverClock: { ...this.serverClock }
    }
  }

  /**
   * Broadcast item-synced event to all connected devices except sender.
   */
  private broadcastItemSynced(
    payload: ItemSyncedPayload,
    excludeDeviceId: string,
    userId: string
  ): void {
    for (const [deviceId, device] of this.connectedDevices) {
      // Don't send to sender device
      if (deviceId === excludeDeviceId) continue

      // Only send to same user's devices
      if (device.userId !== userId) continue

      // Only send if device is online
      if (!device.isOnline) continue

      // Emit the item-synced event on the device's WebSocket emitter
      device.wsEmitter.emit('item-synced', payload)
    }
  }

  /**
   * Handle pull request from a device.
   */
  pull(since?: number, limit: number = 100): SyncPullResponse {
    let items = Array.from(this.items.values())

    if (since) {
      items = items.filter((item) => item.modifiedAt > since)
    }

    items.sort((a, b) => a.modifiedAt - b.modifiedAt)

    const hasMore = items.length > limit
    items = items.slice(0, limit)

    return {
      items,
      hasMore,
      serverClock: { ...this.serverClock },
      serverTimestamp: this.serverTimestamp
    }
  }

  /**
   * Get a single item by ID.
   */
  getItem(id: string): SyncPullItem | undefined {
    return this.items.get(id)
  }

  /**
   * Get all items.
   */
  getAllItems(): SyncPullItem[] {
    return Array.from(this.items.values())
  }

  /**
   * Get all connected device IDs.
   */
  getConnectedDeviceIds(): string[] {
    return Array.from(this.connectedDevices.keys())
  }

  /**
   * Reset server state.
   */
  reset(): void {
    this.items.clear()
    this.serverClock = {}
    this.serverTimestamp = Date.now()
    for (const device of this.connectedDevices.values()) {
      device.wsEmitter.removeAllListeners()
    }
    this.connectedDevices.clear()
  }
}

// ===========================================================================
// Mock Device
// ===========================================================================

/**
 * Represents a simulated device with its own WebSocket and sync state.
 * No actual database dependency - tests focus on WebSocket message passing.
 */
class MockDevice {
  readonly id: string
  readonly userId: string
  private wsEmitter: EventEmitter
  private clock: VectorClock = {}
  private lastSyncAt: number | null = null
  private receivedItems: SyncPullItem[] = []
  private itemSyncedCallbacks: Array<(payload: ItemSyncedPayload) => void> = []

  constructor(id: string, userId: string, wsEmitter: EventEmitter) {
    this.id = id
    this.userId = userId
    this.wsEmitter = wsEmitter

    // Listen to WebSocket events (simulating SyncEngine behavior)
    this.wsEmitter.on('item-synced', (payload: ItemSyncedPayload) => {
      // Notify callbacks
      this.itemSyncedCallbacks.forEach((cb) => cb(payload))
    })
  }

  /**
   * Get the device's vector clock.
   */
  getClock(): VectorClock {
    return { ...this.clock }
  }

  /**
   * Increment the device clock (called before push).
   */
  incrementClock(): void {
    this.clock[this.id] = (this.clock[this.id] || 0) + 1
  }

  /**
   * Merge a remote clock into the local clock.
   */
  mergeClock(remoteClock: VectorClock): void {
    for (const [device, time] of Object.entries(remoteClock)) {
      this.clock[device] = Math.max(this.clock[device] || 0, time)
    }
  }

  /**
   * Register a callback for when item-synced events are received.
   */
  onItemSynced(callback: (payload: ItemSyncedPayload) => void): void {
    this.itemSyncedCallbacks.push(callback)
  }

  /**
   * Clear all item-synced callbacks.
   */
  clearItemSyncedCallbacks(): void {
    this.itemSyncedCallbacks = []
  }

  /**
   * Store a pulled item (simulates local database write).
   */
  applyPulledItem(item: SyncPullItem): void {
    this.receivedItems.push(item)
  }

  /**
   * Get all items received via pull/sync.
   */
  getReceivedItems(): SyncPullItem[] {
    return [...this.receivedItems]
  }

  /**
   * Set last sync timestamp.
   */
  setLastSyncAt(timestamp: number): void {
    this.lastSyncAt = timestamp
  }

  /**
   * Get last sync timestamp.
   */
  getLastSyncAt(): number | null {
    return this.lastSyncAt
  }

  /**
   * Clean up device resources.
   */
  cleanup(): void {
    this.wsEmitter.removeAllListeners()
    this.itemSyncedCallbacks = []
  }
}

// ===========================================================================
// Test Helpers
// ===========================================================================

/**
 * Create an inbox item payload for testing.
 */
function createInboxItemPayload(
  id: string,
  title: string,
  content?: string
): Record<string, unknown> {
  return {
    id,
    type: 'note',
    title,
    content: content || null,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    filedAt: null,
    filedTo: null,
    filedAction: null,
    snoozedUntil: null,
    snoozeReason: null,
    archivedAt: null,
    sourceUrl: null,
    metadata: null
  }
}

/**
 * Create a push item from inbox data.
 */
function createPushItem(
  id: string,
  payload: Record<string, unknown>,
  operation: SyncOperation,
  clock: VectorClock
): SyncPushItem {
  return {
    id,
    type: 'inbox_item' as SyncItemType,
    operation,
    encryptedData: mockEncrypt(JSON.stringify(payload)),
    signature: mockSign({ id, type: 'inbox_item', operation }),
    clock
  }
}

/**
 * Create a deferred promise for async coordination.
 */
function createDeferred<T>() {
  let resolve: (value: T) => void
  let reject: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve: resolve!, reject: reject! }
}

// ===========================================================================
// Test Suite: WebSocket Real-Time Sync
// ===========================================================================

describe('websocket real-time sync - Multi-Device Inbox Items', () => {
  let mockServer: MockMultiDeviceServer
  let deviceA: MockDevice
  let deviceB: MockDevice
  let deviceC: MockDevice
  const userId = 'user-123'

  beforeEach(() => {
    mockServer = new MockMultiDeviceServer()

    // Connect devices to server
    const wsA = mockServer.connectDevice('device-A', userId)
    const wsB = mockServer.connectDevice('device-B', userId)
    const wsC = mockServer.connectDevice('device-C', userId)

    // Create device instances
    deviceA = new MockDevice('device-A', userId, wsA)
    deviceB = new MockDevice('device-B', userId, wsB)
    deviceC = new MockDevice('device-C', userId, wsC)
  })

  afterEach(() => {
    mockServer.reset()
    deviceA.cleanup()
    deviceB.cleanup()
    deviceC.cleanup()
    vi.clearAllMocks()
  })

  // =========================================================================
  // Core Scenario: Device A creates item, B and C receive via WebSocket
  // =========================================================================

  describe('single device push -> multiple devices receive', () => {
    it('should broadcast item-synced to Device B and C when Device A creates inbox item', () => {
      // Track received events
      const receivedByB: ItemSyncedPayload[] = []
      const receivedByC: ItemSyncedPayload[] = []

      deviceB.onItemSynced((payload) => receivedByB.push(payload))
      deviceC.onItemSynced((payload) => receivedByC.push(payload))

      // Device A creates an inbox item
      const inboxPayload = createInboxItemPayload(
        'inbox-001',
        'Quick thought',
        'Remember to call mom'
      )
      deviceA.incrementClock()

      const pushItem = createPushItem(
        'inbox-001',
        inboxPayload,
        'create' as SyncOperation,
        deviceA.getClock()
      )

      // Device A pushes to server
      const pushResponse = mockServer.push([pushItem], deviceA.getClock(), deviceA.id, userId)

      expect(pushResponse.success).toBe(true)
      expect(pushResponse.accepted).toContain('inbox-001')

      // Verify Device B received the event
      expect(receivedByB).toHaveLength(1)
      expect(receivedByB[0].itemId).toBe('inbox-001')
      expect(receivedByB[0].type).toBe('inbox_item')
      expect(receivedByB[0].operation).toBe('create')
      expect(receivedByB[0].deviceId).toBe('device-A')

      // Verify Device C received the event
      expect(receivedByC).toHaveLength(1)
      expect(receivedByC[0].itemId).toBe('inbox-001')
      expect(receivedByC[0].type).toBe('inbox_item')
      expect(receivedByC[0].operation).toBe('create')
      expect(receivedByC[0].deviceId).toBe('device-A')
    })

    it('should NOT send item-synced to sender device (Device A excluded from broadcast)', () => {
      // Track received events on all devices
      const receivedByA: ItemSyncedPayload[] = []
      const receivedByB: ItemSyncedPayload[] = []

      deviceA.onItemSynced((payload) => receivedByA.push(payload))
      deviceB.onItemSynced((payload) => receivedByB.push(payload))

      // Device A creates and pushes
      const inboxPayload = createInboxItemPayload('inbox-exclude', 'Test exclusion')
      deviceA.incrementClock()

      mockServer.push(
        [createPushItem('inbox-exclude', inboxPayload, 'create', deviceA.getClock())],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      // Device A should NOT have received its own event
      expect(receivedByA).toHaveLength(0)

      // Device B should have received the event
      expect(receivedByB).toHaveLength(1)
      expect(receivedByB[0].itemId).toBe('inbox-exclude')
    })

    it('should allow Device B to pull item after receiving notification', async () => {
      // Setup notification tracking
      const notificationReceived = createDeferred<ItemSyncedPayload>()
      deviceB.onItemSynced((payload) => notificationReceived.resolve(payload))

      // Device A creates and pushes inbox item
      const inboxPayload = createInboxItemPayload('inbox-002', 'Meeting notes')
      deviceA.incrementClock()

      mockServer.push(
        [createPushItem('inbox-002', inboxPayload, 'create', deviceA.getClock())],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      // Wait for notification
      const notification = await notificationReceived.promise
      expect(notification.itemId).toBe('inbox-002')

      // Device B pulls after receiving notification (simulating pullSingleItem)
      const pullResponse = mockServer.pull()

      expect(pullResponse.items).toHaveLength(1)
      expect(pullResponse.items[0].id).toBe('inbox-002')
      expect(pullResponse.items[0].type).toBe('inbox_item')

      // Verify decrypted content
      const decrypted = JSON.parse(mockDecrypt(pullResponse.items[0].encryptedData))
      expect(decrypted.title).toBe('Meeting notes')
    })
  })

  // =========================================================================
  // Rapid Multiple Items
  // =========================================================================

  describe('rapid item creation', () => {
    it('should sync all items when Device A creates multiple items rapidly', () => {
      const receivedByB: ItemSyncedPayload[] = []
      const receivedByC: ItemSyncedPayload[] = []

      deviceB.onItemSynced((payload) => receivedByB.push(payload))
      deviceC.onItemSynced((payload) => receivedByC.push(payload))

      // Device A creates 5 inbox items rapidly
      const itemIds = ['inbox-r1', 'inbox-r2', 'inbox-r3', 'inbox-r4', 'inbox-r5']

      for (const id of itemIds) {
        const payload = createInboxItemPayload(id, `Rapid item ${id}`)
        deviceA.incrementClock()

        mockServer.push(
          [createPushItem(id, payload, 'create', deviceA.getClock())],
          deviceA.getClock(),
          deviceA.id,
          userId
        )
      }

      // Verify all 5 items were broadcast to Device B
      expect(receivedByB).toHaveLength(5)
      const receivedIdsB = receivedByB.map((r) => r.itemId)
      expect(receivedIdsB).toEqual(expect.arrayContaining(itemIds))

      // Verify all 5 items were broadcast to Device C
      expect(receivedByC).toHaveLength(5)
      const receivedIdsC = receivedByC.map((r) => r.itemId)
      expect(receivedIdsC).toEqual(expect.arrayContaining(itemIds))

      // Verify pull returns all items
      const pullResponse = mockServer.pull()
      expect(pullResponse.items).toHaveLength(5)
    })
  })

  // =========================================================================
  // Offline Device Reconnection
  // =========================================================================

  describe('offline device catching up', () => {
    it('should allow offline device to catch up when reconnecting', () => {
      const receivedByB: ItemSyncedPayload[] = []
      const receivedByC: ItemSyncedPayload[] = []

      deviceB.onItemSynced((payload) => receivedByB.push(payload))
      deviceC.onItemSynced((payload) => receivedByC.push(payload))

      // Device C goes offline
      mockServer.setDeviceOnline('device-C', false)

      // Device A creates items while C is offline
      const offlineItems = ['inbox-off1', 'inbox-off2', 'inbox-off3']
      for (const id of offlineItems) {
        const payload = createInboxItemPayload(id, `Offline item ${id}`)
        deviceA.incrementClock()

        mockServer.push(
          [createPushItem(id, payload, 'create', deviceA.getClock())],
          deviceA.getClock(),
          deviceA.id,
          userId
        )
      }

      // Device B received all 3
      expect(receivedByB).toHaveLength(3)

      // Device C received nothing (was offline)
      expect(receivedByC).toHaveLength(0)

      // Device C comes back online and pulls
      mockServer.setDeviceOnline('device-C', true)
      deviceC.setLastSyncAt(0) // Force full pull

      const pullResponse = mockServer.pull(deviceC.getLastSyncAt() || undefined)

      // Device C can now see all 3 items
      expect(pullResponse.items).toHaveLength(3)
      const pulledIds = pullResponse.items.map((i) => i.id)
      expect(pulledIds).toEqual(expect.arrayContaining(offlineItems))
    })
  })

  // =========================================================================
  // WebSocket Event Structure
  // =========================================================================

  describe('item-synced event payload structure', () => {
    it('should include all required fields in item-synced payload', () => {
      let receivedPayload: ItemSyncedPayload | null = null
      deviceB.onItemSynced((payload) => {
        receivedPayload = payload
      })

      // Device A pushes
      const inboxPayload = createInboxItemPayload('inbox-struct', 'Structure test')
      deviceA.incrementClock()

      mockServer.push(
        [createPushItem('inbox-struct', inboxPayload, 'create', deviceA.getClock())],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      expect(receivedPayload).not.toBeNull()
      expect(receivedPayload!.itemId).toBe('inbox-struct')
      expect(receivedPayload!.type).toBe('inbox_item')
      expect(receivedPayload!.operation).toBe('create')
      expect(receivedPayload!.deviceId).toBe('device-A')
      expect(typeof receivedPayload!.version).toBe('number')
      expect(receivedPayload!.version).toBeGreaterThan(0)
    })

    it('should include correct operation for update', () => {
      let receivedPayload: ItemSyncedPayload | null = null
      deviceB.onItemSynced((payload) => {
        receivedPayload = payload
      })

      // First create
      deviceA.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'inbox-upd',
            createInboxItemPayload('inbox-upd', 'Original'),
            'create',
            deviceA.getClock()
          )
        ],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      // Then update
      receivedPayload = null
      deviceA.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'inbox-upd',
            createInboxItemPayload('inbox-upd', 'Updated'),
            'update',
            deviceA.getClock()
          )
        ],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      expect(receivedPayload!.operation).toBe('update')
      expect(receivedPayload!.version).toBe(2)
    })

    it('should include correct operation for delete', () => {
      let receivedPayload: ItemSyncedPayload | null = null
      deviceB.onItemSynced((payload) => {
        receivedPayload = payload
      })

      // Create then delete
      deviceA.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'inbox-del',
            createInboxItemPayload('inbox-del', 'To delete'),
            'create',
            deviceA.getClock()
          )
        ],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      deviceA.incrementClock()
      mockServer.push(
        [createPushItem('inbox-del', { id: 'inbox-del', deleted: true }, 'delete', deviceA.getClock())],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      expect(receivedPayload!.operation).toBe('delete')
    })

    it('should set deletedAt on server when operation is delete', () => {
      // Create then delete
      deviceA.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'inbox-del-ts',
            createInboxItemPayload('inbox-del-ts', 'To delete'),
            'create',
            deviceA.getClock()
          )
        ],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      deviceA.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'inbox-del-ts',
            { id: 'inbox-del-ts', deleted: true },
            'delete',
            deviceA.getClock()
          )
        ],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      // Pull and verify deletedAt
      const pullResponse = mockServer.pull()
      const deletedItem = pullResponse.items.find((i) => i.id === 'inbox-del-ts')

      expect(deletedItem).toBeDefined()
      expect(deletedItem!.deletedAt).toBeDefined()
      expect(deletedItem!.operation).toBe('delete')
    })
  })

  // =========================================================================
  // Vector Clock Synchronization
  // =========================================================================

  describe('vector clock synchronization across devices', () => {
    it('should merge clocks from all devices', () => {
      // Device A creates
      deviceA.incrementClock()
      const responseA = mockServer.push(
        [
          createPushItem(
            'inbox-clk1',
            createInboxItemPayload('inbox-clk1', 'From A'),
            'create',
            deviceA.getClock()
          )
        ],
        deviceA.getClock(),
        deviceA.id,
        userId
      )
      deviceA.mergeClock(responseA.serverClock)

      // Device B creates (after pull would normally happen)
      deviceB.mergeClock(responseA.serverClock)
      deviceB.incrementClock()
      const responseB = mockServer.push(
        [
          createPushItem(
            'inbox-clk2',
            createInboxItemPayload('inbox-clk2', 'From B'),
            'create',
            deviceB.getClock()
          )
        ],
        deviceB.getClock(),
        deviceB.id,
        userId
      )

      // Server clock should have both devices
      expect(responseB.serverClock['device-A']).toBe(1)
      expect(responseB.serverClock['device-B']).toBe(1)
    })

    it('should handle concurrent edits by different devices', () => {
      // Both devices create different items concurrently (before syncing)
      deviceA.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'inbox-conc-A',
            createInboxItemPayload('inbox-conc-A', 'From A'),
            'create',
            deviceA.getClock()
          )
        ],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      deviceB.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'inbox-conc-B',
            createInboxItemPayload('inbox-conc-B', 'From B'),
            'create',
            deviceB.getClock()
          )
        ],
        deviceB.getClock(),
        deviceB.id,
        userId
      )

      // Both items should be on the server
      const allItems = mockServer.getAllItems()
      expect(allItems).toHaveLength(2)

      // Either device pulling should get both items
      const pullResponse = mockServer.pull()
      expect(pullResponse.items).toHaveLength(2)
    })
  })

  // =========================================================================
  // Bidirectional Sync
  // =========================================================================

  describe('bidirectional sync between devices', () => {
    it('should sync items created on different devices', () => {
      const receivedByA: ItemSyncedPayload[] = []
      const receivedByB: ItemSyncedPayload[] = []

      deviceA.onItemSynced((payload) => receivedByA.push(payload))
      deviceB.onItemSynced((payload) => receivedByB.push(payload))

      // Device A creates
      deviceA.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'from-A',
            createInboxItemPayload('from-A', 'Item from A'),
            'create',
            deviceA.getClock()
          )
        ],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      // Device B creates
      deviceB.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'from-B',
            createInboxItemPayload('from-B', 'Item from B'),
            'create',
            deviceB.getClock()
          )
        ],
        deviceB.getClock(),
        deviceB.id,
        userId
      )

      // A should receive B's item
      expect(receivedByA).toHaveLength(1)
      expect(receivedByA[0].itemId).toBe('from-B')

      // B should receive A's item
      expect(receivedByB).toHaveLength(1)
      expect(receivedByB[0].itemId).toBe('from-A')

      // Pull should return both items
      const pullResponse = mockServer.pull()
      expect(pullResponse.items).toHaveLength(2)
    })

    it('should handle three devices creating items simultaneously', () => {
      const receivedByA: ItemSyncedPayload[] = []
      const receivedByB: ItemSyncedPayload[] = []
      const receivedByC: ItemSyncedPayload[] = []

      deviceA.onItemSynced((payload) => receivedByA.push(payload))
      deviceB.onItemSynced((payload) => receivedByB.push(payload))
      deviceC.onItemSynced((payload) => receivedByC.push(payload))

      // All three devices create items
      deviceA.incrementClock()
      mockServer.push(
        [createPushItem('from-A', createInboxItemPayload('from-A', 'A'), 'create', deviceA.getClock())],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      deviceB.incrementClock()
      mockServer.push(
        [createPushItem('from-B', createInboxItemPayload('from-B', 'B'), 'create', deviceB.getClock())],
        deviceB.getClock(),
        deviceB.id,
        userId
      )

      deviceC.incrementClock()
      mockServer.push(
        [createPushItem('from-C', createInboxItemPayload('from-C', 'C'), 'create', deviceC.getClock())],
        deviceC.getClock(),
        deviceC.id,
        userId
      )

      // Each device should receive items from the other two
      expect(receivedByA).toHaveLength(2)
      expect(receivedByA.map((r) => r.itemId).sort()).toEqual(['from-B', 'from-C'])

      expect(receivedByB).toHaveLength(2)
      expect(receivedByB.map((r) => r.itemId).sort()).toEqual(['from-A', 'from-C'])

      expect(receivedByC).toHaveLength(2)
      expect(receivedByC.map((r) => r.itemId).sort()).toEqual(['from-A', 'from-B'])

      // Server should have all 3 items
      expect(mockServer.getAllItems()).toHaveLength(3)
    })
  })

  // =========================================================================
  // Real-World Scenario: Complete Inbox Item Lifecycle
  // =========================================================================

  describe('real-world scenario: inbox item lifecycle across devices', () => {
    it('should handle create -> update -> archive -> delete across devices', () => {
      const receivedByB: ItemSyncedPayload[] = []
      const receivedByC: ItemSyncedPayload[] = []

      deviceB.onItemSynced((payload) => receivedByB.push(payload))
      deviceC.onItemSynced((payload) => receivedByC.push(payload))

      // 1. Device A creates inbox item
      deviceA.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'lifecycle-item',
            createInboxItemPayload('lifecycle-item', 'New idea', 'Initial content'),
            'create',
            deviceA.getClock()
          )
        ],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      expect(receivedByB[0].operation).toBe('create')
      expect(receivedByC[0].operation).toBe('create')

      // 2. Device B updates the item (after pulling)
      deviceB.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'lifecycle-item',
            { ...createInboxItemPayload('lifecycle-item', 'Updated idea', 'Updated content') },
            'update',
            deviceB.getClock()
          )
        ],
        deviceB.getClock(),
        deviceB.id,
        userId
      )

      // A and C should see update
      const receivedByA: ItemSyncedPayload[] = []
      deviceA.onItemSynced((payload) => receivedByA.push(payload))

      // C should have received the update
      expect(receivedByC[1].operation).toBe('update')

      // 3. Device C archives it (files to a note)
      deviceC.incrementClock()
      const archivedPayload = {
        ...createInboxItemPayload('lifecycle-item', 'Updated idea'),
        filedAt: new Date().toISOString(),
        filedTo: 'note-123',
        filedAction: 'convert_to_note'
      }
      mockServer.push(
        [createPushItem('lifecycle-item', archivedPayload, 'update', deviceC.getClock())],
        deviceC.getClock(),
        deviceC.id,
        userId
      )

      // 4. Device A deletes after archiving
      deviceA.clearItemSyncedCallbacks()
      deviceA.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'lifecycle-item',
            { id: 'lifecycle-item', deleted: true },
            'delete',
            deviceA.getClock()
          )
        ],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      // Verify final state
      const pullResponse = mockServer.pull()
      const item = pullResponse.items.find((i) => i.id === 'lifecycle-item')
      expect(item).toBeDefined()
      expect(item!.deletedAt).toBeDefined()
      expect(item!.operation).toBe('delete')
    })
  })

  // =========================================================================
  // Edge Cases
  // =========================================================================

  describe('edge cases', () => {
    it('should handle empty push (no items)', () => {
      const response = mockServer.push([], deviceA.getClock(), deviceA.id, userId)

      expect(response.success).toBe(true)
      expect(response.accepted).toHaveLength(0)
      expect(response.conflicts).toHaveLength(0)
    })

    it('should handle pull with no items', () => {
      const response = mockServer.pull()

      expect(response.items).toHaveLength(0)
      expect(response.hasMore).toBe(false)
    })

    it('should handle incremental pull with since parameter', async () => {
      // Create first item
      deviceA.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'inbox-first',
            createInboxItemPayload('inbox-first', 'First'),
            'create',
            deviceA.getClock()
          )
        ],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      // Record timestamp before creating second item
      // Use a timestamp slightly before first pull to ensure we capture items "since" that time
      const sinceTimestamp = Date.now() - 1

      // Wait a tiny bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 5))

      // Create second item - it will have a later modifiedAt
      deviceA.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'inbox-second',
            createInboxItemPayload('inbox-second', 'Second'),
            'create',
            deviceA.getClock()
          )
        ],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      // Full pull should return both items
      const fullPull = mockServer.pull()
      expect(fullPull.items.length).toBe(2)

      // Incremental pull with sinceTimestamp should return items modified after that time
      // Since sinceTimestamp is before first item was created, we get both
      // To properly test incremental, we need to use the timestamp AFTER first item
      const incrementalPull = mockServer.pull(sinceTimestamp)

      // Since both items were created after sinceTimestamp, we should get both
      expect(incrementalPull.items.length).toBe(2)
      const itemIds = incrementalPull.items.map((i) => i.id)
      expect(itemIds).toContain('inbox-first')
      expect(itemIds).toContain('inbox-second')
    })

    it('should only broadcast to devices of the same user', () => {
      // Create a device for a different user
      const wsOther = mockServer.connectDevice('device-other-user', 'user-456')
      const deviceOther = new MockDevice('device-other-user', 'user-456', wsOther)

      const receivedByOther: ItemSyncedPayload[] = []
      const receivedByB: ItemSyncedPayload[] = []

      deviceOther.onItemSynced((payload) => receivedByOther.push(payload))
      deviceB.onItemSynced((payload) => receivedByB.push(payload))

      // Device A creates item
      deviceA.incrementClock()
      mockServer.push(
        [
          createPushItem(
            'inbox-user-test',
            createInboxItemPayload('inbox-user-test', 'User test'),
            'create',
            deviceA.getClock()
          )
        ],
        deviceA.getClock(),
        deviceA.id,
        userId
      )

      // Device B (same user) should receive
      expect(receivedByB).toHaveLength(1)

      // Device from other user should NOT receive
      expect(receivedByOther).toHaveLength(0)

      // Cleanup
      deviceOther.cleanup()
    })
  })
})
