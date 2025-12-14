# 13 - Bulk Action Bar

## Objective

Build the floating bulk action bar that appears when items are selected. This bar provides quick actions (File, Tag, Snooze, Delete) for multiple items and shows AI clustering suggestions for similar items.

---

## Context

The bulk action bar enables efficient batch processing:
- Appears at bottom when items are selected
- Shows selection count
- Provides primary actions for bulk operations
- Offers AI suggestions for related items
- Keyboard hints for power users

**Dependencies:**
- 01-foundation-types
- 12-item-selection (selection state)

**Blocks:** 14-snooze-feature, 15-filing-panel

---

## Specifications

From inbox-layouts.md:

```
Floating Bar (When Items Selected):

+----------------------------------------------------------------------+
|                                                                      |
|  [Inbox content above...]                                            |
|                                                                      |
+----------------------------------------------------------------------+
|                                                                      |
|  +----------------------------------------------------------------+  |
|  |                                                                |  |
|  |   [x] 5 selected            [File] [Tag] [Snooze] [Delete]    |  |
|  |                                                                |  |
|  |   AI: 3 similar items -- "PKM articles"       [+ Add to v]    |  |
|  |                                                                |  |
|  +----------------------------------------------------------------+  |
|                                                                      |
+----------------------------------------------------------------------+

Bar Features:
|- Selection count with deselect option
|- Primary actions: File, Tag, Snooze, Delete
|- AI clustering suggestion (when detected)
|   +-- "3 similar items -- 'PKM articles' [+ Add to selection]"
+-- Keyboard hints: f=file, t=tag, s=snooze, Del=delete
```

### AI Cluster Suggestion

```
When selection includes items AI detects as related:

+----------------------------------------------------------------------+
|                                                                      |
|   [x] 2 selected                                                     |
|                                                                      |
|   +-------------------------------------------------------------+    |
|   |  AI detected 3 more similar items                           |    |
|   |                                                             |    |
|   |  "Articles about Personal Knowledge Management"             |    |
|   |                                                             |    |
|   |  . How to Build a Second Brain                              |    |
|   |  . The Zettelkasten Method                                  |    |
|   |  . Linking Your Thinking                                    |    |
|   |                                                             |    |
|   |                      [Add All to Selection]  [Dismiss]      |    |
|   +-------------------------------------------------------------+    |
|                                                                      |
|   [File All] [Tag All] [Delete All]                                  |
|                                                                      |
+----------------------------------------------------------------------+
```

---

## Implementation Guide

### File Location

Create: `src/renderer/src/components/inbox/bulk-action-bar.tsx`

### BulkActionBar Component

```tsx
// src/renderer/src/components/inbox/bulk-action-bar.tsx

import { useState } from 'react'
import {
  X,
  FolderInput,
  Tag,
  Clock,
  Trash2,
  Sparkles,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { InboxItem } from '@/types/inbox'

interface AIClusterSuggestion {
  label: string
  itemIds: string[]
  items: { id: string; title: string }[]
}

interface BulkActionBarProps {
  selectedCount: number
  selectedIds: Set<string>
  aiSuggestion?: AIClusterSuggestion
  onDeselectAll: () => void
  onFile: () => void
  onTag: () => void
  onSnooze: () => void
  onDelete: () => void
  onAddSuggestedToSelection: (ids: string[]) => void
  onDismissSuggestion: () => void
}

export function BulkActionBar({
  selectedCount,
  selectedIds,
  aiSuggestion,
  onDeselectAll,
  onFile,
  onTag,
  onSnooze,
  onDelete,
  onAddSuggestedToSelection,
  onDismissSuggestion,
}: BulkActionBarProps): React.JSX.Element | null {
  const [showSuggestion, setShowSuggestion] = useState(true)

  // Don't render if nothing selected
  if (selectedCount === 0) return null

  const handleDismissSuggestion = () => {
    setShowSuggestion(false)
    onDismissSuggestion()
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          {/* AI Suggestion Section */}
          {aiSuggestion && showSuggestion && (
            <Collapsible defaultOpen className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  AI detected {aiSuggestion.items.length} more similar items
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={handleDismissSuggestion}
                >
                  Dismiss
                </Button>
              </div>

              <CollapsibleContent>
                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    "{aiSuggestion.label}"
                  </p>
                  <ul className="space-y-1">
                    {aiSuggestion.items.slice(0, 3).map((item) => (
                      <li
                        key={item.id}
                        className="text-sm flex items-center gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <span className="truncate">{item.title}</span>
                      </li>
                    ))}
                    {aiSuggestion.items.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        + {aiSuggestion.items.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => onAddSuggestedToSelection(aiSuggestion.itemIds)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add All to Selection
                </Button>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Main Action Bar */}
          <div className="flex items-center gap-4">
            {/* Selection Count */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={onDeselectAll}
              >
                <X className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {selectedCount} selected
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-border" />

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={onFile}
                className="gap-2"
              >
                <FolderInput className="h-4 w-4" />
                File
                <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-background rounded">
                  f
                </kbd>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={onTag}
                className="gap-2"
              >
                <Tag className="h-4 w-4" />
                Tag
                <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-background rounded">
                  t
                </kbd>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={onSnooze}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Snooze
                <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-background rounded">
                  s
                </kbd>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={onDelete}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
                <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-background rounded">
                  Del
                </kbd>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Compact Version (Alternative)

For narrower screens or minimal UI preference:

```tsx
// src/renderer/src/components/inbox/bulk-action-bar-compact.tsx

export function BulkActionBarCompact({
  selectedCount,
  onDeselectAll,
  onFile,
  onTag,
  onSnooze,
  onDelete,
}: Omit<BulkActionBarProps, 'aiSuggestion' | 'onAddSuggestedToSelection' | 'onDismissSuggestion'>) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-background border rounded-full px-4 py-2 shadow-lg">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDeselectAll}>
          <X className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium px-2">{selectedCount}</span>
        <div className="w-px h-5 bg-border" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFile}>
          <FolderInput className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onTag}>
          <Tag className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSnooze}>
          <Clock className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
```

---

## Props Interface

```typescript
interface BulkActionBarProps {
  selectedCount: number
  selectedIds: Set<string>
  aiSuggestion?: AIClusterSuggestion
  onDeselectAll: () => void
  onFile: () => void
  onTag: () => void
  onSnooze: () => void
  onDelete: () => void
  onAddSuggestedToSelection: (ids: string[]) => void
  onDismissSuggestion: () => void
}

interface AIClusterSuggestion {
  label: string                           // e.g., "PKM articles"
  itemIds: string[]                       // IDs of similar items
  items: { id: string; title: string }[]  // Preview data
}
```

---

## Acceptance Criteria

- [ ] `bulk-action-bar.tsx` component created
- [ ] Bar appears only when items are selected
- [ ] Bar is fixed at bottom center of screen
- [ ] Selection count displays correctly
- [ ] X button deselects all items
- [ ] File button triggers onFile callback
- [ ] Tag button triggers onTag callback
- [ ] Snooze button triggers onSnooze callback
- [ ] Delete button triggers onDelete callback
- [ ] Keyboard hints show (f, t, s, Del)
- [ ] AI suggestion section renders when provided
- [ ] Suggestion is collapsible
- [ ] "Add All to Selection" adds suggested items
- [ ] "Dismiss" hides the suggestion
- [ ] Bar has shadow and proper z-index
- [ ] `pnpm typecheck` passes

---

## Animation

Add smooth entry/exit animation:

```tsx
import { AnimatePresence, motion } from 'framer-motion'

// Wrap the component
<AnimatePresence>
  {selectedCount > 0 && (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      {/* Card content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## Integration Example

```tsx
// In inbox page
function InboxPage() {
  const { selectedIds, selectedCount, deselectAll } = useInboxSelection({ items })
  const [aiSuggestion, setAiSuggestion] = useState<AIClusterSuggestion | null>(null)

  // Detect similar items when selection changes
  useEffect(() => {
    if (selectedCount >= 2) {
      // AI service call to find similar items
      detectSimilarItems(selectedIds).then(setAiSuggestion)
    } else {
      setAiSuggestion(null)
    }
  }, [selectedIds, selectedCount])

  return (
    <>
      {/* Content */}

      <BulkActionBar
        selectedCount={selectedCount}
        selectedIds={selectedIds}
        aiSuggestion={aiSuggestion}
        onDeselectAll={deselectAll}
        onFile={() => openFilingPanel()}
        onTag={() => openTagPanel()}
        onSnooze={() => openSnoozeMenu()}
        onDelete={() => confirmDelete()}
        onAddSuggestedToSelection={(ids) => {
          ids.forEach(id => select(id))
        }}
        onDismissSuggestion={() => setAiSuggestion(null)}
      />
    </>
  )
}
```

---

## Testing

```tsx
function BulkActionBarTest() {
  const [selectedCount, setSelectedCount] = useState(3)

  const mockSuggestion = {
    label: 'Articles about PKM',
    itemIds: ['4', '5', '6'],
    items: [
      { id: '4', title: 'How to Build a Second Brain' },
      { id: '5', title: 'The Zettelkasten Method' },
      { id: '6', title: 'Linking Your Thinking' },
    ],
  }

  return (
    <div className="h-screen">
      <div className="p-8">
        <Button onClick={() => setSelectedCount((c) => c + 1)}>
          Increase Selection
        </Button>
        <Button onClick={() => setSelectedCount(0)}>
          Clear Selection
        </Button>
      </div>

      <BulkActionBar
        selectedCount={selectedCount}
        selectedIds={new Set(['1', '2', '3'])}
        aiSuggestion={selectedCount >= 2 ? mockSuggestion : undefined}
        onDeselectAll={() => setSelectedCount(0)}
        onFile={() => console.log('File')}
        onTag={() => console.log('Tag')}
        onSnooze={() => console.log('Snooze')}
        onDelete={() => console.log('Delete')}
        onAddSuggestedToSelection={(ids) => {
          setSelectedCount((c) => c + ids.length)
        }}
        onDismissSuggestion={() => {}}
      />
    </div>
  )
}
```
