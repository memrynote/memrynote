/**
 * Local Configuration Storage
 * T050d: Persist device_id in local SQLite
 *
 * Uses the syncState key-value table for storing local configuration
 * such as device_id, user_id, and refresh_token.
 *
 * @module db/local-config
 */

import { getDatabase } from '../database'
import { syncState } from '@shared/db/schema/sync-schema'
import { eq } from 'drizzle-orm'

/**
 * Get a local configuration value.
 *
 * @param key - Configuration key
 * @returns Value or null if not found
 */
export async function getLocalConfig(key: string): Promise<string | null> {
  try {
    const db = getDatabase()
    const result = await db
      .select({ value: syncState.value })
      .from(syncState)
      .where(eq(syncState.key, key))
      .limit(1)

    return result[0]?.value ?? null
  } catch (error) {
    console.error(`[LocalConfig] Error getting ${key}:`, error)
    return null
  }
}

/**
 * Set a local configuration value.
 *
 * @param key - Configuration key
 * @param value - Value to store (null to delete)
 */
export async function setLocalConfig(key: string, value: string | null): Promise<void> {
  try {
    const db = getDatabase()
    const now = new Date().toISOString()

    if (value === null) {
      await db.delete(syncState).where(eq(syncState.key, key))
    } else {
      await db
        .insert(syncState)
        .values({
          key,
          value,
          updatedAt: now
        })
        .onConflictDoUpdate({
          target: syncState.key,
          set: {
            value,
            updatedAt: now
          }
        })
    }
  } catch (error) {
    console.error(`[LocalConfig] Error setting ${key}:`, error)
    throw error
  }
}

/**
 * Delete a local configuration value.
 *
 * @param key - Configuration key
 */
export async function deleteLocalConfig(key: string): Promise<void> {
  await setLocalConfig(key, null)
}

/**
 * Get multiple local configuration values.
 *
 * @param keys - Configuration keys
 * @returns Map of key to value
 */
export async function getLocalConfigs(keys: string[]): Promise<Map<string, string>> {
  try {
    const db = getDatabase()
    const results = new Map<string, string>()

    for (const key of keys) {
      const result = await db
        .select({ value: syncState.value })
        .from(syncState)
        .where(eq(syncState.key, key))
        .limit(1)

      if (result[0]?.value) {
        results.set(key, result[0].value)
      }
    }

    return results
  } catch (error) {
    console.error('[LocalConfig] Error getting multiple configs:', error)
    return new Map()
  }
}

/**
 * Well-known configuration keys.
 */
export const CONFIG_KEYS = {
  DEVICE_ID: 'device_id',
  USER_ID: 'user_id',
  REFRESH_TOKEN: 'refresh_token',
  SERVER_CURSOR: 'server_cursor',
  LAST_SYNC_AT: 'last_sync_at',
  SYNC_STATUS: 'sync_status'
} as const
