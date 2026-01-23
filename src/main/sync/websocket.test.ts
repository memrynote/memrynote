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
    return (globalThis as Record<string, unknown>).__mockWsFactory?.()
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
})
