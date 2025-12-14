# 01 - Foundation Types

## Objective

Create the foundational TypeScript types and interfaces that define the inbox data model. This establishes the type safety and structure for all subsequent inbox components.

---

## Context

The inbox handles 8 distinct content types, each with unique metadata and display requirements. A well-designed type system enables:
- Type-safe component props
- Discriminated unions for type-specific rendering
- Consistent data shapes across the application

**Dependencies:** None (this is the foundation)

**Blocks:** All other inbox prompts

---

## Specifications

### Content Types (from inbox-layouts.md)

| Type | Required Metadata |
|------|-------------------|
| `link` | url, domain, title, heroImage?, excerpt?, favicon? |
| `note` | content, wordCount |
| `image` | src, dimensions (width x height), fileSize |
| `voice` | audioUrl, duration, waveformData?, transcription? |
| `pdf` | pdfUrl, pageCount, fileSize, firstPageThumb? |
| `webclip` | sourceUrl, sourceDomain, highlights[], excerpt |
| `file` | fileUrl, fileName, extension, fileSize |
| `video` | videoUrl, thumbnail?, duration, source? |

### Item States

- `default` - Normal display
- `hover` - Mouse over (shows quick actions)
- `selected` - Checkbox checked
- `focused` - Keyboard navigation focus
- `snoozed` - Deferred until later

### View Modes

- `compact` - 44px list rows
- `medium` - 80-120px cards (default)
- `expanded` - Full detail cards

---

## Implementation Guide

### File Location

Create new file: `src/renderer/src/types/inbox.ts`

### Type Definitions to Create

1. **InboxContentType** - Union of all 8 content type strings
2. **InboxItemBase** - Common fields for all items
3. **InboxItemLink** - Link-specific item
4. **InboxItemNote** - Note-specific item
5. **InboxItemImage** - Image-specific item
6. **InboxItemVoice** - Voice-specific item
7. **InboxItemPdf** - PDF-specific item
8. **InboxItemWebclip** - Webclip-specific item
9. **InboxItemFile** - File-specific item
10. **InboxItemVideo** - Video-specific item
11. **InboxItem** - Discriminated union of all item types
12. **InboxViewMode** - View mode union
13. **InboxFilterState** - Filter configuration
14. **InboxSortOption** - Sort options
15. **UserTag** - Tag with color

---

## Code Structure

```typescript
// src/renderer/src/types/inbox.ts

// =============================================================================
// CONTENT TYPES
// =============================================================================

export type InboxContentType =
  | 'link'
  | 'note'
  | 'image'
  | 'voice'
  | 'pdf'
  | 'webclip'
  | 'file'
  | 'video'

// =============================================================================
// BASE ITEM INTERFACE
// =============================================================================

export interface InboxItemBase {
  id: string
  type: InboxContentType
  title: string
  createdAt: Date
  updatedAt: Date
  tags: UserTag[]
  isSelected: boolean
  snoozedUntil?: Date
  aiSuggestion?: AISuggestion
}

// =============================================================================
// TYPE-SPECIFIC ITEMS
// =============================================================================

export interface InboxItemLink extends InboxItemBase {
  type: 'link'
  url: string
  domain: string
  favicon?: string
  heroImage?: string
  excerpt?: string
}

// ... continue for all 8 types

// =============================================================================
// DISCRIMINATED UNION
// =============================================================================

export type InboxItem =
  | InboxItemLink
  | InboxItemNote
  | InboxItemImage
  | InboxItemVoice
  | InboxItemPdf
  | InboxItemWebclip
  | InboxItemFile
  | InboxItemVideo

// =============================================================================
// VIEW AND FILTER TYPES
// =============================================================================

export type InboxViewMode = 'compact' | 'medium' | 'expanded'

export type InboxSortOption = 'newest' | 'oldest' | 'type'

export interface InboxFilterState {
  types: InboxContentType[]
  timeRange: 'all' | 'today' | 'week' | 'older' | 'stale'
  sort: InboxSortOption
  searchQuery: string
}

// =============================================================================
// SUPPORTING TYPES
// =============================================================================

export interface UserTag {
  id: string
  name: string
  color: TagColor
}

export type TagColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'gray'

export interface AISuggestion {
  folderId: string
  folderPath: string
  confidence: number // 0-100
  similarItems?: string[] // IDs of similar items
}
```

---

## Acceptance Criteria

- [ ] File created at `src/renderer/src/types/inbox.ts`
- [ ] All 8 content type interfaces defined with correct metadata
- [ ] Discriminated union `InboxItem` properly typed
- [ ] View mode and filter types defined
- [ ] Supporting types (UserTag, AISuggestion) included
- [ ] `pnpm typecheck` passes with no errors
- [ ] Types can be imported in other files

---

## Testing

After implementation, verify types work correctly:

```typescript
// Test file or component
import type { InboxItem, InboxItemLink } from '@/types/inbox'

// Type guard should work
function isLink(item: InboxItem): item is InboxItemLink {
  return item.type === 'link'
}

// Discriminated union should narrow correctly
function getItemUrl(item: InboxItem): string | null {
  if (item.type === 'link') {
    return item.url // TypeScript knows this is InboxItemLink
  }
  return null
}
```

---

## Notes

- Use `Date` objects for timestamps (not strings)
- The `isSelected` field is for UI state, consider if this belongs in a separate selection state
- `snoozedUntil` being undefined means the item is not snoozed
- AI suggestion confidence uses 0-100 scale per the spec
