/**
 * Network Status Monitoring
 *
 * Detects online/offline status and monitors connectivity changes.
 *
 * @module sync/network
 */

import { net } from 'electron'
import { BrowserWindow } from 'electron'
import { EventEmitter } from 'events'

export interface NetworkEvents {
  'sync:online': []
  'sync:offline': []
  'sync:connectivity-changed': [online: boolean]
}

export class NetworkMonitor extends EventEmitter {
  private _isOnline: boolean = true
  private checkInterval: ReturnType<typeof setInterval> | null = null
  private readonly CHECK_INTERVAL_MS = 30000

  constructor() {
    super()
    this._isOnline = net.isOnline()
  }

  start(): void {
    this.checkInterval = setInterval(() => {
      this.checkConnectivity()
    }, this.CHECK_INTERVAL_MS)

    this.checkConnectivity()
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
