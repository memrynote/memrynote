/**
 * Network Status Monitoring
 *
 * Detects online/offline status and monitors connectivity changes.
 *
 * @module sync/network
 */

import { net, BrowserWindow } from 'electron'
import { TypedEmitter } from './typed-emitter'

export interface NetworkEvents extends Record<string, unknown[]> {
  'sync:online': []
  'sync:offline': []
  'sync:connectivity-changed': [online: boolean]
}

const CHECK_INTERVAL_MS = 30000

export class NetworkMonitor extends TypedEmitter<NetworkEvents> {
  private _isOnline: boolean = true
  private checkInterval: ReturnType<typeof setInterval> | null = null
  private started = false

  /**
   * Start monitoring network connectivity.
   * Performs an immediate check and schedules periodic checks.
   */
  start(): void {
    if (this.started) return
    this.started = true

    this.checkConnectivity()

    this.checkInterval = setInterval(() => {
      this.checkConnectivity()
    }, CHECK_INTERVAL_MS)
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  isOnline(): boolean {
    return this._isOnline
  }

  private checkConnectivity(): void {
    const wasOnline = this._isOnline
    this._isOnline = net.isOnline()

    if (wasOnline !== this._isOnline) {
      this.emit('sync:connectivity-changed', this._isOnline)
      this.broadcastToWindows('sync:connectivity-changed', this._isOnline)

      if (this._isOnline) {
        this.emit('sync:online')
        this.broadcastToWindows('sync:online', undefined)
      } else {
        this.emit('sync:offline')
        this.broadcastToWindows('sync:offline', undefined)
      }
    }
  }

  forceCheck(): boolean {
    this.checkConnectivity()
    return this._isOnline
  }

  private broadcastToWindows(channel: string, data: unknown): void {
    for (const window of BrowserWindow.getAllWindows()) {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, data)
      }
    }
  }
}

let networkMonitorInstance: NetworkMonitor | null = null

export function getNetworkMonitor(): NetworkMonitor {
  if (!networkMonitorInstance) {
    networkMonitorInstance = new NetworkMonitor()
  }
  return networkMonitorInstance
}

export function isNetworkOnline(): boolean {
  return getNetworkMonitor().isOnline()
}
