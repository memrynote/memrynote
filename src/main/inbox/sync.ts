/**
 * Inbox Sync Helpers
 *
 * Queues inbox items for sync with the sync engine.
 *
 * @module inbox/sync
 */

import { eq } from 'drizzle-orm'
import { inboxItems } from '@shared/db/schema/inbox'
import type { DrizzleDb } from '../database'
import { getSyncQueue } from '../sync/queue'
import { retrieveDeviceKeyPair } from '../crypto/keychain'
import { emptyClock, incrementClock, type VectorClock } from '../sync/vector-clock'

export type InboxSyncOperation = 'create' | 'update' | 'delete'

/**
 * Queue a fully-hydrated inbox item for sync.
 * Silently skips if sync is not set up (no device keypair).
 */
export async function queueInboxItemForSync(
  item: typeof inboxItems.$inferSelect,
  operation: InboxSyncOperation,
  db?: DrizzleDb
): Promise<void> {
  try {
    const keyPair = await retrieveDeviceKeyPair()
    if (!keyPair?.deviceId) return

    let currentClock: VectorClock | null = null
    if (item.clock) {
      if (typeof item.clock === 'string') {
        try {
          currentClock = JSON.parse(item.clock) as VectorClock
        } catch {
          currentClock = null
        }
      } else {
        currentClock = item.clock as VectorClock
      }
    }

    const nextClock = incrementClock(currentClock ?? emptyClock(), keyPair.deviceId)
    if (db) {
      db.update(inboxItems).set({ clock: nextClock }).where(eq(inboxItems.id, item.id)).run()
    }

    const payload = { ...item, clock: nextClock }

    const queue = getSyncQueue()
    await queue.add('inbox', item.id, operation, JSON.stringify(payload), 0)
  } catch (error) {
    console.warn('[InboxSync] Failed to queue inbox item for sync:', error)
  }
}

/**
 * Fetch an inbox item by ID and queue it for sync.
 */
export async function queueInboxItemById(
  db: DrizzleDb,
  itemId: string,
  operation: InboxSyncOperation
): Promise<void> {
  try {
    const item = db.select().from(inboxItems).where(eq(inboxItems.id, itemId)).get()
    if (!item) return

    await queueInboxItemForSync(item, operation, db)
  } catch (error) {
    console.warn('[InboxSync] Failed to queue inbox item by id:', error)
  }
}
