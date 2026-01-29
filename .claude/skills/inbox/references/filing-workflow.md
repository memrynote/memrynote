# Filing Workflow Reference

## Filing Destinations

```typescript
interface FilingDestination {
  type: 'folder' | 'note' | 'new-note'
  path?: string       // Folder path for 'folder' type
  noteId?: string     // Single note for 'note' type
  noteIds?: string[]  // Multiple notes for 'note' type
  noteTitle?: string  // Title for 'new-note' type
}
```

## File to Folder

Files inbox item as a new note in the specified folder.

```typescript
// src/main/inbox/filing.ts
export async function fileToFolder(
  itemId: string,
  folderPath: string,
  tags?: string[]
): Promise<FileResponse>
```

### Flow

1. Get inbox item from database
2. Ensure folder exists (create if needed)
3. Generate note title from item
4. Create note with content based on item type:
   - **Binary types** (image, voice, pdf, video): Create note with attachment embed
   - **Text types** (note, link, clip, social): Create note with item content
5. Move attachments from `attachments/inbox/{itemId}/` to `attachments/{noteId}/`
6. Update inbox item: `filedAt`, `filedTo`, `filedAction='folder'`
7. Record in `filing_history` table
8. Emit `inbox:filed` event

### Content Generation

```typescript
// For links
const noteContent = `
# ${item.title}

Source: ${item.sourceUrl}

${item.content || ''}
`

// For voice memos
const noteContent = `
# Voice Memo - ${formatDateTime(new Date())}

![[audio.${format}]]

## Transcription
${item.transcription || '_No transcription available_'}
`

// For images
const noteContent = `
# ${item.title}

![[${filename}]]

${item.content || ''}
`
```

## Convert to Note

Converts inbox item to a standalone note without specifying folder.

```typescript
export async function convertToNote(itemId: string): Promise<FileResponse>
```

### Flow

1. Get inbox item
2. Generate note in default notes folder
3. Same content generation as `fileToFolder`
4. Update `filedAction='note'`

## Link to Note

Appends inbox item content to an existing note.

```typescript
export async function linkToNote(
  itemId: string,
  noteId: string,
  tags?: string[]
): Promise<{ success: boolean; error?: string }>

export async function linkToNotes(
  itemId: string,
  noteIds: string[],
  tags?: string[],
  folderPath?: string
): Promise<{ success: boolean; error?: string }>
```

### Flow

1. Get inbox item and target note(s)
2. Generate link content based on item type
3. Append to each target note
4. Update `filedAction='linked'`
5. Move attachments if needed

### Link Content Format

```typescript
// Appended to existing note
const linkContent = `

---
## From Inbox: ${item.title}
_Captured: ${formatDateDisplay(new Date(item.createdAt))}_

${item.content || ''}
${item.sourceUrl ? `\nSource: ${item.sourceUrl}` : ''}
`
```

## Bulk Filing

```typescript
export async function bulkFileToFolder(
  itemIds: string[],
  folderPath: string,
  tags?: string[]
): Promise<BulkResponse>
```

Returns:
```typescript
interface BulkResponse {
  success: boolean
  processedCount: number
  errors: Array<{ itemId: string; error: string }>
}
```

## Filing Schemas

### FileItemSchema

```typescript
export const FileItemSchema = z.object({
  itemId: z.string(),
  destination: z.object({
    type: z.enum(['folder', 'note', 'new-note']),
    path: z.string().optional(),
    noteId: z.string().optional(),
    noteIds: z.array(z.string()).optional(),
    noteTitle: z.string().max(200).optional()
  }),
  tags: z.array(z.string().max(50)).max(20).optional()
})
```

### BulkFileSchema

```typescript
export const BulkFileSchema = z.object({
  itemIds: z.array(z.string()).min(1).max(100),
  destination: z.object({
    type: z.enum(['folder', 'note', 'new-note']),
    path: z.string().optional(),
    noteId: z.string().optional()
  }),
  tags: z.array(z.string().max(50)).max(20).optional()
})
```

## Stale Items

Items older than threshold (default 7 days) are considered stale.

```typescript
// src/main/inbox/stats.ts
export function getStaleThreshold(): number  // Returns days
export function setStaleThreshold(days: number): void
export function isStale(createdAt: string): boolean
export function getStaleItemIds(): string[]
export function countStaleItems(): number
```

### File All Stale

```typescript
// Handler in inbox-handlers.ts
async function handleFileAllStale(): Promise<BulkResponse>
// Files all stale items to "Unsorted" folder
```

## Snooze Operations

```typescript
// src/main/inbox/snooze.ts
export function snoozeItem(input: SnoozeInput): { success: boolean; error?: string }
export function unsnoozeItem(itemId: string): { success: boolean; error?: string }
export function getSnoozedItems(): SnoozedItem[]
export function bulkSnoozeItems(
  itemIds: string[],
  snoozeUntil: string,
  reason?: string
): BulkResponse
```

### SnoozeSchema

```typescript
export const SnoozeSchema = z.object({
  itemId: z.string(),
  snoozeUntil: z.string(),  // ISO datetime
  reason: z.string().max(200).optional()
})
```

## Archive Operations

Archive is a soft delete - sets `archivedAt` timestamp.

```typescript
// List archived items
export const ListArchivedSchema = z.object({
  search: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).default(0)
})

// Unarchive restores to inbox
async function handleUnarchive(id: string): Promise<{ success: boolean; error?: string }>

// Permanent delete
async function handleDeletePermanent(id: string): Promise<{ success: boolean; error?: string }>
// Also deletes attachments and tags
```

## Filing History

Tracks where items were filed for suggestion learning.

```typescript
// Schema
export const filingHistory = sqliteTable('filing_history', {
  id: text('id').primaryKey(),
  itemType: text('item_type').notNull(),
  itemContent: text('item_content'),  // First 500 chars
  filedTo: text('filed_to').notNull(),
  filedAction: text('filed_action').notNull(),
  tags: text('tags', { mode: 'json' }),
  filedAt: text('filed_at').notNull().default(sql`(datetime('now'))`)
})
```

```typescript
// Get recent filing history
export const GetFilingHistorySchema = z.object({
  limit: z.number().int().min(1).max(100).default(20)
})
```
