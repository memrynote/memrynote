/* eslint-disable @typescript-eslint/require-await */

import { InboxChannels } from '@shared/ipc-channels'
import {
  InboxUpdateSchema,
  type CaptureResponse,
  type InboxItem
} from '@shared/contracts/inbox-api'
import { generateId } from '../lib/id'
import { inboxItems, inboxItemTags } from '@shared/db/schema/inbox'
import { eq, and, desc, sql } from 'drizzle-orm'
import { deleteInboxAttachments } from '../inbox/attachments'
import { incrementArchivedCount } from '../inbox/stats'
import { emitInboxEvent, requireDatabase, getItemTags, toInboxItem } from './inbox-shared'

export async function handleGet(id: string): Promise<InboxItem | null> {
  const db = requireDatabase()
  const row = db.select().from(inboxItems).where(eq(inboxItems.id, id)).get()

  if (!row) return null

  const tags = getItemTags(db, id)
  return toInboxItem(row, tags)
}

export async function handleUpdate(input: unknown): Promise<CaptureResponse> {
  try {
    const parsed = InboxUpdateSchema.parse(input)
    const db = requireDatabase()

    const existing = db.select().from(inboxItems).where(eq(inboxItems.id, parsed.id)).get()
    if (!existing) {
      return { success: false, item: null, error: 'Item not found' }
    }

    const updates: Partial<typeof inboxItems.$inferInsert> = {
      modifiedAt: new Date().toISOString()
    }

    if (parsed.title !== undefined) updates.title = parsed.title
    if (parsed.content !== undefined) updates.content = parsed.content

    db.update(inboxItems).set(updates).where(eq(inboxItems.id, parsed.id)).run()

    const updated = db.select().from(inboxItems).where(eq(inboxItems.id, parsed.id)).get()
    if (!updated) {
      return { success: false, item: null, error: 'Failed to update item' }
    }

    const tags = getItemTags(db, parsed.id)
    const item = toInboxItem(updated, tags)

    emitInboxEvent(InboxChannels.events.UPDATED, { id: parsed.id, changes: updates })

    return { success: true, item }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, item: null, error: message }
  }
}

export async function handleArchive(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = requireDatabase()

    const existing = db.select().from(inboxItems).where(eq(inboxItems.id, id)).get()
    if (!existing) {
      return { success: false, error: 'Item not found' }
    }

    db.update(inboxItems)
      .set({ archivedAt: new Date().toISOString() })
      .where(eq(inboxItems.id, id))
      .run()

    incrementArchivedCount()

    emitInboxEvent(InboxChannels.events.ARCHIVED, { id })

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function handleAddTag(
  itemId: string,
  tag: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = requireDatabase()

    const existing = db.select().from(inboxItems).where(eq(inboxItems.id, itemId)).get()
    if (!existing) {
      return { success: false, error: 'Item not found' }
    }

    const existingTag = db
      .select()
      .from(inboxItemTags)
      .where(and(eq(inboxItemTags.itemId, itemId), eq(inboxItemTags.tag, tag)))
      .get()

    if (existingTag) {
      return { success: true }
    }

    db.insert(inboxItemTags)
      .values({
        id: generateId(),
        itemId,
        tag,
        createdAt: new Date().toISOString()
      })
      .run()

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function handleRemoveTag(
  itemId: string,
  tag: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = requireDatabase()

    db.delete(inboxItemTags)
      .where(and(eq(inboxItemTags.itemId, itemId), eq(inboxItemTags.tag, tag)))
      .run()

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function handleGetTags(): Promise<Array<{ tag: string; count: number }>> {
  const db = requireDatabase()

  const result = db
    .select({
      tag: inboxItemTags.tag,
      count: sql<number>`count(*)`
    })
    .from(inboxItemTags)
    .groupBy(inboxItemTags.tag)
    .orderBy(desc(sql`count(*)`))
    .all()

  return result
}

export async function handleUnarchive(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = requireDatabase()

    const existing = db.select().from(inboxItems).where(eq(inboxItems.id, id)).get()
    if (!existing) {
      return { success: false, error: 'Item not found' }
    }

    if (!existing.archivedAt) {
      return { success: false, error: 'Item is not archived' }
    }

    db.update(inboxItems)
      .set({
        archivedAt: null,
        modifiedAt: new Date().toISOString()
      })
      .where(eq(inboxItems.id, id))
      .run()

    emitInboxEvent(InboxChannels.events.UPDATED, { id, changes: { archivedAt: null } })

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function handleDeletePermanent(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = requireDatabase()

    const existing = db.select().from(inboxItems).where(eq(inboxItems.id, id)).get()
    if (!existing) {
      return { success: false, error: 'Item not found' }
    }

    await deleteInboxAttachments(id)

    db.delete(inboxItemTags).where(eq(inboxItemTags.itemId, id)).run()

    db.delete(inboxItems).where(eq(inboxItems.id, id)).run()

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}
