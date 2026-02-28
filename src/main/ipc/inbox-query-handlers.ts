/* eslint-disable @typescript-eslint/require-await */

import {
  InboxListSchema,
  ListArchivedSchema,
  GetFilingHistorySchema,
  type InboxListResponse,
  type InboxItemListItem,
  type InboxStats,
  type CapturePattern,
  type ArchivedListResponse,
  type FilingHistoryResponse,
  type FilingHistoryEntry
} from '@shared/contracts/inbox-api'
import { inboxItems } from '@shared/db/schema/inbox'
import { desc, asc, and, isNull, sql } from 'drizzle-orm'
import {
  getStaleThreshold as getStaleThresholdDays,
  setStaleThreshold as setStaleThresholdDays,
  countStaleItems,
  getTodayActivity,
  getAverageTimeToProcess
} from '../inbox/stats'
import { requireDatabase, getItemTags, toListItem } from './inbox-shared'

export async function handleList(input: unknown): Promise<InboxListResponse> {
  const options = InboxListSchema.parse(input || {})
  const db = requireDatabase()

  const conditions: ReturnType<typeof sql>[] = []

  if (options.type) {
    conditions.push(sql`${inboxItems.type} = ${options.type}`)
  }

  conditions.push(sql`${inboxItems.filedAt} IS NULL`)

  if (!options.includeSnoozed) {
    conditions.push(sql`${inboxItems.snoozedUntil} IS NULL`)
  }

  conditions.push(sql`${inboxItems.archivedAt} IS NULL`)

  let query = db.select().from(inboxItems)

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query
  }

  const sortColumn =
    options.sortBy === 'modified'
      ? inboxItems.modifiedAt
      : options.sortBy === 'title'
        ? inboxItems.title
        : inboxItems.createdAt

  query = query.orderBy(
    options.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)
  ) as typeof query

  const countResult = db
    .select({ count: sql<number>`count(*)` })
    .from(inboxItems)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .get()
  const total = countResult?.count || 0

  query = query.limit(options.limit).offset(options.offset) as typeof query

  const rows = query.all()

  const items: InboxItemListItem[] = rows.map((row) => {
    const tags = getItemTags(db, row.id)
    return toListItem(row, tags)
  })

  return {
    items,
    total,
    hasMore: options.offset + items.length < total
  }
}

export async function handleListArchived(input: unknown): Promise<ArchivedListResponse> {
  const options = ListArchivedSchema.parse(input || {})
  const db = requireDatabase()

  const conditions: ReturnType<typeof sql>[] = []
  conditions.push(sql`${inboxItems.archivedAt} IS NOT NULL`)

  if (options.search) {
    conditions.push(
      sql`(${inboxItems.title} LIKE ${'%' + options.search + '%'} OR ${inboxItems.content} LIKE ${'%' + options.search + '%'})`
    )
  }

  const countResult = db
    .select({ count: sql<number>`count(*)` })
    .from(inboxItems)
    .where(and(...conditions))
    .get()

  const total = countResult?.count || 0

  const rows = db
    .select()
    .from(inboxItems)
    .where(and(...conditions))
    .orderBy(desc(inboxItems.archivedAt))
    .limit(options.limit)
    .offset(options.offset)
    .all()

  const items: InboxItemListItem[] = rows.map((row) => {
    const tags = getItemTags(db, row.id)
    return toListItem(row, tags)
  })

  return {
    items,
    total,
    hasMore: options.offset + items.length < total
  }
}

export async function handleGetStats(): Promise<InboxStats> {
  const db = requireDatabase()

  const totalResult = db
    .select({ count: sql<number>`count(*)` })
    .from(inboxItems)
    .where(
      and(
        isNull(inboxItems.filedAt),
        isNull(inboxItems.snoozedUntil),
        isNull(inboxItems.archivedAt)
      )
    )
    .get()

  const typeResult = db
    .select({
      type: inboxItems.type,
      count: sql<number>`count(*)`
    })
    .from(inboxItems)
    .where(
      and(
        isNull(inboxItems.filedAt),
        isNull(inboxItems.snoozedUntil),
        isNull(inboxItems.archivedAt)
      )
    )
    .groupBy(inboxItems.type)
    .all()

  const itemsByType: Record<string, number> = {
    link: 0,
    note: 0,
    image: 0,
    voice: 0,
    clip: 0,
    pdf: 0,
    social: 0
  }

  for (const row of typeResult) {
    itemsByType[row.type] = row.count
  }

  const staleCount = countStaleItems()

  const snoozedResult = db
    .select({ count: sql<number>`count(*)` })
    .from(inboxItems)
    .where(and(sql`${inboxItems.snoozedUntil} IS NOT NULL`, isNull(inboxItems.archivedAt)))
    .get()

  const { capturedToday, processedToday } = getTodayActivity()
  const avgTimeToProcess = getAverageTimeToProcess()

  return {
    totalItems: totalResult?.count || 0,
    itemsByType: itemsByType as InboxStats['itemsByType'],
    staleCount,
    snoozedCount: snoozedResult?.count || 0,
    processedToday,
    capturedToday,
    avgTimeToProcess
  }
}

export async function handleGetStaleThreshold(): Promise<number> {
  return getStaleThresholdDays()
}

export async function handleSetStaleThreshold(days: number): Promise<{ success: boolean }> {
  setStaleThresholdDays(days)
  return { success: true }
}

export async function handleGetFilingHistory(input: unknown): Promise<FilingHistoryResponse> {
  const options = GetFilingHistorySchema.parse(input || {})
  const db = requireDatabase()

  const rows = db
    .select()
    .from(inboxItems)
    .where(sql`${inboxItems.filedAt} IS NOT NULL`)
    .orderBy(desc(inboxItems.filedAt))
    .limit(options.limit)
    .all()

  const entries: FilingHistoryEntry[] = rows.map((row) => {
    const tags = getItemTags(db, row.id)
    return {
      id: row.id,
      itemId: row.id,
      itemType: row.type as FilingHistoryEntry['itemType'],
      itemTitle: row.title,
      filedTo: row.filedTo || '',
      filedAction: (row.filedAction || 'folder') as FilingHistoryEntry['filedAction'],
      filedAt: new Date(row.filedAt!),
      tags
    }
  })

  return { entries }
}

export async function stubGetPatterns(): Promise<CapturePattern> {
  return {
    timeHeatmap: [],
    typeDistribution: [],
    topDomains: [],
    topTags: []
  }
}
