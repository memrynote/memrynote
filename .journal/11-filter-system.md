# 11 - Filter System

## Objective

Build the progressive filter system with type filters, time range filters, and sort options. Filters are hidden by default and revealed when users engage, following the progressive disclosure principle.

---

## Context

The filter system enables focused inbox triage by allowing users to:
- Filter by content type (links, notes, images, etc.)
- Filter by time range (today, this week, older, stale)
- Sort by different criteria
- Combine multiple filters

**Dependencies:**
- 01-foundation-types (InboxFilterState, InboxContentType)
- 02-header-bar (integration point)
- 03-type-icon-system (type icons in filters)
- 10-search-component (works alongside search)

**Blocks:** 18-page-integration

---

## Specifications

From inbox-layouts.md:

```
DEFAULT (hidden filters):
+----------------------------------------------------------------------+
|  Inbox  o 24 items            [search]      [= Filters]   [View]     |
+----------------------------------------------------------------------+

FILTERS EXPANDED:
+----------------------------------------------------------------------+
|  Inbox  o 24 items            [search]      [= Filters v]  [View]    |
|                                                                      |
|  +----------------------------------------------------------------+  |
|  |                                                                |  |
|  |  TYPE                                                          |  |
|  |  [All] [Links] [Notes] [Images] [Voice] [Files]                |  |
|  |                                                                |  |
|  |  TIME                                                          |  |
|  |  [All] [Today] [This Week] [Older] [Stale 7d+]                 |  |
|  |                                                                |  |
|  |  SORT                                                          |  |
|  |  [Newest v]  o Newest  o Oldest  o Type                        |  |
|  |                                                                |  |
|  |                                            [Reset] [Apply]     |  |
|  |                                                                |  |
|  +----------------------------------------------------------------+  |
+----------------------------------------------------------------------+

ACTIVE FILTERS (badge indicator):
+----------------------------------------------------------------------+
|  Inbox  o 8 items             [search]      [= Filters .2]  [View]   |
|                                                                      |
|  Active: [Links x] [This Week x]                    [Clear All]      |
+----------------------------------------------------------------------+
```

---

## Implementation Guide

### File Locations

1. **Main component:** `src/renderer/src/components/inbox/filter-bar.tsx`
2. **Filter hook:** `src/renderer/src/lib/hooks/use-inbox-filters.ts`

### FilterBar Component

```tsx
// src/renderer/src/components/inbox/filter-bar.tsx

import { useState } from 'react'
import { SlidersHorizontal, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TypeIcon } from './type-icon'
import type {
  InboxContentType,
  InboxFilterState,
  InboxSortOption,
} from '@/types/inbox'
import { INBOX_TYPE_CONFIG } from '@/lib/inbox-type-config'

interface FilterBarProps {
  filters: InboxFilterState
  onFiltersChange: (filters: InboxFilterState) => void
  className?: string
}

const TIME_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'older', label: 'Older' },
  { value: 'stale', label: 'Stale (7d+)' },
] as const

const SORT_OPTIONS: { value: InboxSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'type', label: 'By Type' },
]

const ALL_TYPES: InboxContentType[] = [
  'link',
  'note',
  'image',
  'voice',
  'pdf',
  'webclip',
  'file',
  'video',
]

export function FilterBar({
  filters,
  onFiltersChange,
  className,
}: FilterBarProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  // Count active filters
  const activeFilterCount =
    (filters.types.length > 0 && filters.types.length < ALL_TYPES.length ? 1 : 0) +
    (filters.timeRange !== 'all' ? 1 : 0)

  const hasActiveFilters = activeFilterCount > 0

  const handleTypeToggle = (type: InboxContentType) => {
    setLocalFilters((prev) => {
      const newTypes = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type]
      return { ...prev, types: newTypes }
    })
  }

  const handleSelectAllTypes = () => {
    setLocalFilters((prev) => ({ ...prev, types: [] })) // Empty = all
  }

  const handleTimeRangeChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      timeRange: value as InboxFilterState['timeRange'],
    }))
  }

  const handleSortChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      sort: value as InboxSortOption,
    }))
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const handleReset = () => {
    const resetFilters: InboxFilterState = {
      types: [],
      timeRange: 'all',
      sort: 'newest',
      searchQuery: filters.searchQuery,
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const handleRemoveFilter = (filterType: 'types' | 'timeRange') => {
    const updated = {
      ...filters,
      [filterType]: filterType === 'types' ? [] : 'all',
    }
    onFiltersChange(updated)
    setLocalFilters(updated)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Filter Trigger Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-4" align="end">
          {/* Type Filters */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Type</h4>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={localFilters.types.length === 0 ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7"
                onClick={handleSelectAllTypes}
              >
                All
              </Button>
              {ALL_TYPES.map((type) => {
                const config = INBOX_TYPE_CONFIG[type]
                const isSelected =
                  localFilters.types.length === 0 ||
                  localFilters.types.includes(type)

                return (
                  <Button
                    key={type}
                    variant={
                      localFilters.types.includes(type) ? 'secondary' : 'ghost'
                    }
                    size="sm"
                    className="h-7 gap-1.5"
                    onClick={() => handleTypeToggle(type)}
                  >
                    <TypeIcon type={type} size="sm" variant="icon-only" />
                    <span className="capitalize">{config.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Time Range Filters */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Time</h4>
            <div className="flex flex-wrap gap-1.5">
              {TIME_RANGES.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={localFilters.timeRange === value ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7"
                  onClick={() => handleTimeRangeChange(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Sort</h4>
            <Select
              value={localFilters.sort}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button size="sm" onClick={handleApply}>
              <Check className="h-4 w-4 mr-1" />
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5">
          {filters.types.length > 0 && filters.types.length < ALL_TYPES.length && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {filters.types.length} type{filters.types.length > 1 ? 's' : ''}
              <button
                onClick={() => handleRemoveFilter('types')}
                className="ml-1 hover:bg-muted rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.timeRange !== 'all' && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {TIME_RANGES.find((t) => t.value === filters.timeRange)?.label}
              <button
                onClick={() => handleRemoveFilter('timeRange')}
                className="ml-1 hover:bg-muted rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={handleReset}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}
```

### Filter Hook

```tsx
// src/renderer/src/lib/hooks/use-inbox-filters.ts

import { useState, useMemo, useCallback } from 'react'
import type { InboxItem, InboxFilterState } from '@/types/inbox'

const STALE_DAYS = 7

const initialFilters: InboxFilterState = {
  types: [],
  timeRange: 'all',
  sort: 'newest',
  searchQuery: '',
}

export function useInboxFilters(items: InboxItem[]) {
  const [filters, setFilters] = useState<InboxFilterState>(initialFilters)

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items]

    // Filter by type
    if (filters.types.length > 0) {
      result = result.filter((item) => filters.types.includes(item.type))
    }

    // Filter by time range
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const staleThreshold = new Date(today.getTime() - STALE_DAYS * 24 * 60 * 60 * 1000)

    switch (filters.timeRange) {
      case 'today':
        result = result.filter((item) => item.createdAt >= today)
        break
      case 'week':
        result = result.filter(
          (item) => item.createdAt >= weekAgo && item.createdAt < today
        )
        break
      case 'older':
        result = result.filter((item) => item.createdAt < weekAgo)
        break
      case 'stale':
        result = result.filter((item) => item.createdAt < staleThreshold)
        break
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter((item) =>
        item.title.toLowerCase().includes(query)
      )
    }

    // Sort
    switch (filters.sort) {
      case 'newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case 'oldest':
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        break
      case 'type':
        result.sort((a, b) => a.type.localeCompare(b.type))
        break
    }

    return result
  }, [items, filters])

  const updateFilters = useCallback((newFilters: InboxFilterState) => {
    setFilters(newFilters)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.types.length > 0) count++
    if (filters.timeRange !== 'all') count++
    return count
  }, [filters])

  return {
    filters,
    setFilters: updateFilters,
    resetFilters,
    filteredItems: filteredAndSortedItems,
    activeFilterCount,
    totalCount: items.length,
    filteredCount: filteredAndSortedItems.length,
  }
}
```

---

## Props Interface

```typescript
interface FilterBarProps {
  filters: InboxFilterState
  onFiltersChange: (filters: InboxFilterState) => void
  className?: string
}

interface InboxFilterState {
  types: InboxContentType[]        // Empty = all types
  timeRange: 'all' | 'today' | 'week' | 'older' | 'stale'
  sort: 'newest' | 'oldest' | 'type'
  searchQuery: string
}
```

---

## Acceptance Criteria

- [ ] `filter-bar.tsx` component created
- [ ] Filter button shows badge with active filter count
- [ ] Popover opens with type, time, and sort sections
- [ ] Type buttons toggle correctly (multi-select)
- [ ] "All" button clears type selection
- [ ] Time range buttons work as single-select
- [ ] Sort dropdown changes sort order
- [ ] Apply button commits changes
- [ ] Reset button clears all filters
- [ ] Active filters show as removable pills
- [ ] "Clear All" removes all filters
- [ ] Filter hook correctly filters and sorts items
- [ ] Time range calculations are correct
- [ ] `pnpm typecheck` passes

---

## Time Range Definitions

| Range | Description |
|-------|-------------|
| All | No time filtering |
| Today | Created since midnight today |
| This Week | Created in last 7 days (not today) |
| Older | Created more than 7 days ago |
| Stale | Created more than 7 days ago (same as Older, emphasized) |

---

## Testing

```tsx
function FilterBarTest() {
  const [filters, setFilters] = useState<InboxFilterState>({
    types: [],
    timeRange: 'all',
    sort: 'newest',
    searchQuery: '',
  })

  return (
    <div className="p-8 space-y-4">
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      <pre className="bg-muted p-4 rounded">
        {JSON.stringify(filters, null, 2)}
      </pre>
    </div>
  )
}
```
