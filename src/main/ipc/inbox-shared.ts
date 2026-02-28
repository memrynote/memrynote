import { BrowserWindow } from 'electron'
import type { InboxItem, InboxItemListItem } from '@shared/contracts/inbox-api'
import { getDatabase, type DrizzleDb } from '../database'
import { inboxItems, inboxItemTags } from '@shared/db/schema/inbox'
import { eq } from 'drizzle-orm'
import { resolveAttachmentUrl } from '../inbox/attachments'
import { isStale as checkIsStale } from '../inbox/stats'

export const METADATA_RETRY_DELAY = 5000

export function emitInboxEvent(channel: string, data: unknown): void {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(channel, data)
  })
}

export function requireDatabase(): DrizzleDb {
  try {
    return getDatabase()
  } catch {
    throw new Error('No vault is open. Please open a vault first.')
  }
}

export function isStale(createdAt: string): boolean {
  return checkIsStale(createdAt)
}

export function getItemTags(db: ReturnType<typeof getDatabase>, itemId: string): string[] {
  const tags = db.select().from(inboxItemTags).where(eq(inboxItemTags.itemId, itemId)).all()
  return tags.map((t) => t.tag)
}

export function toInboxItem(row: typeof inboxItems.$inferSelect, tags: string[]): InboxItem {
  return {
    id: row.id,
    type: row.type as InboxItem['type'],
    title: row.title,
    content: row.content,
    createdAt: new Date(row.createdAt),
    modifiedAt: new Date(row.modifiedAt),
    filedAt: row.filedAt ? new Date(row.filedAt) : null,
    filedTo: row.filedTo,
    filedAction: row.filedAction as InboxItem['filedAction'],
    snoozedUntil: row.snoozedUntil ? new Date(row.snoozedUntil) : null,
    snoozeReason: row.snoozeReason,
    viewedAt: row.viewedAt ? new Date(row.viewedAt) : null,
    archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
    processingStatus: (row.processingStatus || 'complete') as InboxItem['processingStatus'],
    processingError: row.processingError,
    metadata: row.metadata as InboxItem['metadata'],
    attachmentPath: row.attachmentPath,
    attachmentUrl: resolveAttachmentUrl(row.attachmentPath),
    thumbnailPath: row.thumbnailPath,
    thumbnailUrl: resolveAttachmentUrl(row.thumbnailPath),
    transcription: row.transcription,
    transcriptionStatus: row.transcriptionStatus as InboxItem['transcriptionStatus'],
    sourceUrl: row.sourceUrl,
    sourceTitle: row.sourceTitle,
    tags,
    isStale: isStale(row.createdAt)
  }
}

export function toListItem(row: typeof inboxItems.$inferSelect, tags: string[]): InboxItemListItem {
  const metadata = row.metadata as Record<string, unknown> | null
  const isReminder = row.type === 'reminder'

  return {
    id: row.id,
    type: row.type as InboxItemListItem['type'],
    title: row.title,
    content: row.content,
    createdAt: new Date(row.createdAt),
    thumbnailUrl: resolveAttachmentUrl(row.thumbnailPath),
    sourceUrl: row.sourceUrl,
    tags,
    isStale: isStale(row.createdAt),
    processingStatus: (row.processingStatus || 'complete') as InboxItemListItem['processingStatus'],
    duration: metadata?.duration as number | undefined,
    excerpt: metadata?.excerpt as string | undefined,
    pageCount: metadata?.pageCount as number | undefined,
    transcription: row.transcription,
    transcriptionStatus: row.transcriptionStatus as InboxItemListItem['transcriptionStatus'],
    snoozedUntil: row.snoozedUntil ? new Date(row.snoozedUntil) : undefined,
    snoozeReason: row.snoozeReason ?? undefined,
    viewedAt: row.viewedAt ? new Date(row.viewedAt) : undefined,
    metadata: isReminder ? (metadata as unknown as InboxItemListItem['metadata']) : undefined
  }
}
