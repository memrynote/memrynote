# 16 - Stale Items Section

## Objective

Build the stale items warning section that highlights inbox items older than 7 days. This section encourages users to process neglected items and provides quick bulk actions to clear the backlog.

---

## Context

Stale items represent inbox items that have been sitting unprocessed for too long:
- Visual warning draws attention to neglected items
- Collapsible section to reduce noise
- Batch actions for quick cleanup
- "Review One by One" mode for focused processing

**Dependencies:**
- 01-foundation-types
- 04-compact-view (item rendering)
- 12-item-selection (bulk operations)

**Blocks:** 18-page-integration

---

## Specifications

From inbox-layouts.md:

```
7+ Days Old Items:

+----------------------------------------------------------------------+
|                                                                      |
|  [Regular inbox items...]                                            |
|                                                                      |
|  -------------------------------------------------------------------  |
|                                                                      |
|  [warning] Items older than 7 days (4)                               |
|                                                                      |
|  These items have been sitting in your inbox. Consider filing        |
|  or deleting them.                                                   |
|                                                                      |
|  +----------------------------------------------------------------+  |
|  |  [ ]  [link]  Old article from last month              12d ago |  |
|  |  [ ]  [note]  Random note                               8d ago |  |
|  |  [ ]  [image] Screenshot                                9d ago |  |
|  |  [ ]  [voice] Voice memo                               14d ago |  |
|  +----------------------------------------------------------------+  |
|                                                                      |
|              [File All to Unsorted]  [Review One by One]             |
|                                                                      |
+----------------------------------------------------------------------+

Design:
|- Collapsible section (expanded by default when items exist)
|- Warning yellow/amber styling
|- Batch actions: "File All to Unsorted" for quick cleanup
+-- "Review One by One" enters sequential review mode
```

---

## Implementation Guide

### File Location

Create: `src/renderer/src/components/inbox/stale-section.tsx`

### StaleSection Component

```tsx
// src/renderer/src/components/inbox/stale-section.tsx

import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight, FolderInput, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { TypeIcon } from './type-icon'
import type { InboxItem } from '@/types/inbox'
import { formatRelativeTime } from '@/lib/inbox-utils'

const STALE_THRESHOLD_DAYS = 7

interface StaleSectionProps {
  items: InboxItem[]
  selectedIds: Set<string>
  onSelect: (id: string, selected: boolean) => void
  onSelectAll: (ids: string[]) => void
  onFileAllToUnsorted: (ids: string[]) => void
  onReviewSequentially: (ids: string[]) => void
  onOpenItem: (id: string) => void
}

export function StaleSection({
  items,
  selectedIds,
  onSelect,
  onSelectAll,
  onFileAllToUnsorted,
  onReviewSequentially,
  onOpenItem,
}: StaleSectionProps): React.JSX.Element | null {
  const [isExpanded, setIsExpanded] = useState(true)

  // Filter stale items (older than 7 days)
  const staleItems = items.filter((item) => {
    const now = new Date()
    const itemAge = now.getTime() - item.createdAt.getTime()
    const daysOld = itemAge / (1000 * 60 * 60 * 24)
    return daysOld >= STALE_THRESHOLD_DAYS
  })

  // Don't render if no stale items
  if (staleItems.length === 0) return null

  const staleIds = staleItems.map((item) => item.id)
  const allStaleSelected = staleIds.every((id) => selectedIds.has(id))
  const someStaleSelected = staleIds.some((id) => selectedIds.has(id))

  const handleSelectAllStale = () => {
    if (allStaleSelected) {
      // Deselect all stale
      staleIds.forEach((id) => onSelect(id, false))
    } else {
      // Select all stale
      onSelectAll(staleIds)
    }
  }

  return (
    <div className="border-t">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Header */}
        <div className="px-4 py-3 bg-amber-50 dark:bg-amber-950/30">
          <CollapsibleTrigger className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2 flex-1">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <span className="font-medium text-amber-800 dark:text-amber-200">
                Items older than {STALE_THRESHOLD_DAYS} days
              </span>
              <span className="text-sm text-amber-600 dark:text-amber-400">
                ({staleItems.length})
              </span>
            </div>
          </CollapsibleTrigger>

          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 pl-6">
            These items have been sitting in your inbox. Consider filing or deleting them.
          </p>
        </div>

        {/* Content */}
        <CollapsibleContent>
          {/* Select All Checkbox */}
          <div className="px-4 py-2 border-b bg-muted/30">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={allStaleSelected}
                indeterminate={someStaleSelected && !allStaleSelected}
                onCheckedChange={handleSelectAllStale}
              />
              <span className="text-sm text-muted-foreground">
                {allStaleSelected ? 'Deselect all' : 'Select all stale items'}
              </span>
            </label>
          </div>

          {/* Stale Items List */}
          <div className="divide-y">
            {staleItems.map((item) => (
              <StaleItem
                key={item.id}
                item={item}
                isSelected={selectedIds.has(item.id)}
                onSelect={onSelect}
                onOpen={onOpenItem}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="px-4 py-3 bg-muted/30 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFileAllToUnsorted(staleIds)}
            >
              <FolderInput className="h-4 w-4 mr-2" />
              File All to Unsorted
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReviewSequentially(staleIds)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Review One by One
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// =============================================================================
// STALE ITEM COMPONENT
// =============================================================================

interface StaleItemProps {
  item: InboxItem
  isSelected: boolean
  onSelect: (id: string, selected: boolean) => void
  onOpen: (id: string) => void
}

function StaleItem({
  item,
  isSelected,
  onSelect,
  onOpen,
}: StaleItemProps): React.JSX.Element {
  const [isHovered, setIsHovered] = useState(false)

  // Calculate days old
  const now = new Date()
  const daysOld = Math.floor(
    (now.getTime() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2 transition-colors',
        'hover:bg-muted/50',
        isSelected && 'bg-accent/50'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={() => onOpen(item.id)}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onSelect(item.id, !!checked)}
      />

      {/* Type Icon */}
      <TypeIcon type={item.type} size="sm" variant="icon-only" />

      {/* Title */}
      <span className="flex-1 text-sm truncate">{item.title}</span>

      {/* Age indicator */}
      <span
        className={cn(
          'text-xs font-medium px-1.5 py-0.5 rounded',
          daysOld >= 14
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        )}
      >
        {daysOld}d ago
      </span>
    </div>
  )
}
```

### Integration with Main Inbox

```tsx
// In inbox page, render StaleSection after regular items

function InboxPage() {
  // ... other state and handlers

  return (
    <div className="flex flex-col h-full">
      <HeaderBar {...headerProps} />

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {/* Regular items view */}
        {currentView === 'compact' && <CompactView items={freshItems} {...viewProps} />}
        {currentView === 'medium' && <MediumView items={freshItems} {...viewProps} />}
        {currentView === 'expanded' && <ExpandedView items={freshItems} {...viewProps} />}

        {/* Stale items section */}
        <StaleSection
          items={allItems}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={(ids) => ids.forEach((id) => select(id))}
          onFileAllToUnsorted={handleFileToUnsorted}
          onReviewSequentially={handleSequentialReview}
          onOpenItem={handleOpenItem}
        />
      </div>

      {/* Bulk action bar */}
      <BulkActionBar {...bulkActionProps} />
    </div>
  )
}
```

---

## Props Interface

```typescript
interface StaleSectionProps {
  items: InboxItem[]                           // All inbox items (filter internally)
  selectedIds: Set<string>                     // Currently selected items
  onSelect: (id: string, selected: boolean) => void
  onSelectAll: (ids: string[]) => void         // Select multiple items
  onFileAllToUnsorted: (ids: string[]) => void // Quick file action
  onReviewSequentially: (ids: string[]) => void // Enter review mode
  onOpenItem: (id: string) => void             // Open single item
}
```

---

## Acceptance Criteria

- [ ] `stale-section.tsx` component created
- [ ] Section only renders when stale items exist
- [ ] Stale threshold is 7 days
- [ ] Section is collapsible (expanded by default)
- [ ] Warning styling with amber/yellow colors
- [ ] Shows count of stale items
- [ ] Items display with age badge (days old)
- [ ] Older items (14d+) have red age badge
- [ ] "Select all stale" checkbox works
- [ ] Individual item selection works
- [ ] "File All to Unsorted" triggers callback
- [ ] "Review One by One" triggers callback
- [ ] Double-click opens item preview
- [ ] Selected items show accent background
- [ ] `pnpm typecheck` passes

---

## Sequential Review Mode

When "Review One by One" is clicked, the app could enter a focused review mode:

```typescript
interface SequentialReviewState {
  isActive: boolean
  itemIds: string[]
  currentIndex: number
}

function handleSequentialReview(ids: string[]) {
  setReviewState({
    isActive: true,
    itemIds: ids,
    currentIndex: 0,
  })
  // Open first item in expanded/preview mode
  setCurrentView('expanded')
}

// Navigate between items
function nextReviewItem() {
  setReviewState((prev) => ({
    ...prev,
    currentIndex: Math.min(prev.currentIndex + 1, prev.itemIds.length - 1),
  }))
}

function previousReviewItem() {
  setReviewState((prev) => ({
    ...prev,
    currentIndex: Math.max(prev.currentIndex - 1, 0),
  }))
}
```

---

## Visual Design Notes

| Age | Badge Color | Urgency |
|-----|-------------|---------|
| 7-13 days | Amber/Yellow | Moderate |
| 14+ days | Red | High |

Section background uses subtle amber tint to draw attention without being alarming.

---

## Testing

```tsx
function StaleSectionTest() {
  const now = new Date()

  const mockItems: InboxItem[] = [
    {
      id: '1',
      title: 'Old article',
      type: 'link',
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000), // 12 days
      // ...
    },
    {
      id: '2',
      title: 'Random note',
      type: 'note',
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days
      // ...
    },
    {
      id: '3',
      title: 'Very old item',
      type: 'image',
      createdAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), // 21 days
      // ...
    },
  ]

  const [selected, setSelected] = useState<Set<string>>(new Set())

  return (
    <div className="max-w-2xl mx-auto py-8">
      <StaleSection
        items={mockItems}
        selectedIds={selected}
        onSelect={(id, checked) => {
          setSelected((prev) => {
            const next = new Set(prev)
            if (checked) next.add(id)
            else next.delete(id)
            return next
          })
        }}
        onSelectAll={(ids) => setSelected(new Set(ids))}
        onFileAllToUnsorted={(ids) => console.log('File to unsorted:', ids)}
        onReviewSequentially={(ids) => console.log('Review:', ids)}
        onOpenItem={(id) => console.log('Open:', id)}
      />
    </div>
  )
}
```
