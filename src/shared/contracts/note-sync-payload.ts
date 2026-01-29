/**
 * Sync payload schemas for notes and journal entries.
 * Used to validate and parse incoming sync data.
 *
 * @module contracts/note-sync-payload
 */

import { z } from 'zod'

export const NoteSyncPayloadSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  path: z.string().min(1),
  created: z.string().datetime({ offset: true }).or(z.string().datetime()),
  modified: z.string().datetime({ offset: true }).or(z.string().datetime()),
  tags: z.array(z.string()).optional().default([]),
  aliases: z.array(z.string()).optional().default([]),
  emoji: z.string().nullable().optional(),
  properties: z.record(z.string(), z.unknown()).optional().default({})
})

export const JournalSyncPayloadSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  created: z.string().datetime({ offset: true }).or(z.string().datetime()),
  modified: z.string().datetime({ offset: true }).or(z.string().datetime()),
  tags: z.array(z.string()).optional().default([]),
  properties: z.record(z.string(), z.unknown()).optional().default({})
})

export type NoteSyncPayload = z.infer<typeof NoteSyncPayloadSchema>
export type JournalSyncPayload = z.infer<typeof JournalSyncPayloadSchema>

export function parseNoteSyncPayload(data: unknown): NoteSyncPayload | null {
  const result = NoteSyncPayloadSchema.safeParse(data)
  return result.success ? result.data : null
}

export function parseJournalSyncPayload(data: unknown): JournalSyncPayload | null {
  const result = JournalSyncPayloadSchema.safeParse(data)
  return result.success ? result.data : null
}
