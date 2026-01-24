/**
 * Saved Filters IPC handlers.
 * Handles all saved filter-related IPC communication from renderer.
 *
 * @module ipc/saved-filters-handlers
 */

import { ipcMain, BrowserWindow } from 'electron'
import { SavedFiltersChannels } from '@shared/ipc-channels'
import {
  SavedFilterCreateSchema,
  SavedFilterUpdateSchema,
  SavedFilterDeleteSchema,
  SavedFilterReorderSchema,
  type SavedFilter
} from '@shared/contracts/saved-filters-api'
import { createValidatedHandler, createHandler } from './validate'
import { getDatabase } from '../database'
import { generateId } from '../lib/id'
import * as settingsQueries from '@shared/db/queries/settings'
import { getSyncQueue } from '../sync/queue'
import { retrieveDeviceKeyPair } from '../crypto/keychain'
import type { SavedFilter as SavedFilterDB } from '@shared/db/schema/settings'

/**
 * Emit saved filter event to all windows
 */
function emitSavedFilterEvent(channel: string, data: unknown): void {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(channel, data)
  })
}

/**
 * Helper to get database, throwing a user-friendly error if not available.
 */
function requireDatabase(): ReturnType<typeof getDatabase> {
  try {
    return getDatabase()
  } catch {
    throw new Error('No vault is open. Please open a vault first.')
  }
}

async function getCurrentDeviceId(): Promise<string | null> {
  try {
    const keyPair = await retrieveDeviceKeyPair()
    return keyPair?.deviceId ?? null
  } catch {
    return null
  }
}

async function queueFilterForSync(
  filter: SavedFilterDB,
  operation: 'create' | 'update' | 'delete'
): Promise<void> {
  try {
    const deviceId = await getCurrentDeviceId()
    if (!deviceId) return

    const queue = getSyncQueue()
    await queue.add('filter', filter.id, operation, JSON.stringify(filter), 0)
  } catch (error) {
    console.warn('[SavedFiltersHandlers] Failed to queue filter for sync:', error)
  }
}

/**
 * Convert DB saved filter to API format
 */
function toApiFilter(
  dbFilter: ReturnType<typeof settingsQueries.getSavedFilterById>
): SavedFilter | null {
  if (!dbFilter) return null
  return {
    id: dbFilter.id,
    name: dbFilter.name,
    config: dbFilter.config as SavedFilter['config'],
    position: dbFilter.position,
    createdAt: dbFilter.createdAt
  }
}

/**
 * Register all saved filter-related IPC handlers.
 * Call this once during app initialization.
 */
export function registerSavedFiltersHandlers(): void {
  // ============================================================================
  // Saved Filter CRUD
  // ============================================================================

  // saved-filters:list - List all saved filters
  ipcMain.handle(
    SavedFiltersChannels.invoke.LIST,
    createHandler(() => {
      const db = requireDatabase()
      const filters = settingsQueries.listSavedFilters(db)
      return {
        savedFilters: filters.map((f) => toApiFilter(f)!)
      }
    })
  )

  // saved-filters:create - Create a new saved filter
  ipcMain.handle(
    SavedFiltersChannels.invoke.CREATE,
    createValidatedHandler(SavedFilterCreateSchema, async (input) => {
      const db = requireDatabase()
      const id = generateId()
      const position = settingsQueries.getNextSavedFilterPosition(db)

      const filter = settingsQueries.insertSavedFilter(db, {
        id,
        name: input.name,
        config: input.config,
        position
      })

      const apiFilter = toApiFilter(filter)!
      emitSavedFilterEvent(SavedFiltersChannels.events.CREATED, { savedFilter: apiFilter })

      if (filter) {
        await queueFilterForSync(filter, 'create')
      }

      return { success: true, savedFilter: apiFilter }
    })
  )

  // saved-filters:update - Update a saved filter
  ipcMain.handle(
    SavedFiltersChannels.invoke.UPDATE,
    createValidatedHandler(SavedFilterUpdateSchema, async (input) => {
      const db = requireDatabase()

      // Check if filter exists
      if (!settingsQueries.savedFilterExists(db, input.id)) {
        return { success: false, savedFilter: null, error: 'Saved filter not found' }
      }

      const updates: { name?: string; config?: unknown; position?: number } = {}
      if (input.name !== undefined) updates.name = input.name
      if (input.config !== undefined) updates.config = input.config
      if (input.position !== undefined) updates.position = input.position

      const filter = settingsQueries.updateSavedFilter(db, input.id, updates)
      const apiFilter = toApiFilter(filter)

      emitSavedFilterEvent(SavedFiltersChannels.events.UPDATED, {
        id: input.id,
        savedFilter: apiFilter
      })

      if (filter) {
        await queueFilterForSync(filter, 'update')
      }

      return { success: true, savedFilter: apiFilter }
    })
  )

  // saved-filters:delete - Delete a saved filter
  ipcMain.handle(
    SavedFiltersChannels.invoke.DELETE,
    createValidatedHandler(SavedFilterDeleteSchema, async (input) => {
      const db = requireDatabase()

      // Fetch filter before deletion for sync
      const filter = settingsQueries.getSavedFilterById(db, input.id)
      if (!filter) {
        return { success: false, error: 'Saved filter not found' }
      }

      await queueFilterForSync(filter, 'delete')

      settingsQueries.deleteSavedFilter(db, input.id)
      emitSavedFilterEvent(SavedFiltersChannels.events.DELETED, { id: input.id })

      return { success: true }
    })
  )

  // saved-filters:reorder - Reorder saved filters
  ipcMain.handle(
    SavedFiltersChannels.invoke.REORDER,
    createValidatedHandler(SavedFilterReorderSchema, (input) => {
      const db = requireDatabase()
      settingsQueries.reorderSavedFilters(db, input.ids, input.positions)
      return { success: true }
    })
  )
}

/**
 * Unregister all saved filter-related IPC handlers.
 */
export function unregisterSavedFiltersHandlers(): void {
  ipcMain.removeHandler(SavedFiltersChannels.invoke.LIST)
  ipcMain.removeHandler(SavedFiltersChannels.invoke.CREATE)
  ipcMain.removeHandler(SavedFiltersChannels.invoke.UPDATE)
  ipcMain.removeHandler(SavedFiltersChannels.invoke.DELETE)
  ipcMain.removeHandler(SavedFiltersChannels.invoke.REORDER)
}
