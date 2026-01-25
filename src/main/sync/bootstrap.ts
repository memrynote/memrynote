/**
 * Sync Bootstrap
 *
 * Queues existing local data for initial sync on first device.
 *
 * @module sync/bootstrap
 */

import { eq } from 'drizzle-orm'
import { getDatabase } from '../database'
import { tasks } from '@shared/db/schema/tasks'
import { inboxItems } from '@shared/db/schema/inbox'
import { getSyncQueue } from './queue'
import { getSetting, setSetting } from '@shared/db/queries/settings'
import { retrieveDeviceKeyPair } from '../crypto/keychain'
import { emptyClock, incrementClock, type VectorClock } from './vector-clock'

const BOOTSTRAP_KEY = 'sync.bootstrap.v1'

function parseClock(value: unknown): VectorClock | null {
  if (!value) return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as VectorClock
    } catch {
      return null
    }
  }
  if (typeof value === 'object') {
    return value as VectorClock
  }
  return null
}

export async function bootstrapSyncData(): Promise<{ tasks: number; inbox: number }> {
  console.info('[SyncBootstrap] Starting bootstrap')
  let db: ReturnType<typeof getDatabase>
  try {
    db = getDatabase()
  } catch {
    console.info('[SyncBootstrap] Skipped: no open vault')
    return { tasks: 0, inbox: 0 }
  }

  const alreadyBootstrapped = getSetting(db, BOOTSTRAP_KEY)
  if (alreadyBootstrapped) {
    console.info('[SyncBootstrap] Skipped: already bootstrapped')
    return { tasks: 0, inbox: 0 }
  }

  const keyPair = await retrieveDeviceKeyPair().catch(() => null)
  if (!keyPair?.deviceId) {
    console.info('[SyncBootstrap] Skipped: no device keypair')
    return { tasks: 0, inbox: 0 }
  }

  const deviceId = keyPair.deviceId
  const queue = getSyncQueue()

  let tasksQueued = 0
  const taskRows = db.select().from(tasks).all()
  for (const task of taskRows) {
    let clock = parseClock(task.clock)
    if (!clock) {
      clock = incrementClock(emptyClock(), deviceId)
      db.update(tasks)
        .set({ clock: JSON.stringify(clock) })
        .where(eq(tasks.id, task.id))
        .run()
    }

    const payload = { ...task, clock }
    await queue.add('task', task.id, 'create', JSON.stringify(payload), 0)
    tasksQueued++
  }

  let inboxQueued = 0
  const inboxRows = db.select().from(inboxItems).all()
  for (const item of inboxRows) {
    let clock = parseClock(item.clock)
    if (!clock) {
      clock = incrementClock(emptyClock(), deviceId)
      db.update(inboxItems).set({ clock }).where(eq(inboxItems.id, item.id)).run()
    }

    const payload = { ...item, clock }
    await queue.add('inbox', item.id, 'create', JSON.stringify(payload), 0)
    inboxQueued++
  }

  setSetting(db, BOOTSTRAP_KEY, new Date().toISOString())

  console.info('[SyncBootstrap] Queued existing data', {
    tasks: tasksQueued,
    inbox: inboxQueued
  })

  return { tasks: tasksQueued, inbox: inboxQueued }
}
