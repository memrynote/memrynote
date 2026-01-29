# Search API

## Overview

Search functions are defined in `src/shared/db/queries/search.ts` and exposed to the renderer via IPC handlers in `src/main/ipc/search-handlers.ts`.

## Quick Search

Fast search for instant results while typing.

```typescript
function quickSearch(query: string): QuickSearchResult

interface QuickSearchResult {
  notes: NoteListItem[]  // Limited results for dropdown
}
```

Behavior:
- Searches title and snippet only
- Limited to ~10 results
- Prefix matching enabled
- Very fast response

## Search Notes

Standard full-text search.

```typescript
function searchNotes(
  query: string,
  options?: SearchOptions
): SearchResultNote[]

interface SearchOptions {
  folder?: string    // Filter to folder
  tags?: string[]    // Filter by tags (AND)
  limit?: number     // Default: 50
  offset?: number    // For pagination
}

interface SearchResultNote {
  id: string
  title: string
  path: string
  snippet: string       // Highlighted match
  score: number         // Relevance score
  tags: string[]
  matchedIn: string[]   // ['title', 'content', 'tags']
  createdAt: number
  modifiedAt: number
}
```

## Advanced Search

Full-featured search with operators.

```typescript
function advancedSearch(
  options: AdvancedSearchOptions
): AdvancedSearchResultNote[]

interface AdvancedSearchOptions {
  text?: string           // Search query
  titleOnly?: boolean     // Search title only
  folder?: string         // Filter to folder
  tags?: string[]         // Include tags (AND)
  dateFrom?: string       // ISO date string
  dateTo?: string         // ISO date string
  sortBy?: 'relevance' | 'modified' | 'created' | 'title'
  sortDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
  operators?: {
    tags?: string[]       // Required tags
    excludeTags?: string[] // Excluded tags
  }
}

interface AdvancedSearchResultNote extends SearchResultNote {
  emoji?: string
}
```

## Query Helpers

### Escape Query

```typescript
function escapeSearchQuery(query: string): string
```

Escapes FTS5 special characters:
- `"` → `""`
- `'` → `''`
- `*`, `-`, `+`, `(`, `)` → escaped

### Build Prefix Query

```typescript
function buildPrefixQuery(query: string): string
```

Adds prefix matching:
- `"hello world"` → `"hello* world*"`
- Enables partial word matching

### Build Title-Only Query

```typescript
function buildTitleOnlyQuery(query: string): string
```

Restricts search to title column:
- `"hello"` → `"title:hello*"`

## Backlinks

```typescript
function findBacklinks(noteId: string): Backlink[]

interface Backlink {
  sourceId: string
  sourcePath: string
  sourceTitle: string
  context: string      // Surrounding text
  lineNumber: number
}
```

## Tag Search

```typescript
function findNotesByTag(tag: string): NoteListItem[]
function getTagsForNote(noteId: string): string[]
```

## Recent Notes

```typescript
function getRecentNotes(limit?: number): NoteListItem[]
// Sorted by modifiedAt DESC
```

## Search Suggestions

```typescript
function getSuggestions(query: string): SearchSuggestion[]

interface SearchSuggestion {
  text: string
  type: 'note' | 'tag' | 'folder'
  count?: number
}
```

## IPC Channels

```typescript
// src/main/ipc/search-handlers.ts
'search:quick'      // quickSearch
'search:notes'      // searchNotes
'search:advanced'   // advancedSearch
'search:backlinks'  // findBacklinks
'search:suggestions' // getSuggestions
```

## Renderer Service

```typescript
// src/renderer/src/services/search-service.ts
searchService.quickSearch(query)
searchService.searchNotes(query, options)
searchService.advancedSearch(options)
searchService.getBacklinks(noteId)
```
