---
name: vault-journal
description: |
  Guide for journal entries, date handling, and calendar views in Memry.
  Triggers: "journal entry", "create journal", "journal date", "heatmap", "calendar view", "day context", "journal streak", "journal tags", "year stats", "month entries", "activity level"
---

# Journal System

## Storage

Journal entries are markdown files with YAML frontmatter at `vault/journal/YYYY-MM-DD.md`.

```yaml
---
id: j2025-01-29
date: 2025-01-29
created: 2025-01-29T10:00:00.000Z
modified: 2025-01-29T15:30:00.000Z
tags:
  - reflection
  - work
properties:
  mood: happy
  energy: 3
---
Journal content here...
```

## Key Types

```typescript
// Entry ID format: j{YYYY-MM-DD}
type JournalEntry = {
  id: string              // j2025-01-29
  date: string            // YYYY-MM-DD
  content: string         // Markdown (no frontmatter)
  wordCount: number
  characterCount: number
  tags: string[]
  properties?: Record<string, unknown>
  createdAt: string       // ISO timestamp
  modifiedAt: string      // ISO timestamp
}

// Activity levels: 0-4 based on character count
// 0: empty, 1: 1-100, 2: 101-500, 3: 501-1000, 4: 1001+
type ActivityLevel = 0 | 1 | 2 | 3 | 4
```

## Date Format

**Always use YYYY-MM-DD format for dates** (e.g., `2025-01-29`).

Key date utilities in `@/lib/journal-utils`:

```typescript
formatDateToISO(date: Date): string           // Date → "YYYY-MM-DD"
parseISODate(dateStr: string): Date           // "YYYY-MM-DD" → Date
getTodayString(): string                      // Today as "YYYY-MM-DD"
addDays(date: Date, days: number): Date       // Add/subtract days
getDateDistance(date1: string, date2: string) // Days between dates
```

## Main Process (vault/journal.ts)

```typescript
// Read entry
readJournalEntry(date: string): Promise<JournalEntry | null>

// Write entry (creates or updates)
writeJournalEntry(date: string, content: string, tags?: string[], properties?: Record<string, unknown>): Promise<JournalEntry>

// Delete entry
deleteJournalEntryFile(date: string): Promise<boolean>

// Check existence
journalEntryExists(date: string): Promise<boolean>

// Get file path
getJournalPath(date: string): string  // Absolute path
getJournalRelativePath(date: string): string  // From vault root
```

## Renderer Service (services/journal-service.ts)

```typescript
import { journalService } from '@/services/journal-service'

// CRUD
journalService.getEntry(date: string): Promise<JournalEntry | null>
journalService.createEntry({ date, content?, tags?, properties? }): Promise<JournalEntry>
journalService.updateEntry({ date, content?, tags?, properties? }): Promise<JournalEntry>
journalService.deleteEntry(date: string): Promise<{ success: boolean }>

// Calendar views
journalService.getHeatmap(year: number): Promise<HeatmapEntry[]>
journalService.getMonthEntries(year: number, month: number): Promise<MonthEntryPreview[]>
journalService.getYearStats(year: number): Promise<MonthStats[]>

// Context & metadata
journalService.getDayContext(date: string): Promise<DayContext>
journalService.getAllTags(): Promise<JournalTagCount[]>
journalService.getStreak(): Promise<JournalStreak>
```

## React Hooks (hooks/use-journal.ts)

```typescript
// Entry management with auto-save (1s debounce)
const {
  entry,           // JournalEntry | null
  isLoading,
  isDirty,         // Unsaved changes
  isSaving,
  saveError,
  updateContent,   // (content: string) => void
  updateTags,      // (tags: string[]) => void - instant save
  saveNow,         // Force immediate save
  reload,          // Reload from server
  forceReload,     // Discard changes and reload
  deleteEntry
} = useJournalEntry(date)

// Calendar data
const { data, isLoading } = useJournalHeatmap(year)
const { data, isLoading } = useMonthEntries(year, month)
const { data, isLoading } = useYearStats(year)
const { data, tasks, events, overdueCount } = useDayContext(date)
```

## IPC Channels

```typescript
import { JournalChannels } from '@shared/ipc-channels'

// Invoke (renderer → main)
JournalChannels.invoke.GET_ENTRY       // 'journal:getEntry'
JournalChannels.invoke.CREATE_ENTRY    // 'journal:createEntry'
JournalChannels.invoke.UPDATE_ENTRY    // 'journal:updateEntry'
JournalChannels.invoke.DELETE_ENTRY    // 'journal:deleteEntry'
JournalChannels.invoke.GET_HEATMAP     // 'journal:getHeatmap'
JournalChannels.invoke.GET_MONTH_ENTRIES
JournalChannels.invoke.GET_YEAR_STATS
JournalChannels.invoke.GET_DAY_CONTEXT
JournalChannels.invoke.GET_ALL_TAGS
JournalChannels.invoke.GET_STREAK

// Events (main → renderer)
JournalChannels.events.ENTRY_CREATED
JournalChannels.events.ENTRY_UPDATED
JournalChannels.events.ENTRY_DELETED
JournalChannels.events.EXTERNAL_CHANGE
```

## Event Subscriptions

```typescript
import {
  onJournalEntryCreated,
  onJournalEntryUpdated,
  onJournalEntryDeleted,
  onJournalExternalChange
} from '@/services/journal-service'

// Returns unsubscribe function
const unsub = onJournalEntryUpdated((event) => {
  console.log(event.date, event.entry)
})
// Later: unsub()
```

## Query Keys (TanStack Query)

```typescript
import { journalKeys } from '@/hooks/use-journal'

journalKeys.entry(date)                    // ['journal', 'entries', date]
journalKeys.heatmap(year)                  // ['journal', 'heatmaps', year]
journalKeys.monthEntriesForMonth(year, month)
journalKeys.yearStatsForYear(year)
journalKeys.dayContextForDate(date)
```

## Activity Level Calculation

```typescript
import { calculateActivityLevel } from '@shared/contracts/journal-api'

calculateActivityLevel(0)     // 0 (empty)
calculateActivityLevel(50)    // 1 (1-100 chars)
calculateActivityLevel(300)   // 2 (101-500 chars)
calculateActivityLevel(800)   // 3 (501-1000 chars)
calculateActivityLevel(2000)  // 4 (1001+ chars)
```

## Common Patterns

### Navigate to specific date
```typescript
const date = '2025-01-29'
navigate(`/journal/${date}`)
```

### Get today's entry
```typescript
import { getTodayString } from '@/lib/journal-utils'
const { entry } = useJournalEntry(getTodayString())
```

### Save on navigation
The `useJournalEntry` hook automatically saves pending changes when the date prop changes.

### Handle external file changes
The hook subscribes to `EXTERNAL_CHANGE` events and updates the editor when files are modified outside the app.

## File Locations

| Purpose | Path |
|---------|------|
| API contracts & types | `src/shared/contracts/journal-api.ts` |
| File operations | `src/main/vault/journal.ts` |
| IPC handlers | `src/main/ipc/journal-handlers.ts` |
| Renderer service | `src/renderer/src/services/journal-service.ts` |
| React hooks | `src/renderer/src/hooks/use-journal.ts` |
| Date utilities | `src/renderer/src/lib/journal-utils.ts` |
| Components | `src/renderer/src/components/journal/` |
| Journal page | `src/renderer/src/pages/journal.tsx` |
