# 05 - Medium View Base Structure

## Objective

Build the medium view container and base item component. This is the default view providing a balanced experience with preview content and comfortable scanning density. Row heights vary by type (80-120px).

---

## Context

The medium view is the primary inbox experience for most users. It provides:
- Visible content previews (excerpts, thumbnails)
- Type-specific layouts
- More metadata than compact view
- Action buttons on hover

This prompt creates the base structure. Type-specific layouts are covered in prompt 06.

**Dependencies:**
- 01-foundation-types (InboxItem types)
- 03-type-icon-system (TypeIcon component)

**Blocks:** 06-medium-view-types, 08-view-switcher

---

## Specifications

From inbox-layouts.md:

```
2. MEDIUM VIEW (Default)
Purpose: Balanced view for most users
Density: Comfortable scanning with preview content

Row Structure (height: 80-120px depending on type):
|- Checkbox: Left edge (selection)
|- Type Icon: 20px with type-specific color
|- Content Block:
|   |- Title: font-medium, text-base
|   |- Meta Line: domain/timestamp/stats (text-sm, muted)
|   +-- Preview: Type-specific content preview
+-- Actions: Right edge (hover reveal)
```

### Layout Structure

```
+----------------------------------------------------------------------+
|                                                                      |
|  [ ]  [icon]  Title of the item goes here                            |
|              metadata line . timestamp . stats                        |
|              Preview content area (type-specific)                    |
|                                                        [File] [:] |
+----------------------------------------------------------------------+
```

---

## Implementation Guide

### File Locations

1. **View container:** `src/renderer/src/components/inbox/medium-view.tsx`
2. **Base item wrapper:** `src/renderer/src/components/inbox/medium-item.tsx`

### MediumItem Base Component

```tsx
// src/renderer/src/components/inbox/medium-item.tsx

import { useState } from 'react'
import { MoreHorizontal, FolderInput, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TypeIcon } from './type-icon'
import type { InboxItem } from '@/types/inbox'
import { formatRelativeTime } from '@/lib/inbox-utils'

// Type-specific renderers (implemented in prompt 06)
import { MediumItemLink } from './medium-item-link'
import { MediumItemNote } from './medium-item-note'
import { MediumItemImage } from './medium-item-image'
import { MediumItemVoice } from './medium-item-voice'
import { MediumItemPdf } from './medium-item-pdf'
import { MediumItemWebclip } from './medium-item-webclip'
import { MediumItemFile } from './medium-item-file'
import { MediumItemVideo } from './medium-item-video'

interface MediumItemProps {
  item: InboxItem
  isSelected: boolean
  isFocused: boolean
  isBulkMode: boolean
  onSelect: (id: string, selected: boolean) => void
  onOpen: (id: string) => void
  onFile: (id: string) => void
  onDelete: (id: string) => void
  onSnooze: (id: string) => void
}

export function MediumItem({
  item,
  isSelected,
  isFocused,
  isBulkMode,
  onSelect,
  onOpen,
  onFile,
  onDelete,
  onSnooze,
}: MediumItemProps): React.JSX.Element {
  const [isHovered, setIsHovered] = useState(false)
  const showCheckbox = isHovered || isBulkMode || isSelected

  // Render type-specific content
  const renderContent = () => {
    switch (item.type) {
      case 'link':
        return <MediumItemLink item={item} />
      case 'note':
        return <MediumItemNote item={item} />
      case 'image':
        return <MediumItemImage item={item} />
      case 'voice':
        return <MediumItemVoice item={item} />
      case 'pdf':
        return <MediumItemPdf item={item} />
      case 'webclip':
        return <MediumItemWebclip item={item} />
      case 'file':
        return <MediumItemFile item={item} />
      case 'video':
        return <MediumItemVideo item={item} />
    }
  }

  return (
    <div
      role="article"
      tabIndex={0}
      className={cn(
        'relative p-4 border-b transition-colors',
        'hover:bg-accent/30',
        isSelected && 'bg-accent/50',
        isFocused && 'ring-2 ring-primary ring-inset'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={() => onOpen(item.id)}
    >
      <div className="flex gap-4">
        {/* Left: Checkbox */}
        <div className="w-5 flex-shrink-0 pt-1">
          {showCheckbox && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(item.id, !!checked)}
              aria-label={`Select ${item.title}`}
            />
          )}
        </div>

        {/* Center: Icon + Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            {/* Type Icon with background */}
            <TypeIcon
              type={item.type}
              size="md"
              variant="with-bg"
              className="flex-shrink-0 mt-0.5"
            />

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="font-medium text-base truncate pr-24">
                {item.title}
              </h3>

              {/* Type-specific content */}
              {renderContent()}

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {item.tags.map(tag => (
                    <span
                      key={tag.id}
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        getTagColorClass(tag.color)
                      )}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Timestamp + Actions */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(item.createdAt)}
          </span>

          {/* Hover Actions */}
          {isHovered && (
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
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
                    Open preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onFile(item.id)}>
                    File to folder
                  </DropdownMenuItem>
                  <DropdownMenuItem>Add tags</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onSnooze(item.id)}>
                    Snooze
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(item.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### MediumView Container

```tsx
// src/renderer/src/components/inbox/medium-view.tsx

import { MediumItem } from './medium-item'
import type { InboxItem } from '@/types/inbox'

interface MediumViewProps {
  items: InboxItem[]
  selectedIds: Set<string>
  focusedId: string | null
  isBulkMode: boolean
  onSelect: (id: string, selected: boolean) => void
  onOpen: (id: string) => void
  onFile: (id: string) => void
  onDelete: (id: string) => void
  onSnooze: (id: string) => void
}

export function MediumView({
  items,
  selectedIds,
  focusedId,
  isBulkMode,
  onSelect,
  onOpen,
  onFile,
  onDelete,
  onSnooze,
}: MediumViewProps): React.JSX.Element {
  return (
    <div className="flex flex-col divide-y">
      {items.map(item => (
        <MediumItem
          key={item.id}
          item={item}
          isSelected={selectedIds.has(item.id)}
          isFocused={focusedId === item.id}
          isBulkMode={isBulkMode}
          onSelect={onSelect}
          onOpen={onOpen}
          onFile={onFile}
          onDelete={onDelete}
          onSnooze={onSnooze}
        />
      ))}
    </div>
  )
}
```

---

## Placeholder Type Renderers

Create placeholder components for type-specific content (to be implemented in prompt 06):

```tsx
// src/renderer/src/components/inbox/medium-item-link.tsx
import type { InboxItemLink } from '@/types/inbox'

interface MediumItemLinkProps {
  item: InboxItemLink
}

export function MediumItemLink({ item }: MediumItemLinkProps): React.JSX.Element {
  return (
    <div className="mt-1">
      <p className="text-sm text-muted-foreground">
        {item.domain} - {item.excerpt?.slice(0, 100)}...
      </p>
    </div>
  )
}
```

Create similar placeholder files for all 8 types.

---

## Acceptance Criteria

- [ ] `medium-view.tsx` container component created
- [ ] `medium-item.tsx` base item component created
- [ ] Checkbox shows on hover/bulk/selected
- [ ] Type icon displays with background
- [ ] Title truncates with padding for actions
- [ ] Timestamp displays in top-right
- [ ] Hover reveals action buttons
- [ ] Dropdown menu includes all actions (Open, File, Tags, Snooze, Delete)
- [ ] Tags display below content
- [ ] Selected state shows accent background
- [ ] Focused state shows ring
- [ ] All 8 placeholder type components created
- [ ] `pnpm typecheck` passes

---

## CSS Notes

```css
/* Item heights by type (implemented in type-specific components) */
.medium-item-link { min-height: 100px; }
.medium-item-note { min-height: 90px; }
.medium-item-image { min-height: 120px; }
.medium-item-voice { min-height: 100px; }
.medium-item-pdf { min-height: 100px; }
.medium-item-webclip { min-height: 90px; }
.medium-item-file { min-height: 80px; }
.medium-item-video { min-height: 100px; }
```

---

## Next Steps

After this prompt, proceed to prompt 06 to implement the detailed type-specific content renderers for each of the 8 content types.
