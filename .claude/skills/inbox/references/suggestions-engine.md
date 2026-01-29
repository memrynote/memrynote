# AI Suggestions Engine Reference

## Architecture

```
Inbox Item Content
       ↓
Generate Embedding (all-MiniLM-L6-v2)
       ↓
sqlite-vec KNN Search
       ↓
Find Similar Notes → Get Folders
       ↓
Merge with Filing History
       ↓
Merge with Recent Destinations
       ↓
Sort by Confidence
       ↓
Return Top 3 Suggestions
```

## Embedding Model

Uses local embeddings via `all-MiniLM-L6-v2` (384 dimensions).

```typescript
// src/main/lib/embeddings.ts
export async function generateEmbedding(text: string): Promise<Float32Array | null>
export function isModelLoaded(): boolean
export async function initEmbeddingModel(): Promise<boolean>
```

### Model Loading

Model is loaded lazily on first embedding request or manually via settings.

```typescript
// Check and init
if (!isModelLoaded()) {
  const loaded = await initEmbeddingModel()
  if (!loaded) {
    // Fall back to history-based suggestions only
  }
}
```

## Vector Storage (sqlite-vec)

Embeddings stored in `vec_notes` virtual table in `index.db`.

```typescript
// src/main/inbox/suggestions.ts
export function storeNoteEmbedding(noteId: string, embedding: Float32Array): void
export function deleteNoteEmbedding(noteId: string): void
export function hasEmbedding(noteId: string): boolean
export function getEmbeddingCount(): number
```

### KNN Search

```sql
SELECT note_id, distance
FROM vec_notes
WHERE embedding MATCH ?
  AND k = ?
ORDER BY distance
```

Distance is cosine distance (0 = identical, 2 = opposite).
Converted to similarity score: `similarity = 1 - distance / 2`

## Suggestion Generation

```typescript
// src/main/inbox/suggestions.ts
export async function getSuggestions(itemId: string): Promise<FilingSuggestion[]>
```

### FilingSuggestion Type

```typescript
interface FilingSuggestion {
  destination: FilingDestination
  confidence: number   // 0-1, higher = more confident
  reason: string       // Human-readable explanation
  suggestedTags: string[]
}
```

### Confidence Scoring

| Source | Base Confidence | Adjustment |
|--------|-----------------|------------|
| Embedding similarity | Raw similarity score | None |
| Filing history | 0.3 | +0.1 per previous filing (max 0.7) |
| Recent destinations | 0.2 | +0.05 per item (max 0.5) |

### Constants

```typescript
const MAX_DISTANCE_THRESHOLD = 1.0  // Skip if distance > this
const MAX_SUGGESTIONS = 3           // Return at most 3
const MIN_CONTENT_LENGTH = 10       // Skip if content too short
```

## Note Folder Suggestions

For moving existing notes (not inbox items):

```typescript
export async function getNoteFolderSuggestions(noteId: string): Promise<FolderSuggestion[]>
```

Same logic as inbox suggestions but:
- Excludes current folder from suggestions
- Returns `FolderSuggestion` (simpler type)

## Reindexing

Full reindex from settings UI:

```typescript
export async function reindexAllEmbeddings(): Promise<{
  success: boolean
  computed: number
  skipped: number
  error?: string
}>
```

### Progress Events

```typescript
// Emitted during reindex
win.webContents.send(SettingsChannels.events.EMBEDDING_PROGRESS, {
  current: 45,
  total: 100,
  phase: 'embedding'  // 'scanning' | 'embedding' | 'complete'
})
```

## Feedback Tracking

Tracks whether suggestions were accepted or rejected:

```typescript
export function trackSuggestionFeedback(
  itemId: string,
  itemType: string,
  suggestedTo: string,
  actualTo: string,
  confidence: number,
  suggestedTags: string[],
  actualTags: string[]
): void
```

### Schema

```typescript
export const suggestionFeedback = sqliteTable('suggestion_feedback', {
  id: text('id').primaryKey(),
  itemId: text('item_id').notNull(),
  itemType: text('item_type').notNull(),
  suggestedTo: text('suggested_to').notNull(),
  actualTo: text('actual_to').notNull(),
  accepted: integer('accepted', { mode: 'boolean' }).notNull(),
  confidence: integer('confidence').notNull(),  // 0-100
  suggestedTags: text('suggested_tags', { mode: 'json' }),
  actualTags: text('actual_tags', { mode: 'json' }),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`)
})
```

### Stats

```typescript
export function getSuggestionStats(): {
  totalSuggestions: number
  acceptedCount: number
  rejectedCount: number
  acceptanceRate: number
}
```

## AI Settings

```typescript
const AI_SETTINGS_KEY = 'ai.enabled'

function isAIEnabled(): boolean {
  const enabled = getSetting(db, AI_SETTINGS_KEY)
  return enabled !== 'false'  // Default to true
}
```

When AI is disabled:
- `getSuggestions()` returns empty array
- `reindexAllEmbeddings()` returns error
- No embeddings are generated

## Updating Embeddings

### On Note Change

```typescript
import { updateNoteEmbedding } from '@/main/inbox/suggestions'

// Called after note content changes
await updateNoteEmbedding(noteId)
```

### On Note Delete

```typescript
import { deleteNoteEmbedding } from '@/main/inbox/suggestions'

// Called when note is deleted
deleteNoteEmbedding(noteId)
```

## Filing History Analysis

```typescript
function getFilingPatterns(itemType: string): FilingPattern[]

interface FilingPattern {
  destination: string
  action: string
  count: number
  tags: string[]
}
```

Analyzes `filing_history` table to find common destinations for each item type.

```typescript
function getRecentFilingDestinations(limit: number): { path: string; count: number }[]
```

Returns most frequently used folder destinations.

## Folder Path Handling

Note paths are stored as `notes/folder/file.md`, but suggestions need folder paths relative to notes directory.

```typescript
function getFolderFromPath(notePath: string): string
// 'notes/kaan/test.md' → 'kaan'
// 'notes/test.md' → ''
// 'notes/notes/kaan/test.md' → 'kaan' (handles corrupted paths)
```
