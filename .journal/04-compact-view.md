# 04 - Compact View (List)

## Objective

Build the compact list view for power users who need to process many items rapidly. This view maximizes items per screen with minimal visual chrome, using 44px row height and single-line truncated titles.

---

## Context

The compact view is designed for rapid triage:
- Maximum density (most items visible)
- Keyboard navigation friendly
- Quick actions on hover
- Checkbox selection for bulk operations

**Dependencies:**
- 01-foundation-types (InboxItem, InboxContentType)
- 03-type-icon-system (TypeIcon component)

**Blocks:** 08-view-switcher, 12-item-selection

---

## Specifications

From inbox-layouts.md:

```
1. COMPACT VIEW (List)
Purpose: Power users processing many items rapidly
Density: Maximum items per screen, minimal chrome

+----------------------------------------------------------------------+
| [ ]  [link]  How to Build a Second Brain -- Forte Labs      2h ago  : |
+----------------------------------------------------------------------+
| [ ]  [note]  Meeting notes: Q4 planning session             3h ago  : |
+----------------------------------------------------------------------+
| [ ]  [img]   whiteboard-sketch.png                          5h ago  : |
+----------------------------------------------------------------------+

Row Structure (height: 44px):
|- Checkbox: 20px (selection, hidden until hover or bulk mode)
|- Type Icon: 16px (content type indicator)
|- Title: flex-1 (truncated single line)
|- Timestamp: 60px (relative time, muted)
|- Actions: 24px (: menu, appears on hover)
```

### Item States

```
DEFAULT:
| [ ]  [link]  How to Build a Second Brain           2h ago  : |
      |                                                      |
      +-- type icon                            actions (hover)+

HOVER:
| [x]  [link]  How to Build a Second Brain   [File] [eye] [:] |
      |                                               |
      +-- checkbox visible               quick actions visible +

SELECTED:
| [x]  [link]  How to Build a Second Brain           2h ago  : |
  |
  +-- bg-accent/50, checkbox filled

FOCUSED (keyboard nav):
| [ ]  [link]  How to Build a Second Brain           2h ago  : |
  |
  +-- ring-2 ring-primary outline
```

---

## Implementation Guide

### File Locations

1. **List container:** `src/renderer/src/components/inbox/compact-view.tsx`
2. **Single row:** `src/renderer/src/components/inbox/compact-item.tsx`

### CompactItem Component

```tsx
// src/renderer/src/components/inbox/compact-item.tsx

import { useState } from 'react'
import { MoreHorizontal, FolderInput, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TypeIcon } from './type-icon'
import type { InboxItem } from '@/types/inbox'
import { formatRelativeTime } from '@/lib/inbox-utils'

interface CompactItemProps {
  item: InboxItem
  isSelected: boolean
  isFocused: boolean
  isBulkMode: boolean
  onSelect: (id: string, selected: boolean) => void
  onOpen: (id: string) => void
  onFile: (id: string) => void
  onDelete: (id: string) => void
}

export function CompactItem({
  item,
  isSelected,
  isFocused,
  isBulkMode,
  onSelect,
  onOpen,
  onFile,
  onDelete,
}: CompactItemProps): React.JSX.Element {
  const [isHovered, setIsHovered] = useState(false)
  const showCheckbox = isHovered || isBulkMode || isSelected

  return (
    <div
      role="row"
      tabIndex={0}
      className={cn(
        'flex items-center h-11 px-4 gap-3 border-b transition-colors',
        'hover:bg-accent/50',
        isSelected && 'bg-accent/50',
        isFocused && 'ring-2 ring-primary ring-inset'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={() => onOpen(item.id)}
    >
      {/* Checkbox - hidden by default, shown on hover/bulk/selected */}
      <div className="w-5 flex-shrink-0">
        {showCheckbox ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(item.id, !!checked)}
            aria-label={`Select ${item.title}`}
          />
        ) : null}
      </div>

      {/* Type Icon */}
      <TypeIcon type={item.type} size="sm" variant="icon-only" />

      {/* Title - truncated single line */}
      <span className="flex-1 truncate text-sm font-medium">
        {item.title}
        {item.type === 'voice' && (
          <span className="ml-2 text-muted-foreground">
            ({formatDuration(item.duration)})
          </span>
        )}
      </span>

      {/* Tags (if any) - compact pills */}
      {item.tags.length > 0 && !isHovered && (
        <div className="flex gap-1">
          {item.tags.slice(0, 2).map(tag => (
            <span
              key={tag.id}
              className={cn(
                'px-1.5 py-0.5 text-[10px] rounded-full',
                getTagColorClass(tag.color)
              )}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Hover Actions OR Timestamp */}
      {isHovered ? (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onFile(item.id)}
          >
            <FolderInput className="h-3.5 w-3.5 mr-1" />
            File
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onOpen(item.id)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpen(item.id)}>
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFile(item.id)}>
                File to folder
              </DropdownMenuItem>
              <DropdownMenuItem>Add tags</DropdownMenuItem>
              <DropdownMenuItem>Snooze</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(item.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground w-16 text-right flex-shrink-0">
          {formatRelativeTime(item.createdAt)}
        </span>
      )}
    </div>
  )
}
```

### CompactView Container

```tsx
// src/renderer/src/components/inbox/compact-view.tsx

import { CompactItem } from './compact-item'
import type { InboxItem } from '@/types/inbox'

interface CompactViewProps {
  items: InboxItem[]
  selectedIds: Set<string>
  focusedId: string | null
  isBulkMode: boolean
  onSelect: (id: string, selected: boolean) => void
  onOpen: (id: string) => void
  onFile: (id: string) => void
  onDelete: (id: string) => void
}

export function CompactView({
  items,
  selectedIds,
  focusedId,
  isBulkMode,
  onSelect,
  onOpen,
  onFile,
  onDelete,
}: CompactViewProps): React.JSX.Element {
  return (
    <div role="grid" className="flex flex-col">
      {items.map(item => (
        <CompactItem
          key={item.id}
          item={item}
          isSelected={selectedIds.has(item.id)}
          isFocused={focusedId === item.id}
          isBulkMode={isBulkMode}
          onSelect={onSelect}
          onOpen={onOpen}
          onFile={onFile}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
```

---

## Utility Functions

Add to `src/renderer/src/lib/inbox-utils.ts`:

```typescript
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function getTagColorClass(color: TagColor): string {
  const colorMap: Record<TagColor, string> = {
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  }
  return colorMap[color]
}
```

---

## Acceptance Criteria

- [ ] `compact-item.tsx` created with correct 44px row height
- [ ] `compact-view.tsx` created as container component
- [ ] Checkbox hidden by default, visible on hover/bulk/selected
- [ ] Type icon displays correctly for all 8 types
- [ ] Title truncates properly with ellipsis
- [ ] Timestamp shows relative time (muted text)
- [ ] Hover reveals quick action buttons (File, Preview, Menu)
- [ ] Selected state shows accent background
- [ ] Focused state shows ring outline
- [ ] Dropdown menu has all required options
- [ ] Voice items show duration in title
- [ ] Tags display as compact pills (max 2)
- [ ] `pnpm typecheck` passes

---

## Keyboard Hints

For later implementation (prompt 17), items should show keyboard hints:

```
On hover:
| [x]  [link]  How to Build...   [f] File  [Enter] > |
                                  ^              ^
                            shortcut hints visible
```

---

## Accessibility

- Use `role="grid"` on container, `role="row"` on items
- Checkbox has `aria-label` describing the item
- Items are focusable with `tabIndex={0}`
- Double-click opens preview (single click selects in bulk mode)
