---
name: inbox
description: |
  Inbox capture system for quick content capture, filing workflows, and AI-powered suggestions.
  Triggers: "inbox item", "capture link", "capture text", "capture image", "capture voice",
  "file inbox", "filing suggestion", "snooze inbox", "inbox tags", "stale items", "bulk file",
  "InboxItem", "CaptureResponse", "FilingSuggestion", "inbox-handlers", "inbox-api",
  "transcription", "social post capture", "PDF capture", "web clip"
---

# Inbox System

## Capture Flow

```
User Input → Capture Handler → Validate (Zod) → Store DB → Background Processing → IPC Event
                                                            ↳ Metadata fetch (links)
                                                            ↳ Transcription (voice)
                                                            ↳ Social extraction
```

## Item Types

| Type | ID Prefix | Processing | Metadata |
|------|-----------|------------|----------|
| `link` | `inbox_lnk_` | Background metadata fetch | `LinkMetadata` |
| `note` | `inbox_note_` | Immediate | None |
| `image` | `inbox_img_` | Thumbnail generation | `ImageMetadata` |
| `voice` | `inbox_voice_` | Whisper transcription | `VoiceMetadata` |
| `clip` | `inbox_clip_` | HTML sanitization | `ClipMetadata` |
| `pdf` | `inbox_pdf_` | Text extraction, OCR | `PdfMetadata` |
| `social` | `inbox_social_` | Platform-specific | `SocialMetadata` |
| `reminder` | `inbox_rem_` | Immediate | `ReminderMetadata` |

## Key Files

| Path | Purpose |
|------|---------|
| `src/shared/contracts/inbox-api.ts` | Types, Zod schemas, IPC contract |
| `src/shared/db/schema/inbox.ts` | Database schema (4 tables) |
| `src/main/ipc/inbox-handlers.ts` | IPC handler registration |
| `src/main/inbox/` | Business logic modules |
| `src/renderer/src/hooks/use-inbox.ts` | React hook for inbox state |
| `src/renderer/src/services/inbox-service.ts` | Renderer service layer |

## Capture Functions

### Text Capture

```typescript
import { CaptureTextSchema } from '@shared/contracts/inbox-api'

// Validation
const input = CaptureTextSchema.parse({
  content: 'My quick note',
  title: 'Optional title',
  tags: ['idea', 'research']
})

// Handler creates: type='note', immediate complete
```

### Link Capture

```typescript
import { CaptureLinkSchema } from '@shared/contracts/inbox-api'

// Detects social posts automatically
const input = CaptureLinkSchema.parse({
  url: 'https://twitter.com/user/status/123',
  tags: ['social']
})

// Handler:
// 1. Creates item with processingStatus='pending'
// 2. Triggers background metadata/social extraction
// 3. Emits METADATA_COMPLETE event when done
```

### Image Capture

```typescript
import { CaptureImageSchema } from '@shared/contracts/inbox-api'

const input = CaptureImageSchema.parse({
  data: buffer,  // Buffer | Uint8Array
  filename: 'screenshot.png',
  mimeType: 'image/png',
  tags: []
})

// Handler:
// 1. Stores in vault/attachments/inbox/{itemId}/
// 2. Generates thumbnail (400x400 max)
// 3. Extracts EXIF metadata
```

## Filing Operations

### File to Folder

```typescript
import { fileToFolder } from '@/main/inbox/filing'

await fileToFolder(itemId, 'Research/Papers', ['important'])
// Creates note in notes/Research/Papers/
// Moves attachments, updates filing history
```

### Convert to Note

```typescript
import { convertToNote } from '@/main/inbox/filing'

await convertToNote(itemId)
// Creates standalone note from inbox item
// Handles binary vs text types differently
```

### Link to Existing Note

```typescript
import { linkToNote, linkToNotes } from '@/main/inbox/filing'

await linkToNote(itemId, noteId, ['reference'])
await linkToNotes(itemId, [noteId1, noteId2])
// Appends content/reference to existing note(s)
```

## AI Suggestions

### How Suggestions Work

1. **Embedding similarity** - Compares item content to existing notes using sqlite-vec
2. **Filing history** - Analyzes where similar items were filed before
3. **Recent destinations** - Suggests frequently used folders

```typescript
import { getSuggestions } from '@/main/inbox/suggestions'

const suggestions = await getSuggestions(itemId)
// Returns: FilingSuggestion[] with confidence, reason, suggestedTags
```

### Embedding Management

```typescript
import { updateNoteEmbedding, reindexAllEmbeddings } from '@/main/inbox/suggestions'

// Update single note embedding
await updateNoteEmbedding(noteId)

// Reindex all (from settings UI)
await reindexAllEmbeddings()
```

### Feedback Tracking

```typescript
import { trackSuggestionFeedback } from '@/main/inbox/suggestions'

trackSuggestionFeedback(
  itemId,
  'link',           // itemType
  'Research',       // suggestedTo
  'Work/Projects',  // actualTo (what user chose)
  0.85,             // confidence
  ['ai'],           // suggestedTags
  ['work', 'ai']    // actualTags
)
```

## Database Schema

### inbox_items Table

| Column | Type | Purpose |
|--------|------|---------|
| `id` | TEXT PK | `inbox_{type}_{nanoid}` |
| `type` | TEXT | Item type enum |
| `title` | TEXT | Display title |
| `content` | TEXT | Text content/excerpt |
| `processingStatus` | TEXT | pending/processing/complete/failed |
| `metadata` | JSON | Type-specific metadata |
| `attachmentPath` | TEXT | Relative path to attachment |
| `thumbnailPath` | TEXT | Relative path to thumbnail |
| `filedAt` | TEXT | When filed (null = in inbox) |
| `filedTo` | TEXT | Where filed (noteId or path) |
| `snoozedUntil` | TEXT | Snooze expiry datetime |
| `archivedAt` | TEXT | Soft delete timestamp |

### Related Tables

| Table | Purpose |
|-------|---------|
| `inbox_item_tags` | Tag associations |
| `filing_history` | Tracks filing patterns for suggestions |
| `suggestion_feedback` | Learns from user choices |
| `inbox_stats` | Daily capture/processing counts |

## IPC Events

| Event | Payload | When |
|-------|---------|------|
| `inbox:captured` | `{ item: InboxItemListItem }` | New item created |
| `inbox:updated` | `{ id, changes }` | Item modified |
| `inbox:archived` | `{ id }` | Item archived |
| `inbox:filed` | `{ id, filedTo, filedAction }` | Item filed |
| `inbox:metadata-complete` | `{ id, metadata }` | Background fetch done |
| `inbox:transcription-complete` | `{ id, transcription }` | Whisper done |

## Renderer Usage

```typescript
import { useInbox } from '@/hooks/use-inbox'

function InboxView() {
  const {
    items,
    isLoading,
    captureText,
    captureLink,
    fileItem,
    archiveItem,
    getSuggestions
  } = useInbox()

  // Capture
  await captureText({ content: 'Quick thought', tags: ['idea'] })

  // File with suggestion
  const suggestions = await getSuggestions(itemId)
  await fileItem({
    itemId,
    destination: suggestions[0].destination,
    tags: suggestions[0].suggestedTags
  })
}
```

## Reference Files

- [Capture Types](references/capture-types.md) - All capture schemas and metadata
- [Filing Workflow](references/filing-workflow.md) - Complete filing process
- [Suggestions Engine](references/suggestions-engine.md) - AI suggestion details
