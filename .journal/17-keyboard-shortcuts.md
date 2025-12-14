# 17 - Keyboard Shortcuts

## Objective

Implement the complete keyboard navigation and shortcut system for the inbox. This includes item navigation, selection shortcuts, action shortcuts, view switching, and a help modal showing all available shortcuts.

---

## Context

Keyboard shortcuts are essential for power users who want rapid inbox processing:
- Arrow navigation between items
- Quick selection with `x`
- Action shortcuts (f, t, s, Del)
- View switching with `v`
- Global shortcuts (/, ?)

**Dependencies:**
- All view components (04, 05, 07)
- 08-view-switcher
- 10-search-component
- 12-item-selection
- 13-bulk-action-bar

**Blocks:** 18-page-integration

---

## Specifications

From inbox-layouts.md:

### Quick Reference (Modal)

```
+----------------------------------------------------------------------+
|                                                                      |
|                      Keyboard Shortcuts                              |
|                                                                      |
|  -------------------------------------------------------------------  |
|                                                                      |
|  NAVIGATION                                                          |
|  up/down or j/k        Move between items                            |
|  Enter or Space        Open preview panel                            |
|  Escape                Close panel / Deselect all                    |
|                                                                      |
|  SELECTION                                                           |
|  x                     Toggle selection                              |
|  Cmd+A                 Select all                                    |
|  Cmd+Shift+A           Deselect all                                  |
|                                                                      |
|  ACTIONS                                                             |
|  f                     File selected item(s)                         |
|  t                     Add tags                                      |
|  Delete/Backspace      Delete selected item(s)                       |
|  o                     Open original (links)                         |
|  s                     Snooze selected item(s)                       |
|                                                                      |
|  VIEW                                                                |
|  v                     Toggle view mode (List/Card/Expanded)         |
|  r                     Refresh inbox                                 |
|  /                     Focus search                                  |
|  ?                     Show this help                                |
|                                                                      |
|  -------------------------------------------------------------------  |
|                                                                      |
|                              [Close]                                 |
|                                                                      |
+----------------------------------------------------------------------+
```

### Inline Hints

```
On item hover in list view:
+----------------------------------------------------------------------+
|                                                                      |
|  [ ]  [link]  How to Build a Second Brain    [f] File  [Enter] >    |
|        fortelabs.com . 2 hours ago                                   |
|                                                                      |
+----------------------------------------------------------------------+

Hint badges appear on hover, showing primary shortcuts.
```

---

## Implementation Guide

### File Locations

1. **Keyboard help modal:** `src/renderer/src/components/inbox/keyboard-help.tsx`
2. **Keyboard hook:** `src/renderer/src/lib/hooks/use-keyboard-nav.ts`
3. **Shortcut definitions:** `src/renderer/src/lib/inbox-shortcuts.ts`

### Install Dependency

```bash
pnpm add react-hotkeys-hook
```

### Shortcut Definitions

```typescript
// src/renderer/src/lib/inbox-shortcuts.ts

export interface ShortcutDefinition {
  key: string
  label: string
  description: string
  category: 'navigation' | 'selection' | 'actions' | 'view'
}

export const INBOX_SHORTCUTS: ShortcutDefinition[] = [
  // Navigation
  { key: 'up', label: 'Up / k', description: 'Move to previous item', category: 'navigation' },
  { key: 'down', label: 'Down / j', description: 'Move to next item', category: 'navigation' },
  { key: 'enter', label: 'Enter / Space', description: 'Open preview panel', category: 'navigation' },
  { key: 'escape', label: 'Escape', description: 'Close panel / Deselect all', category: 'navigation' },

  // Selection
  { key: 'x', label: 'x', description: 'Toggle selection', category: 'selection' },
  { key: 'mod+a', label: 'Cmd+A', description: 'Select all', category: 'selection' },
  { key: 'mod+shift+a', label: 'Cmd+Shift+A', description: 'Deselect all', category: 'selection' },

  // Actions
  { key: 'f', label: 'f', description: 'File selected item(s)', category: 'actions' },
  { key: 't', label: 't', description: 'Add tags', category: 'actions' },
  { key: 'delete', label: 'Delete', description: 'Delete selected item(s)', category: 'actions' },
  { key: 'o', label: 'o', description: 'Open original (links)', category: 'actions' },
  { key: 's', label: 's', description: 'Snooze selected item(s)', category: 'actions' },

  // View
  { key: 'v', label: 'v', description: 'Cycle view mode', category: 'view' },
  { key: 'r', label: 'r', description: 'Refresh inbox', category: 'view' },
  { key: '/', label: '/', description: 'Focus search', category: 'view' },
  { key: '?', label: '?', description: 'Show keyboard shortcuts', category: 'view' },
]

export const SHORTCUT_CATEGORIES = [
  { id: 'navigation', label: 'Navigation' },
  { id: 'selection', label: 'Selection' },
  { id: 'actions', label: 'Actions' },
  { id: 'view', label: 'View' },
] as const
```

### Keyboard Navigation Hook

```tsx
// src/renderer/src/lib/hooks/use-keyboard-nav.ts

import { useState, useCallback, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import type { InboxItem, InboxViewMode } from '@/types/inbox'

interface UseKeyboardNavOptions {
  items: InboxItem[]
  selectedIds: Set<string>
  currentView: InboxViewMode

  // Selection actions
  selectItem: (id: string) => void
  deselectItem: (id: string) => void
  toggleItem: (id: string) => void
  selectAll: () => void
  deselectAll: () => void

  // Item actions
  onFile: (ids: string[]) => void
  onTag: (ids: string[]) => void
  onDelete: (ids: string[]) => void
  onSnooze: (ids: string[]) => void
  onOpenOriginal: (id: string) => void
  onOpenPreview: (id: string) => void

  // View actions
  onViewChange: (view: InboxViewMode) => void
  onRefresh: () => void
  onFocusSearch: () => void
  onShowHelp: () => void
}

export function useKeyboardNav({
  items,
  selectedIds,
  currentView,
  selectItem,
  deselectItem,
  toggleItem,
  selectAll,
  deselectAll,
  onFile,
  onTag,
  onDelete,
  onSnooze,
  onOpenOriginal,
  onOpenPreview,
  onViewChange,
  onRefresh,
  onFocusSearch,
  onShowHelp,
}: UseKeyboardNavOptions) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)

  const focusedId = focusedIndex >= 0 && focusedIndex < items.length
    ? items[focusedIndex].id
    : null

  // Get selected items or focused item for actions
  const getTargetIds = useCallback(() => {
    if (selectedIds.size > 0) {
      return Array.from(selectedIds)
    }
    if (focusedId) {
      return [focusedId]
    }
    return []
  }, [selectedIds, focusedId])

  // Navigation: Up / k
  useHotkeys(['up', 'k'], (e) => {
    e.preventDefault()
    setFocusedIndex((prev) => Math.max(0, prev - 1))
  }, { enabled: items.length > 0 })

  // Navigation: Down / j
  useHotkeys(['down', 'j'], (e) => {
    e.preventDefault()
    setFocusedIndex((prev) =>
      prev < items.length - 1 ? prev + 1 : prev
    )
  }, { enabled: items.length > 0 })

  // Navigation: Enter / Space - Open preview
  useHotkeys(['enter', 'space'], (e) => {
    e.preventDefault()
    if (focusedId) {
      onOpenPreview(focusedId)
    }
  }, { enabled: !!focusedId })

  // Navigation: Escape - Close/Deselect
  useHotkeys('escape', () => {
    if (selectedIds.size > 0) {
      deselectAll()
    }
    setFocusedIndex(-1)
  })

  // Selection: x - Toggle
  useHotkeys('x', () => {
    if (focusedId) {
      toggleItem(focusedId)
    }
  }, { enabled: !!focusedId })

  // Selection: Cmd+A - Select all
  useHotkeys('mod+a', (e) => {
    e.preventDefault()
    selectAll()
  })

  // Selection: Cmd+Shift+A - Deselect all
  useHotkeys('mod+shift+a', (e) => {
    e.preventDefault()
    deselectAll()
  })

  // Actions: f - File
  useHotkeys('f', () => {
    const ids = getTargetIds()
    if (ids.length > 0) {
      onFile(ids)
    }
  })

  // Actions: t - Tag
  useHotkeys('t', () => {
    const ids = getTargetIds()
    if (ids.length > 0) {
      onTag(ids)
    }
  })

  // Actions: Delete/Backspace - Delete
  useHotkeys(['delete', 'backspace'], (e) => {
    e.preventDefault()
    const ids = getTargetIds()
    if (ids.length > 0) {
      onDelete(ids)
    }
  })

  // Actions: s - Snooze
  useHotkeys('s', () => {
    const ids = getTargetIds()
    if (ids.length > 0) {
      onSnooze(ids)
    }
  })

  // Actions: o - Open original
  useHotkeys('o', () => {
    if (focusedId) {
      onOpenOriginal(focusedId)
    }
  }, { enabled: !!focusedId })

  // View: v - Cycle view mode
  useHotkeys('v', () => {
    const views: InboxViewMode[] = ['compact', 'medium', 'expanded']
    const currentIndex = views.indexOf(currentView)
    const nextIndex = (currentIndex + 1) % views.length
    onViewChange(views[nextIndex])
  })

  // View: r - Refresh
  useHotkeys('r', () => {
    onRefresh()
  })

  // View: / - Focus search
  useHotkeys('/', (e) => {
    e.preventDefault()
    onFocusSearch()
  })

  // View: ? - Show help
  useHotkeys('shift+/', () => {
    onShowHelp()
  })

  // Reset focus when items change
  useEffect(() => {
    if (focusedIndex >= items.length) {
      setFocusedIndex(items.length - 1)
    }
  }, [items.length, focusedIndex])

  return {
    focusedIndex,
    focusedId,
    setFocusedIndex,
  }
}
```

### Keyboard Help Modal

```tsx
// src/renderer/src/components/inbox/keyboard-help.tsx

import { Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { INBOX_SHORTCUTS, SHORTCUT_CATEGORIES } from '@/lib/inbox-shortcuts'

interface KeyboardHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardHelp({
  isOpen,
  onClose,
}: KeyboardHelpProps): React.JSX.Element {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {SHORTCUT_CATEGORIES.map(({ id, label }) => (
            <div key={id}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                {label}
              </h3>
              <div className="space-y-2">
                {INBOX_SHORTCUTS.filter((s) => s.category === id).map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded font-mono">
                      {shortcut.label}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Inline Shortcut Hints Component

```tsx
// src/renderer/src/components/inbox/shortcut-hints.tsx

import { cn } from '@/lib/utils'

interface ShortcutHintsProps {
  shortcuts: { key: string; label: string }[]
  className?: string
}

export function ShortcutHints({
  shortcuts,
  className,
}: ShortcutHintsProps): React.JSX.Element {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {shortcuts.map(({ key, label }) => (
        <span key={key} className="flex items-center gap-1 text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
            {key}
          </kbd>
          <span>{label}</span>
        </span>
      ))}
    </div>
  )
}

// Usage in item hover state:
// <ShortcutHints shortcuts={[
//   { key: 'f', label: 'File' },
//   { key: 'Enter', label: 'Open' },
// ]} />
```

---

## Integration Example

```tsx
// In inbox page

function InboxPage() {
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { focusedIndex, focusedId } = useKeyboardNav({
    items: filteredItems,
    selectedIds,
    currentView,
    selectItem: select,
    deselectItem: deselect,
    toggleItem: toggle,
    selectAll,
    deselectAll,
    onFile: (ids) => openFilingPanel(ids),
    onTag: (ids) => openTagPanel(ids),
    onDelete: (ids) => confirmDelete(ids),
    onSnooze: (ids) => openSnoozeMenu(ids),
    onOpenOriginal: (id) => {
      const item = items.find((i) => i.id === id)
      if (item && 'url' in item) {
        window.open(item.url, '_blank')
      }
    },
    onOpenPreview: (id) => setPreviewItemId(id),
    onViewChange: setCurrentView,
    onRefresh: () => refetch(),
    onFocusSearch: () => searchInputRef.current?.focus(),
    onShowHelp: () => setShowKeyboardHelp(true),
  })

  return (
    <>
      {/* Page content */}

      <KeyboardHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />
    </>
  )
}
```

---

## Acceptance Criteria

- [ ] `react-hotkeys-hook` installed
- [ ] `inbox-shortcuts.ts` definitions created
- [ ] `use-keyboard-nav.ts` hook created
- [ ] `keyboard-help.tsx` modal created
- [ ] `shortcut-hints.tsx` component created
- [ ] Up/Down and j/k navigate items
- [ ] Enter/Space opens preview
- [ ] Escape deselects and clears focus
- [ ] x toggles selection on focused item
- [ ] Cmd+A selects all, Cmd+Shift+A deselects
- [ ] f opens filing panel
- [ ] t opens tag panel
- [ ] Delete/Backspace deletes
- [ ] s opens snooze menu
- [ ] o opens original URL
- [ ] v cycles view modes
- [ ] r refreshes inbox
- [ ] / focuses search
- [ ] ? shows help modal
- [ ] Focused item has visible indicator
- [ ] Shortcuts work with both selected and focused items
- [ ] `pnpm typecheck` passes

---

## Visual Focus Indicator

```css
/* Add to item components */
.inbox-item-focused {
  @apply ring-2 ring-primary ring-inset;
}
```

---

## Testing

```tsx
function KeyboardNavTest() {
  const [log, setLog] = useState<string[]>([])

  const addLog = (message: string) => {
    setLog((prev) => [...prev.slice(-9), message])
  }

  // ... setup useKeyboardNav with logging callbacks

  return (
    <div className="p-8 space-y-4">
      <div className="h-64 overflow-auto border rounded p-2">
        {log.map((entry, i) => (
          <div key={i} className="text-sm font-mono">{entry}</div>
        ))}
      </div>
      <p className="text-muted-foreground">
        Press keyboard shortcuts to see them logged
      </p>
    </div>
  )
}
```
