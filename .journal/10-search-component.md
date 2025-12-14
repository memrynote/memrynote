# 10 - Search Component

## Objective

Build the expandable search input component for filtering inbox items. The search starts as a compact icon button, expands to full width on focus, shows recent searches, and highlights matches in results.

---

## Context

Search is a key productivity feature that allows users to:
- Quickly find specific items
- Filter by title, content, domain, etc.
- Access recent search history
- Clear filters easily

**Dependencies:**
- 01-foundation-types (InboxFilterState)
- 02-header-bar (integration point)

**Blocks:** 11-filter-system, 18-page-integration

---

## Specifications

From inbox-layouts.md:

```
Search Bar (Expanded State):
+----------------------------------------------------------------------+
|                                                                      |
|  +----------------------------------------------------------------+  |
|  | [search icon]  Search inbox...                              X  |  |
|  +----------------------------------------------------------------+  |
|                                                                      |
|  Recent searches:                                                    |
|  . "project alpha"                                                   |
|  . "meeting notes"                                                   |
|                                                                      |
+----------------------------------------------------------------------+

With Results:
+----------------------------------------------------------------------+
|                                                                      |
|  +----------------------------------------------------------------+  |
|  | [search icon]  project alpha                                X  |  |
|  +----------------------------------------------------------------+  |
|                                                                      |
|  3 results for "project alpha"                              [Clear]  |
+----------------------------------------------------------------------+
```

### Behavior

1. **Collapsed**: Shows as icon button in header
2. **Expanded**: Full-width input with clear button
3. **With Query**: Shows result count and clear option
4. **Dropdown**: Shows recent searches when focused and empty

---

## Implementation Guide

### File Location

Create: `src/renderer/src/components/inbox/search-input.tsx`

### SearchInput Component

```tsx
// src/renderer/src/components/inbox/search-input.tsx

import { useState, useRef, useEffect } from 'react'
import { Search, X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  resultCount?: number
  recentSearches?: string[]
  onSelectRecent?: (query: string) => void
  onClearRecent?: () => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  resultCount,
  recentSearches = [],
  onSelectRecent,
  onClearRecent,
  placeholder = 'Search inbox...',
  className,
}: SearchInputProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showRecent, setShowRecent] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-expand if there's a value
  useEffect(() => {
    if (value) {
      setIsExpanded(true)
    }
  }, [value])

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  const handleExpand = () => {
    setIsExpanded(true)
    setShowRecent(true)
  }

  const handleCollapse = () => {
    if (!value) {
      setIsExpanded(false)
    }
    setShowRecent(false)
  }

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  const handleSelectRecent = (query: string) => {
    onChange(query)
    onSelectRecent?.(query)
    setShowRecent(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (value) {
        handleClear()
      } else {
        handleCollapse()
      }
    }
  }

  // Collapsed state: just an icon button
  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleExpand}
        className={className}
        aria-label="Open search"
      >
        <Search className="h-4 w-4" />
      </Button>
    )
  }

  // Expanded state
  return (
    <div className={cn('relative', className)}>
      <Popover open={showRecent && !value && recentSearches.length > 0}>
        <PopoverTrigger asChild>
          <div className="relative">
            {/* Search Icon */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            {/* Input */}
            <Input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setShowRecent(true)}
              onBlur={() => setTimeout(handleCollapse, 200)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="pl-9 pr-9 w-[250px]"
              aria-label="Search inbox"
            />

            {/* Clear Button */}
            {value && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </PopoverTrigger>

        {/* Recent Searches Dropdown */}
        <PopoverContent
          className="w-[250px] p-2"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Recent searches
            </span>
            {onClearRecent && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={onClearRecent}
              >
                Clear
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {recentSearches.map((query, index) => (
              <button
                key={index}
                onClick={() => handleSelectRecent(query)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent text-left"
              >
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">{query}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Result Count (shown below when searching) */}
      {value && resultCount !== undefined && (
        <div className="absolute top-full left-0 mt-1 text-xs text-muted-foreground">
          {resultCount === 0 ? (
            <span>No results for "{value}"</span>
          ) : (
            <span>
              {resultCount} result{resultCount !== 1 ? 's' : ''} for "{value}"
            </span>
          )}
        </div>
      )}
    </div>
  )
}
```

### Search Hook for State Management

```tsx
// src/renderer/src/lib/hooks/use-inbox-search.ts

import { useState, useCallback, useMemo } from 'react'
import type { InboxItem } from '@/types/inbox'

const MAX_RECENT_SEARCHES = 5
const STORAGE_KEY = 'memry-inbox-recent-searches'

export function useInboxSearch(items: InboxItem[]) {
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items

    const lowerQuery = query.toLowerCase()
    return items.filter((item) => {
      // Search in title
      if (item.title.toLowerCase().includes(lowerQuery)) return true

      // Search in type-specific fields
      switch (item.type) {
        case 'link':
          return (
            item.domain.toLowerCase().includes(lowerQuery) ||
            item.excerpt?.toLowerCase().includes(lowerQuery)
          )
        case 'note':
          return item.content.toLowerCase().includes(lowerQuery)
        case 'voice':
          return item.transcription?.toLowerCase().includes(lowerQuery)
        case 'webclip':
          return (
            item.sourceDomain.toLowerCase().includes(lowerQuery) ||
            item.highlights.some((h) => h.toLowerCase().includes(lowerQuery))
          )
        case 'pdf':
          return item.excerpt?.toLowerCase().includes(lowerQuery)
        default:
          return false
      }
    })
  }, [items, query])

  // Add to recent searches
  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery)

    // Add to recent if it's a meaningful search
    if (newQuery.trim().length >= 2) {
      setRecentSearches((prev) => {
        const updated = [
          newQuery,
          ...prev.filter((q) => q !== newQuery),
        ].slice(0, MAX_RECENT_SEARCHES)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    }
  }, [])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
  }, [])

  return {
    query,
    setQuery: handleSearch,
    filteredItems,
    resultCount: query ? filteredItems.length : undefined,
    recentSearches,
    clearRecentSearches,
    clearSearch,
  }
}
```

---

## Integration with Header Bar

```tsx
// In header-bar.tsx

import { SearchInput } from './search-input'

// Replace the search button placeholder:
<SearchInput
  value={searchQuery}
  onChange={onSearchChange}
  resultCount={resultCount}
  recentSearches={recentSearches}
  onSelectRecent={onSelectRecent}
  onClearRecent={onClearRecent}
/>
```

---

## Props Interface

```typescript
interface SearchInputProps {
  value: string                    // Current search query
  onChange: (value: string) => void // Query change handler
  resultCount?: number             // Number of matching results
  recentSearches?: string[]        // Recent search history
  onSelectRecent?: (query: string) => void // When recent search selected
  onClearRecent?: () => void       // Clear recent searches
  placeholder?: string             // Input placeholder
  className?: string               // Additional CSS
}
```

---

## Acceptance Criteria

- [ ] `search-input.tsx` component created
- [ ] Collapsed state shows search icon button
- [ ] Clicking icon expands to full input
- [ ] Input shows search icon on left
- [ ] Clear button appears when there's a value
- [ ] Pressing Escape clears input or collapses
- [ ] Recent searches dropdown shows when focused and empty
- [ ] Clicking recent search fills the input
- [ ] Result count displays below when searching
- [ ] "No results" message for zero matches
- [ ] Recent searches persist to localStorage
- [ ] Search hook filters items correctly
- [ ] `pnpm typecheck` passes

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search (global, implemented in prompt 17) |
| `Escape` | Clear search or collapse |
| `Enter` | Submit search (adds to recent) |
| `Arrow Down` | Navigate recent searches |

---

## Search Matching

The search matches against:
- Item title (all types)
- Domain (link, webclip)
- Content excerpt (note, pdf)
- Transcription (voice)
- Highlights (webclip)

Matching is case-insensitive substring match.

---

## Testing

```tsx
function SearchInputTest() {
  const [query, setQuery] = useState('')
  const [recent] = useState(['project alpha', 'meeting notes', 'design'])

  return (
    <div className="p-8 space-y-4">
      <SearchInput
        value={query}
        onChange={setQuery}
        resultCount={query ? 5 : undefined}
        recentSearches={recent}
        onSelectRecent={(q) => setQuery(q)}
      />
      <p>Current query: "{query}"</p>
    </div>
  )
}
```
