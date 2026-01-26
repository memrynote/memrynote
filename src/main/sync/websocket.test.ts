/**
 * WebSocket Manager Tests
 *
 * Tests for the WebSocket connection manager.
 * Due to complex mocking requirements with ws and Vitest hoisting,
 * these tests focus on the public API behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WebSocketManager, type WebSocketConfig } from './websocket'

vi.mock('electron', () => ({
  BrowserWindow: {
    getAllWindows: vi.fn().mockReturnValue([])
  }
}))

vi.mock('ws', () => {
  class MockWebSocket {
    static OPEN = 1
    static CLOSED = 3

    readyState = 1
    private handlers: Record<string, Array<(...args: unknown[]) => void>> = {}

    on(event: string, callback: (...args: unknown[]) => void): void {
      if (!this.handlers[event]) {
        this.handlers[event] = []
      }
      this.handlers[event].push(callback)
    }

    once(event: string, callback: (...args: unknown[]) => void): void {
      this.on(event, callback)
    }

    removeListener(event: string): void {
      this.handlers[event] = []
    }

    emit(event: string, ...args: unknown[]): void {
      const handlers = this.handlers[event] || []
      for (const handler of handlers) {
        handler(...args)
      }
    }

    send(): void {}
    close(): void {}
    ping(): void {}
    terminate(): void {}

    triggerOpen(): void {
      this.emit('open')
    }
  }

  // Store the instance globally for test access
  ;(globalThis as Record<string, unknown>).__mockWsFactory = () => {
    const instance = new MockWebSocket()
    ;(globalThis as Record<string, unknown>).__mockWsInstance = instance
    return instance
  }

  const Constructor = function () {
    const factory = (globalThis as Record<string, unknown>).__mockWsFactory as
      | (() => MockWebSocket)
      | undefined
    return factory?.()
  }
  Constructor.OPEN = 1
  Constructor.CLOSED = 3

  return { default: Constructor }
})

function getMockWsInstance(): { triggerOpen: () => void } | undefined {
  return (globalThis as Record<string, unknown>).__mockWsInstance as
    | { triggerOpen: () => void }
    | undefined
}

describe('WebSocketManager', () => {
  let manager: WebSocketManager
  const testConfig: WebSocketConfig = {
    serverUrl: 'http://localhost:8787',
    pingIntervalMs: 1000,
    pongTimeoutMs: 500
  }

  beforeEach(() => {
    vi.useFakeTimers()
    ;(globalThis as Record<string, unknown>).__mockWsInstance = undefined
    manager = new WebSocketManager(testConfig)
  })

  afterEach(() => {
    manager.disconnect()
    vi.useRealTimers()
  })

  describe('connect', () => {
    it('should establish WebSocket connection', async () => {
      // #given / #when
      const connectPromise = manager.connect('test-access-token')
      getMockWsInstance()?.triggerOpen()
      await connectPromise

      // #then
      expect(manager.state).toBe('connected')
    })

    it('should emit sync:ws-connected event', async () => {
      // #given
      const onConnected = vi.fn()
      manager.on('sync:ws-connected', onConnected)

      // #when
      const connectPromise = manager.connect('test-access-token')
      getMockWsInstance()?.triggerOpen()
      await connectPromise

      // #then
      expect(onConnected).toHaveBeenCalled()
    })

    it('should not connect if already connected', async () => {
      // #given
      const connectPromise1 = manager.connect('test-token')
      getMockWsInstance()?.triggerOpen()
      await connectPromise1

      // #when
      await manager.connect('test-token')

      // #then
      expect(manager.state).toBe('connected')
    })
  })

  describe('disconnect', () => {
    it('should set state to disconnected', async () => {
      // #given
      const connectPromise = manager.connect('test-token')
      getMockWsInstance()?.triggerOpen()
      await connectPromise

      // #when
      manager.disconnect()

      // #then
      expect(manager.state).toBe('disconnected')
    })
  })

  describe('send', () => {
    it('should return false when not connected', () => {
      // #given / #when
      const result = manager.send({ type: 'ping', timestamp: Date.now() })

      // #then
      expect(result).toBe(false)
    })
  })

  describe('state', () => {
    it('should be disconnected initially', () => {
      // #given / #when / #then
      expect(manager.state).toBe('disconnected')
    })

    it('should be connected after successful connection', async () => {
      // #given
      const connectPromise = manager.connect('test-token')

      // #when
      getMockWsInstance()?.triggerOpen()
      await connectPromise

      // #then
      expect(manager.state).toBe('connected')
    })
  })

  describe('T120/T121: linking events', () => {
    beforeEach(async () => {
      const connectPromise = manager.connect('test-token')
      getMockWsInstance()?.triggerOpen()
      await connectPromise
    })

    it('should emit sync:linking-scanned on valid scanned event', async () => {
      // #given
      const onScanned = vi.fn()
      manager.on('sync:linking-scanned', onScanned)
      const mockWs = getMockWsInstance() as {
        emit: (event: string, ...args: unknown[]) => void
      }

      // #when
      mockWs.emit(
        'message',
        JSON.stringify({
          type: 'linking',
          timestamp: Date.now(),
          payload: {
            event: 'scanned',
            sessionId: '123e4567-e89b-12d3-a456-426614174000'
          }
        })
      )

      // #then
      expect(onScanned).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000')
    })

    it('should emit sync:linking-approved on valid approved event with all fields', async () => {
      // #given
      const onApproved = vi.fn()
      manager.on('sync:linking-approved', onApproved)
      const mockWs = getMockWsInstance() as {
        emit: (event: string, ...args: unknown[]) => void
      }

      // #when
      mockWs.emit(
        'message',
        JSON.stringify({
          type: 'linking',
          timestamp: Date.now(),
          payload: {
            event: 'approved',
            sessionId: '123e4567-e89b-12d3-a456-426614174000',
            encryptedMasterKey: 'encrypted-key-base64',
            encryptedKeyNonce: 'nonce-base64',
            keyConfirm: 'hmac-proof-base64'
          }
        })
      )

      // #then
      expect(onApproved).toHaveBeenCalledWith({
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        encryptedMasterKey: 'encrypted-key-base64',
        encryptedKeyNonce: 'nonce-base64',
        keyConfirm: 'hmac-proof-base64'
      })
    })

    it('should emit sync:linking-completed on valid completed event with device', async () => {
      // #given
      const onCompleted = vi.fn()
      manager.on('sync:linking-completed', onCompleted)
      const mockWs = getMockWsInstance() as {
        emit: (event: string, ...args: unknown[]) => void
      }

      // #when
      mockWs.emit(
        'message',
        JSON.stringify({
          type: 'linking',
          timestamp: Date.now(),
          payload: {
            event: 'completed',
            sessionId: '123e4567-e89b-12d3-a456-426614174000',
            device: {
              id: 'device-id-123',
              name: 'MacBook Pro',
              platform: 'darwin'
            }
          }
        })
      )

      // #then
      expect(onCompleted).toHaveBeenCalledWith({
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        device: {
          id: 'device-id-123',
          name: 'MacBook Pro',
          platform: 'darwin'
        }
      })
    })

    it('should emit sync:linking-expired on valid expired event', async () => {
      // #given
      const onExpired = vi.fn()
      manager.on('sync:linking-expired', onExpired)
      const mockWs = getMockWsInstance() as {
        emit: (event: string, ...args: unknown[]) => void
      }

      // #when
      mockWs.emit(
        'message',
        JSON.stringify({
          type: 'linking',
          timestamp: Date.now(),
          payload: {
            event: 'expired',
            sessionId: '123e4567-e89b-12d3-a456-426614174000'
          }
        })
      )

      // #then
      expect(onExpired).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000')
    })

    it('should emit sync:ws-error on invalid linking payload', async () => {
      // #given
      const onError = vi.fn()
      manager.on('sync:ws-error', onError)
      const mockWs = getMockWsInstance() as {
        emit: (event: string, ...args: unknown[]) => void
      }

      // #when - missing sessionId
      mockWs.emit(
        'message',
        JSON.stringify({
          type: 'linking',
          timestamp: Date.now(),
          payload: {
            event: 'scanned'
          }
        })
      )

      // #then
      expect(onError).toHaveBeenCalled()
      expect(onError.mock.calls[0][0].message).toContain('Invalid linking payload')
    })

    it('should emit sync:ws-error when approved event missing required fields', async () => {
      // #given
      const onError = vi.fn()
      const onApproved = vi.fn()
      manager.on('sync:ws-error', onError)
      manager.on('sync:linking-approved', onApproved)
      const mockWs = getMockWsInstance() as {
        emit: (event: string, ...args: unknown[]) => void
      }

      // #when - missing encryptedKeyNonce
      mockWs.emit(
        'message',
        JSON.stringify({
          type: 'linking',
          timestamp: Date.now(),
          payload: {
            event: 'approved',
            sessionId: '123e4567-e89b-12d3-a456-426614174000',
            encryptedMasterKey: 'encrypted-key-base64',
            keyConfirm: 'hmac-proof-base64'
          }
        })
      )

      // #then
      expect(onApproved).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Missing required fields in linking_approved payload'
        })
      )
    })

    it('should rate limit rapid duplicate events', async () => {
      // #given
      const onScanned = vi.fn()
      manager.on('sync:linking-scanned', onScanned)
      const mockWs = getMockWsInstance() as {
        emit: (event: string, ...args: unknown[]) => void
      }

      const message = JSON.stringify({
        type: 'linking',
        timestamp: Date.now(),
        payload: {
          event: 'scanned',
          sessionId: '123e4567-e89b-12d3-a456-426614174000'
        }
      })

      // #when - send same message 3 times rapidly
      mockWs.emit('message', message)
      mockWs.emit('message', message)
      mockWs.emit('message', message)

      // #then - only first should be processed
      expect(onScanned).toHaveBeenCalledTimes(1)
    })

    it('should allow same session with different events', async () => {
      // #given
      const onScanned = vi.fn()
      const onApproved = vi.fn()
      manager.on('sync:linking-scanned', onScanned)
      manager.on('sync:linking-approved', onApproved)
      const mockWs = getMockWsInstance() as {
        emit: (event: string, ...args: unknown[]) => void
      }

      // #when - send scanned then approved for same session
      mockWs.emit(
        'message',
        JSON.stringify({
          type: 'linking',
          timestamp: Date.now(),
          payload: {
            event: 'scanned',
            sessionId: '123e4567-e89b-12d3-a456-426614174000'
          }
        })
      )
      mockWs.emit(
        'message',
        JSON.stringify({
          type: 'linking',
          timestamp: Date.now(),
          payload: {
            event: 'approved',
            sessionId: '123e4567-e89b-12d3-a456-426614174000',
            encryptedMasterKey: 'encrypted-key-base64',
            encryptedKeyNonce: 'nonce-base64',
            keyConfirm: 'hmac-proof-base64'
          }
        })
      )

      // #then - both should be processed
      expect(onScanned).toHaveBeenCalledTimes(1)
      expect(onApproved).toHaveBeenCalledTimes(1)
    })

    it('should allow events after rate limit window expires', async () => {
      // #given
      const onScanned = vi.fn()
      manager.on('sync:linking-scanned', onScanned)
      const mockWs = getMockWsInstance() as {
        emit: (event: string, ...args: unknown[]) => void
      }

      const message = JSON.stringify({
        type: 'linking',
        timestamp: Date.now(),
        payload: {
          event: 'scanned',
          sessionId: '123e4567-e89b-12d3-a456-426614174000'
        }
      })

      // #when - send, wait for rate limit to expire, send again
      mockWs.emit('message', message)
      vi.advanceTimersByTime(1100)
      mockWs.emit('message', message)

      // #then - both should be processed
      expect(onScanned).toHaveBeenCalledTimes(2)
    })
  })
})
