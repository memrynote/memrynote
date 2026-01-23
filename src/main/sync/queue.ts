/**
 * Sync Queue Manager
 *
 * Manages an in-memory queue of pending sync items with SQLite persistence.
 *
 * @module sync/queue
 */

import { v4 as uuidv4 } from 'uuid'
import { EventEmitter } from 'events'
import { BrowserWindow } from 'electron'
import { eq, asc } from 'drizzle-orm'
import { getDatabase } from '../database/client'
import { syncQueue } from '@shared/db/schema/sync-schema'
import type { NewSyncQueueItem } from '@shared/db/schema/sync-schema'
import type { SyncOperation, SyncItemType } from '@shared/contracts/sync-api'

export interface QueueItem {
  id: string
  type: SyncItemType
  itemId: string
  operation: SyncOperation
  payload: string
  priority: number
  attempts: number
  lastAttempt: string | null
  errorMessage: string | null
  createdAt: string
}

export interface QueueEvents {
  'sync:queue-changed': [count: number]
  'sync:item-added': [item: QueueItem]
  'sync:item-removed': [id: string]
  'sync:item-updated': [item: QueueItem]
}

export class SyncQueue extends EventEmitter {
  private items: Map<string, QueueItem> = new Map()
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    await this.loadFromDatabase()
    this.initialized = true
  }

  private async loadFromDatabase(): Promise<void> {
    const db = getDatabase()
    const rows = await db.select().from(syncQueue).orderBy(asc(syncQueue.createdAt))

    this.items.clear()
    for (const row of rows) {
      const item: QueueItem = {
        id: row.id,
        type: row.type as SyncItemType,
        itemId: row.itemId,
        operation: row.operation as SyncOperation,
        payload: row.payload,
        priority: row.priority ?? 0,
        attempts: row.attempts ?? 0,
        lastAttempt: row.lastAttempt,
        errorMessage: row.errorMessage,
        createdAt: row.createdAt
      }
      this.items.set(row.id, item)
    }
  }

  async add(
    type: SyncItemType,
    itemId: string,
    operation: SyncOperation,
    payload: string,
    priority: number = 0
  ): Promise<QueueItem> {
    const id = uuidv4()
    const createdAt = new Date().toISOString()

    const item: QueueItem = {
      id,
      type,
      itemId,
      operation,
      payload,
      priority,
      attempts: 0,
      lastAttempt: null,
      errorMessage: null,
      createdAt
    }

    const dbItem: NewSyncQueueItem = {
      id,
      type,
      itemId,
      operation,
      payload,
      priority,
      attempts: 0,
      lastAttempt: null,
      errorMessage: null,
      createdAt
    }

    const db = getDatabase()
    await db.insert(syncQueue).values(dbItem)

    this.items.set(id, item)
    this.emitQueueChanged()
    this.emit('sync:item-added', item)
    this.broadcastToWindows('sync:item-added', item)

    return item
  }

  async remove(id: string): Promise<boolean> {
    if (!this.items.has(id)) {
      return false
    }

    const db = getDatabase()
    await db.delete(syncQueue).where(eq(syncQueue.id, id))

    this.items.delete(id)
    this.emitQueueChanged()
    this.emit('sync:item-removed', id)
    this.broadcastToWindows('sync:item-removed', id)

    return true
  }

  async updateAttempt(
    id: string,
    errorMessage: string | null = null
  ): Promise<QueueItem | null> {
    const item = this.items.get(id)
    if (!item) return null

    const now = new Date().toISOString()
    item.attempts += 1
    item.lastAttempt = now
    item.errorMessage = errorMessage

    const db = getDatabase()
    await db
      .update(syncQueue)
      .set({
        attempts: item.attempts,
        lastAttempt: now,
        errorMessage
      })
      .where(eq(syncQueue.id, id))

    this.emit('sync:item-updated', item)
    this.broadcastToWindows('sync:item-updated', item)

    return item
  }

  peek(): QueueItem | null {
    if (this.items.size === 0) return null

    const sorted = this.getSorted()
    return sorted[0] ?? null
  }

  getAll(): QueueItem[] {
    return this.getSorted()
  }

  getByItemId(itemId: string): QueueItem[] {
    return Array.from(this.items.values()).filter((item) => item.itemId === itemId)
  }

  get(id: string): QueueItem | null {
    return this.items.get(id) ?? null
  }

  size(): number {
    return this.items.size
  }

  isEmpty(): boolean {
    return this.items.size === 0
  }

  async clear(): Promise<void> {
    const db = getDatabase()
    await db.delete(syncQueue)

    this.items.clear()
    this.emitQueueChanged()
  }

  private getSorted(): QueueItem[] {
    return Array.from(this.items.values()).sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }

  private emitQueueChanged(): void {
    const count = this.items.size
    this.emit('sync:queue-changed', count)
    this.broadcastToWindows('sync:queue-changed', count)
  }

  private broadcastToWindows(channel: string, data: unknown): void {
    for (const window of BrowserWindow.getAllWindows()) {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, data)
      }
    }
  }
}

let syncQueueInstance: SyncQueue | null = null

export function getSyncQueue(): SyncQueue {
  if (!syncQueueInstance) {
    syncQueueInstance = new SyncQueue()
  }
  return syncQueueInstance
}

export async function initSyncQueue(): Promise<SyncQueue> {
  const queue = getSyncQueue()
  await queue.initialize()
  return queue
}
