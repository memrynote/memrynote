# 12 - Item Selection System

## Objective

Implement the item selection system including checkbox logic, keyboard selection (Shift+click for range), select all/none, and bulk mode activation. This system manages the selection state used by bulk actions.

---

## Context

Selection is fundamental to bulk operations:
- Single item selection via checkbox
- Range selection with Shift+click
- Select all with Cmd/Ctrl+A
- Deselect all with Escape
- Automatic bulk mode when items selected

**Dependencies:**
- 01-foundation-types
- 04-compact-view (integrates selection)
- 05-medium-view-base (integrates selection)

**Blocks:** 13-bulk-action-bar, 17-keyboard-shortcuts

---

## Specifications

From inbox-layouts.md:

```
SELECTION STATES:

DEFAULT:
| [ ]  [link]  How to Build a Second Brain           2h ago  : |
      |                                                      |
      +-- checkbox hidden

HOVER:
| [x]  [link]  How to Build a Second Brain   [File] [...] [:] |
      |                                               |
      +-- checkbox visible               quick actions ------+

SELECTED:
| [x]  [link]  How to Build a Second Brain           2h ago  : |
  |
  +-- bg-accent/50, checkbox filled

Keyboard Selection:
- x: Toggle selection on focused item
- Cmd+A: Select all
- Cmd+Shift+A: Deselect all
- Shift+Click: Range select
```

---

## Implementation Guide

### File Location

Create: `src/renderer/src/lib/hooks/use-inbox-selection.ts`

### Selection Hook

```tsx
// src/renderer/src/lib/hooks/use-inbox-selection.ts

import { useState, useCallback, useMemo } from 'react'
import type { InboxItem } from '@/types/inbox'

interface UseInboxSelectionOptions {
  items: InboxItem[]
}

interface UseInboxSelectionReturn {
  selectedIds: Set<string>
  isSelected: (id: string) => boolean
  isBulkMode: boolean
  selectedCount: number

  // Selection actions
  select: (id: string) => void
  deselect: (id: string) => void
  toggle: (id: string) => void
  toggleWithShift: (id: string, shiftKey: boolean, currentIndex: number) => void

  // Bulk actions
  selectAll: () => void
  deselectAll: () => void
  selectByType: (type: string) => void

  // For range selection
  lastSelectedIndex: number | null
}

export function useInboxSelection({
  items,
}: UseInboxSelectionOptions): UseInboxSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const isBulkMode = selectedIds.size > 0

  const selectedCount = selectedIds.size

  const select = useCallback((id: string) => {
    setSelectedIds((prev) => new Set([...prev, id]))
    const index = items.findIndex((item) => item.id === id)
    if (index !== -1) setLastSelectedIndex(index)
  }, [items])

  const deselect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        const index = items.findIndex((item) => item.id === id)
        if (index !== -1) setLastSelectedIndex(index)
      }
      return next
    })
  }, [items])

  // Range selection with Shift+Click
  const toggleWithShift = useCallback(
    (id: string, shiftKey: boolean, currentIndex: number) => {
      if (shiftKey && lastSelectedIndex !== null) {
        // Range select
        const start = Math.min(lastSelectedIndex, currentIndex)
        const end = Math.max(lastSelectedIndex, currentIndex)
        const rangeIds = items.slice(start, end + 1).map((item) => item.id)

        setSelectedIds((prev) => {
          const next = new Set(prev)
          rangeIds.forEach((rangeId) => next.add(rangeId))
          return next
        })
      } else {
        toggle(id)
      }
      setLastSelectedIndex(currentIndex)
    },
    [lastSelectedIndex, items, toggle]
  )

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((item) => item.id)))
  }, [items])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
    setLastSelectedIndex(null)
  }, [])

  const selectByType = useCallback(
    (type: string) => {
      const typeIds = items
        .filter((item) => item.type === type)
        .map((item) => item.id)
      setSelectedIds(new Set(typeIds))
    },
    [items]
  )

  return {
    selectedIds,
    isSelected,
    isBulkMode,
    selectedCount,
    select,
    deselect,
    toggle,
    toggleWithShift,
    selectAll,
    deselectAll,
    selectByType,
    lastSelectedIndex,
  }
}
```

### Integration with Item Components

Update `compact-item.tsx` to use selection:

```tsx
// In compact-item.tsx

interface CompactItemProps {
  item: InboxItem
  index: number                    // Add index for range selection
  isSelected: boolean
  isFocused: boolean
  isBulkMode: boolean
  onSelect: (id: string, selected: boolean, shiftKey: boolean, index: number) => void
  // ... other props
}

export function CompactItem({
  item,
  index,
  isSelected,
  // ...
  onSelect,
}: CompactItemProps) {
  const handleCheckboxChange = (checked: boolean, event: React.MouseEvent) => {
    onSelect(item.id, checked, event.shiftKey, index)
  }

  const handleClick = (event: React.MouseEvent) => {
    if (event.shiftKey || isBulkMode) {
      event.preventDefault()
      onSelect(item.id, !isSelected, event.shiftKey, index)
    }
  }

  return (
    <div
      onClick={handleClick}
      // ...
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) =>
          onSelect(item.id, !!checked, false, index)
        }
        onClick={(e) => e.stopPropagation()}
      />
      {/* ... */}
    </div>
  )
}
```

### Keyboard Event Handler

```tsx
// In inbox page component

import { useHotkeys } from 'react-hotkeys-hook'

function InboxPage() {
  const { selectAll, deselectAll, toggle } = useInboxSelection({ items })
  const [focusedId, setFocusedId] = useState<string | null>(null)

  // Select all: Cmd+A
  useHotkeys('mod+a', (e) => {
    e.preventDefault()
    selectAll()
  }, [selectAll])

  // Deselect all: Cmd+Shift+A or Escape
  useHotkeys('mod+shift+a', (e) => {
    e.preventDefault()
    deselectAll()
  }, [deselectAll])

  useHotkeys('escape', () => {
    deselectAll()
  }, [deselectAll])

  // Toggle selection on focused item: x
  useHotkeys('x', () => {
    if (focusedId) {
      toggle(focusedId)
    }
  }, [focusedId, toggle])

  // ...
}
```

---

## Selection State Interface

```typescript
interface SelectionState {
  selectedIds: Set<string>         // Set of selected item IDs
  lastSelectedIndex: number | null // For range selection
}

// Actions
type SelectionAction =
  | { type: 'SELECT'; id: string; index: number }
  | { type: 'DESELECT'; id: string }
  | { type: 'TOGGLE'; id: string; index: number }
  | { type: 'RANGE_SELECT'; startIndex: number; endIndex: number }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
```

---

## Acceptance Criteria

- [ ] `use-inbox-selection.ts` hook created
- [ ] Single item selection works via checkbox
- [ ] Toggle selection works with `x` key
- [ ] Range selection works with Shift+click
- [ ] Select all works with Cmd+A
- [ ] Deselect all works with Cmd+Shift+A and Escape
- [ ] `isBulkMode` becomes true when any item selected
- [ ] Selection count is accurate
- [ ] Checkbox visibility controlled by hover/bulk/selected state
- [ ] Selected items have visual indicator (bg-accent)
- [ ] Range selection maintains correct order
- [ ] `pnpm typecheck` passes

---

## Visual Feedback

| State | Checkbox | Background | Border |
|-------|----------|------------|--------|
| Default | Hidden | None | None |
| Hover | Visible (unchecked) | bg-accent/30 | None |
| Selected | Visible (checked) | bg-accent/50 | None |
| Bulk Mode | Always visible | Varies | None |

---

## Selection Persistence

For advanced use cases, selection could be persisted to handle:
- Page refresh during bulk operation
- Undo after bulk action

```tsx
// Optional: Persist selection to session storage
const SELECTION_KEY = 'memry-inbox-selection'

function persistSelection(ids: Set<string>) {
  sessionStorage.setItem(SELECTION_KEY, JSON.stringify([...ids]))
}

function loadSelection(): Set<string> {
  const saved = sessionStorage.getItem(SELECTION_KEY)
  return saved ? new Set(JSON.parse(saved)) : new Set()
}
```

---

## Testing

```tsx
function SelectionTest() {
  const mockItems = [
    { id: '1', title: 'Item 1', type: 'link' },
    { id: '2', title: 'Item 2', type: 'note' },
    { id: '3', title: 'Item 3', type: 'image' },
    { id: '4', title: 'Item 4', type: 'link' },
    { id: '5', title: 'Item 5', type: 'note' },
  ] as InboxItem[]

  const {
    selectedIds,
    isBulkMode,
    toggle,
    selectAll,
    deselectAll,
  } = useInboxSelection({ items: mockItems })

  return (
    <div className="p-8 space-y-4">
      <div className="flex gap-2">
        <Button onClick={selectAll}>Select All</Button>
        <Button onClick={deselectAll}>Deselect All</Button>
      </div>

      <p>Selected: {selectedIds.size} | Bulk Mode: {isBulkMode ? 'Yes' : 'No'}</p>

      <div className="space-y-2">
        {mockItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              'p-2 rounded flex items-center gap-2',
              selectedIds.has(item.id) && 'bg-accent'
            )}
          >
            <Checkbox
              checked={selectedIds.has(item.id)}
              onCheckedChange={() => toggle(item.id)}
            />
            <span>{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Edge Cases

1. **Empty list**: No items to select
2. **Single item**: Range select with shift does nothing special
3. **Filtered list**: Selection applies to visible items only
4. **Item removal**: Removing selected item updates selection
5. **View change**: Selection persists across view modes
