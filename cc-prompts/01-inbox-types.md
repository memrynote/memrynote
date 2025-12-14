# 01 — Inbox Type System

## Objective

Define the complete TypeScript type system for inbox items. This is the foundation that all other components will use to understand what an inbox item is, what types exist, and what data each type carries.

## Prerequisites

None — this is the first prompt.

## What We're Building

A comprehensive type system that defines:
- The 8 content types an inbox item can be
- The base properties all items share
- Type-specific properties for each content type
- Preview content structures for rich display
- Filter and sort type definitions

## Placement

| What | Where |
|------|-------|
| Main inbox types | `src/renderer/src/data/inbox-types.ts` (NEW) |
| Export from types | Add to `src/renderer/src/types/index.ts` |

**Why this location?** Following the existing pattern where `tasks-data.ts` contains task-related types. Inbox types go in a parallel file.

## Specifications

### The 8 Content Types

```
link     → URL captures (articles, pages, bookmarks)
note     → Text captures (quick notes, thoughts)
image    → Image files (screenshots, photos)
voice    → Audio recordings (voice memos)
pdf      → PDF documents
webclip  → Highlighted excerpts from web pages
file     → Generic files (documents, downloads)
video    → Video files or links
```

### Base Item Properties (all types share these)

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier |
| `type` | InboxItemType | One of the 8 types |
| `title` | string | Display title |
| `createdAt` | Date | When captured |
| `source` | string | Where it came from (app, extension, paste) |
| `tags` | string[] | User-applied tags |
| `folderId` | string \| null | Destination folder (null = unfiled) |
| `snoozedUntil` | Date \| null | Snooze return date |
| `isStale` | computed | True if >7 days old and unfiled |

### Type-Specific Properties

**Link:**
- `url` — the actual URL
- `domain` — extracted domain (fortelabs.com)
- `favicon` — favicon URL
- `heroImage` — og:image or first image
- `excerpt` — meta description or first paragraph

**Note:**
- `content` — full text content
- `wordCount` — computed word count
- `preview` — first 2-3 lines for display

**Image:**
- `imageUrl` — path or URL to image
- `dimensions` — { width, height }
- `fileSize` — human readable (2.4 MB)
- `caption` — optional user caption

**Voice:**
- `audioUrl` — path to audio file
- `duration` — length in seconds
- `waveformData` — array for visualization
- `transcription` — text transcription (if available)
- `isAutoTranscribed` — boolean

**PDF:**
- `fileUrl` — path to PDF
- `pageCount` — number of pages
- `fileSize` — human readable
- `thumbnailUrl` — first page preview
- `textPreview` — extracted first paragraph

**Webclip:**
- `sourceUrl` — original page URL
- `domain` — source domain
- `highlights` — array of highlighted text excerpts
- `highlightCount` — number of highlights

**File:**
- `fileUrl` — path to file
- `fileName` — original filename
- `extension` — file extension (docx, xlsx)
- `fileSize` — human readable
- `mimeType` — file MIME type

**Video:**
- `videoUrl` — URL or path
- `thumbnailUrl` — preview frame
- `duration` — length in seconds
- `source` — YouTube, Vimeo, local, etc.

### Filter Types

Define types for filtering:
- `InboxFilterType` — 'all' | 'link' | 'note' | 'image' | 'voice' | 'pdf' | 'webclip' | 'file' | 'video'
- `InboxTimeFilter` — 'all' | 'today' | 'thisWeek' | 'older' | 'stale'
- `InboxSortOption` — 'newest' | 'oldest' | 'type' | 'title'

### State Types

- `InboxViewMode` — 'compact' | 'medium' | 'expanded'
- `InboxFilters` — combined filter state object
- `InboxState` — full page state (items, selection, filters, etc.)

## Design System Alignment

Types should use naming conventions consistent with the codebase:
- PascalCase for type/interface names
- camelCase for properties
- Union types for fixed options (not enums, following existing pattern)

## Acceptance Criteria

- [ ] `InboxItemType` union type with all 8 types defined
- [ ] `InboxItem` base interface with common properties
- [ ] Type-specific interfaces extending or composing with base
- [ ] `InboxFilters` interface for filter state
- [ ] `InboxViewMode` type for view switching
- [ ] All types exported from `types/index.ts`
- [ ] Sample data file with at least 2 items of each type for testing

## Next Prompt

**02-page-shell.md** — Create the inbox page layout structure and header bar component.
