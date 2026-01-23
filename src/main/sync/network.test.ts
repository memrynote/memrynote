/**
 * Network Monitor Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NetworkMonitor } from './network'

vi.mock('electron', () => ({
  net: {
    isOnline: vi.fn()
  },
  BrowserWindow: {
    getAllWindows: vi.fn().mockReturnValue([])
  }
}))

import { net } from 'electron'

describe('NetworkMonitor', () => {
  let monitor: NetworkMonitor

  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(net.isOnline).mockReturnValue(true)
    monitor = new NetworkMonitor()
  })

  afterEach(() => {
    monitor.stop()
    vi.useRealTimers()
  })

  describe('isOnline', () => {
    it('should return initial online status', () => {
      // #given
      vi.mocked(net.isOnline).mockReturnValue(true)
      const newMonitor = new NetworkMonitor()

      // #when
      const status = newMonitor.isOnline()

      // #then
      expect(status).toBe(true)
    })

    it('should return offline when network is down', () => {
      // #given
      vi.mocked(net.isOnline).mockReturnValue(false)
      const newMonitor = new NetworkMonitor()

      // #when
      const status = newMonitor.isOnline()

      // #then
      expect(status).toBe(false)
    })
  })

  describe('forceCheck', () => {
    it('should update online status and return current value', () => {
      // #given
      vi.mocked(net.isOnline).mockReturnValue(true)
      const newMonitor = new NetworkMonitor()

      // #when
      vi.mocked(net.isOnline).mockReturnValue(false)
      const status = newMonitor.forceCheck()

      // #then
      expect(status).toBe(false)
      expect(newMonitor.isOnline()).toBe(false)
    })
  })

  describe('connectivity events', () => {
    it('should emit sync:online when going online', () => {
      // #given
      vi.mocked(net.isOnline).mockReturnValue(false)
      const newMonitor = new NetworkMonitor()
      const onOnline = vi.fn()
      newMonitor.on('sync:online', onOnline)

      // #when
      vi.mocked(net.isOnline).mockReturnValue(true)
      newMonitor.forceCheck()

      // #then
      expect(onOnline).toHaveBeenCalled()
    })

    it('should emit sync:offline when going offline', () => {
      // #given
      vi.mocked(net.isOnline).mockReturnValue(true)
      const newMonitor = new NetworkMonitor()
      const onOffline = vi.fn()
      newMonitor.on('sync:offline', onOffline)

      // #when
      vi.mocked(net.isOnline).mockReturnValue(false)
      newMonitor.forceCheck()

      // #then
      expect(onOffline).toHaveBeenCalled()
    })

    it('should emit sync:connectivity-changed on status change', () => {
      // #given
      vi.mocked(net.isOnline).mockReturnValue(true)
      const newMonitor = new NetworkMonitor()
      const onConnectivityChanged = vi.fn()
      newMonitor.on('sync:connectivity-changed', onConnectivityChanged)

      // #when
      vi.mocked(net.isOnline).mockReturnValue(false)
      newMonitor.forceCheck()

      // #then
      expect(onConnectivityChanged).toHaveBeenCalledWith(false)
    })

    it('should not emit events when status unchanged', () => {
      // #given
      vi.mocked(net.isOnline).mockReturnValue(true)
      const newMonitor = new NetworkMonitor()
      const onConnectivityChanged = vi.fn()
      newMonitor.on('sync:connectivity-changed', onConnectivityChanged)

      // #when
      newMonitor.forceCheck()

      // #then
      expect(onConnectivityChanged).not.toHaveBeenCalled()
    })
  })

  describe('start/stop', () => {
    it('should check connectivity periodically when started', () => {
      // #given
      const newMonitor = new NetworkMonitor()

      // #when
      newMonitor.start()
      vi.advanceTimersByTime(30000)

      // #then
      expect(net.isOnline).toHaveBeenCalled()
    })

    it('should stop periodic checks when stopped', () => {
      // #given
      const newMonitor = new NetworkMonitor()
      newMonitor.start()

      // #when
      newMonitor.stop()
      vi.mocked(net.isOnline).mockClear()
      vi.advanceTimersByTime(60000)

      // #then
      expect(net.isOnline).not.toHaveBeenCalled()
    })
  })
})
