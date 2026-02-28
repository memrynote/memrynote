/* eslint-disable @typescript-eslint/require-await */

import { InboxChannels } from '@shared/ipc-channels'
import {
  FileItemSchema,
  BulkFileSchema,
  BulkTagSchema,
  BulkArchiveSchema,
  type FileResponse,
  type BulkResponse,
  type SuggestionsResponse
} from '@shared/contracts/inbox-api'
import { generateId } from '../lib/id'
import { inboxItems, inboxItemTags } from '@shared/db/schema/inbox'
import { eq, and } from 'drizzle-orm'
import { fileToFolder, convertToNote, linkToNotes, bulkFileToFolder } from '../inbox/filing'
import { getSuggestions, trackSuggestionFeedback } from '../inbox/suggestions'
import { linkToNote } from '../inbox/filing'
import { getStaleItemIds, incrementProcessedCount } from '../inbox/stats'
import { snoozeItem, unsnoozeItem, getSnoozedItems, bulkSnoozeItems } from '../inbox/snooze'
import type { SnoozeInput, SnoozedItem } from '../inbox/snooze'
import { emitInboxEvent, requireDatabase } from './inbox-shared'
import { handleArchive } from './inbox-crud-handlers'

export async function handleFile(input: unknown): Promise<FileResponse> {
  try {
    const parsed = FileItemSchema.parse(input)
    const { itemId, destination, tags } = parsed

    switch (destination.type) {
      case 'folder':
        return fileToFolder(itemId, destination.path || '', tags)
      case 'new-note':
        return convertToNote(itemId)
      case 'note': {
        const noteIds = destination.noteIds?.length
          ? destination.noteIds
          : destination.noteId
            ? [destination.noteId]
            : []

        if (noteIds.length === 0) {
          return {
            success: false,
            filedTo: null,
            error: 'At least one note ID required for linking'
          }
        }

        const result = await linkToNotes(itemId, noteIds, tags, destination.path)
        return {
          success: result.success,
          filedTo: noteIds[0],
          noteId: noteIds[0],
          error: result.error
        }
      }
      default:
        return { success: false, filedTo: null, error: 'Invalid destination type' }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, filedTo: null, error: message }
  }
}

export async function handleGetSuggestions(itemId: string): Promise<SuggestionsResponse> {
  try {
    const suggestions = await getSuggestions(itemId)
    return { suggestions }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Suggestions] Failed to get suggestions:', message)
    return { suggestions: [] }
  }
}

export async function handleTrackSuggestion(
  itemId: string,
  itemType: string,
  suggestedTo: string,
  actualTo: string,
  confidence: number,
  suggestedTags: string[] = [],
  actualTags: string[] = []
): Promise<{ success: boolean; error?: string }> {
  try {
    trackSuggestionFeedback(
      itemId,
      itemType,
      suggestedTo,
      actualTo,
      confidence,
      suggestedTags,
      actualTags
    )
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Suggestions] Failed to track feedback:', message)
    return { success: false, error: message }
  }
}

export async function handleConvertToNote(itemId: string): Promise<FileResponse> {
  return convertToNote(itemId)
}

export async function handleLinkToNote(
  itemId: string,
  noteId: string,
  tags: string[] = []
): Promise<{ success: boolean; error?: string }> {
  return linkToNote(itemId, noteId, tags)
}

export async function handleSnooze(input: unknown): Promise<{ success: boolean; error?: string }> {
  try {
    if (!input || typeof input !== 'object') {
      return { success: false, error: 'Invalid snooze input' }
    }

    const snoozeInput = input as SnoozeInput
    if (!snoozeInput.itemId || !snoozeInput.snoozeUntil) {
      return { success: false, error: 'itemId and snoozeUntil are required' }
    }

    const result = snoozeItem(snoozeInput)
    return { success: result.success, error: result.error }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function handleUnsnooze(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!itemId) {
      return { success: false, error: 'itemId is required' }
    }

    const result = unsnoozeItem(itemId)
    return { success: result.success, error: result.error }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function handleMarkViewed(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!itemId) {
      return { success: false, error: 'itemId is required' }
    }

    const db = requireDatabase()
    const now = new Date().toISOString()

    db.update(inboxItems)
      .set({
        viewedAt: now,
        modifiedAt: now
      })
      .where(eq(inboxItems.id, itemId))
      .run()

    emitInboxEvent(InboxChannels.events.UPDATED, {
      id: itemId,
      changes: { viewedAt: now }
    })

    console.log(`[Inbox] Marked item ${itemId} as viewed`)
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Inbox] Failed to mark item ${itemId} as viewed:`, message)
    return { success: false, error: message }
  }
}

export async function handleGetSnoozed(): Promise<SnoozedItem[]> {
  try {
    return getSnoozedItems()
  } catch (error) {
    console.error('[Snooze] Error getting snoozed items:', error)
    return []
  }
}

export async function handleBulkSnooze(input: unknown): Promise<{
  success: boolean
  processedCount: number
  errors: Array<{ itemId: string; error: string }>
}> {
  try {
    if (!input || typeof input !== 'object') {
      return { success: false, processedCount: 0, errors: [{ itemId: '', error: 'Invalid input' }] }
    }

    const { itemIds, snoozeUntil, reason } = input as {
      itemIds: string[]
      snoozeUntil: string
      reason?: string
    }

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return {
        success: false,
        processedCount: 0,
        errors: [{ itemId: '', error: 'itemIds array is required' }]
      }
    }

    if (!snoozeUntil) {
      return {
        success: false,
        processedCount: 0,
        errors: [{ itemId: '', error: 'snoozeUntil is required' }]
      }
    }

    return bulkSnoozeItems(itemIds, snoozeUntil, reason)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, processedCount: 0, errors: [{ itemId: '', error: message }] }
  }
}

export async function handleBulkFile(input: unknown): Promise<BulkResponse> {
  try {
    const parsed = BulkFileSchema.parse(input)
    const { itemIds, destination, tags } = parsed

    if (destination.type !== 'folder') {
      return {
        success: false,
        processedCount: 0,
        errors: [{ itemId: '', error: 'Bulk filing only supports folder destination' }]
      }
    }

    return bulkFileToFolder(itemIds, destination.path || '', tags)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      processedCount: 0,
      errors: [{ itemId: '', error: message }]
    }
  }
}

export async function handleBulkArchive(input: unknown): Promise<BulkResponse> {
  const parsed = BulkArchiveSchema.parse(input)
  const errors: Array<{ itemId: string; error: string }> = []
  let processedCount = 0

  for (const itemId of parsed.itemIds) {
    const result = await handleArchive(itemId)
    if (result.success) {
      processedCount++
    } else {
      errors.push({ itemId, error: result.error || 'Unknown error' })
    }
  }

  return {
    success: errors.length === 0,
    processedCount,
    errors
  }
}

export async function handleBulkTag(input: unknown): Promise<BulkResponse> {
  try {
    const parsed = BulkTagSchema.parse(input)
    const { itemIds, tags } = parsed
    const db = requireDatabase()

    let processedCount = 0
    const errors: Array<{ itemId: string; error: string }> = []

    for (const itemId of itemIds) {
      try {
        const item = db.select().from(inboxItems).where(eq(inboxItems.id, itemId)).get()
        if (!item) {
          errors.push({ itemId, error: 'Item not found' })
          continue
        }

        for (const tag of tags) {
          const normalizedTag = tag.trim().toLowerCase()
          if (!normalizedTag) continue

          const existing = db
            .select()
            .from(inboxItemTags)
            .where(and(eq(inboxItemTags.itemId, itemId), eq(inboxItemTags.tag, normalizedTag)))
            .get()

          if (!existing) {
            db.insert(inboxItemTags)
              .values({
                id: generateId(),
                itemId,
                tag: normalizedTag
              })
              .run()
          }
        }
        processedCount++
      } catch (error) {
        errors.push({
          itemId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    for (const itemId of itemIds) {
      emitInboxEvent(InboxChannels.events.UPDATED, { id: itemId, changes: { tags } })
    }

    return {
      success: errors.length === 0,
      processedCount,
      errors
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      processedCount: 0,
      errors: [{ itemId: '', error: message }]
    }
  }
}

export async function handleFileAllStale(): Promise<BulkResponse> {
  try {
    const staleIds = getStaleItemIds()

    if (staleIds.length === 0) {
      return {
        success: true,
        processedCount: 0,
        errors: []
      }
    }

    const result = await bulkFileToFolder(staleIds, 'Unsorted', [])

    if (result.processedCount > 0) {
      incrementProcessedCount(result.processedCount)
    }

    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      processedCount: 0,
      errors: [{ itemId: '', error: message }]
    }
  }
}
