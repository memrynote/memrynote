# 08 - View Switcher

## Objective

Build the view mode toggle component that allows users to switch between Compact, Medium, and Expanded views. This component integrates into the header bar and controls which view component renders in the content area.

---

## Context

The view switcher is a critical UX element that:
- Provides clear visual indication of current view
- Enables quick switching between density modes
- Persists user preference (future enhancement)

**Dependencies:**
- 01-foundation-types (InboxViewMode type)
- 04-compact-view
- 05-medium-view-base
- 07-expanded-view

**Blocks:** 18-page-integration

---

## Specifications

From inbox-layouts.md:

```
View Toggle: [List] [Card] [Expanded] icon buttons

The toggle appears in the header bar as a segmented button group
with three options:
- List icon (LayoutList) for Compact view
- Grid icon (LayoutGrid) for Medium view
- Maximize icon (Maximize2) for Expanded view
```

### Visual Design

```
INACTIVE STATE:
+---+---+---+
|[=]| : |[+]|
+---+---+---+
  ^
  selected (bg-accent)

HOVER STATE:
+---+---+---+
|[=]|[:]|[+]|
+---+---+---+
      ^
      hover highlight
```

---

## Implementation Guide

### File Location

Create: `src/renderer/src/components/inbox/view-switcher.tsx`

### ViewSwitcher Component

```tsx
// src/renderer/src/components/inbox/view-switcher.tsx

import { LayoutList, LayoutGrid, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { InboxViewMode } from '@/types/inbox'

interface ViewSwitcherProps {
  currentView: InboxViewMode
  onViewChange: (view: InboxViewMode) => void
  className?: string
}

interface ViewOption {
  value: InboxViewMode
  icon: typeof LayoutList
  label: string
  shortcut: string
}

const VIEW_OPTIONS: ViewOption[] = [
  {
    value: 'compact',
    icon: LayoutList,
    label: 'Compact List',
    shortcut: 'v then 1',
  },
  {
    value: 'medium',
    icon: LayoutGrid,
    label: 'Card View',
    shortcut: 'v then 2',
  },
  {
    value: 'expanded',
    icon: Maximize2,
    label: 'Expanded',
    shortcut: 'v then 3',
  },
]

export function ViewSwitcher({
  currentView,
  onViewChange,
  className,
}: ViewSwitcherProps): React.JSX.Element {
  return (
    <TooltipProvider>
      <div
        className={cn(
          'inline-flex items-center rounded-md border bg-background p-0.5',
          className
        )}
        role="radiogroup"
        aria-label="View mode"
      >
        {VIEW_OPTIONS.map(({ value, icon: Icon, label, shortcut }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                role="radio"
                aria-checked={currentView === value}
                aria-label={label}
                className={cn(
                  'h-8 w-8 p-0',
                  currentView === value && 'bg-accent text-accent-foreground'
                )}
                onClick={() => onViewChange(value)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="flex items-center gap-2">
              <span>{label}</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded">
                {shortcut}
              </kbd>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
```

### Integration with Header Bar

Update `header-bar.tsx` to use ViewSwitcher:

```tsx
// In src/renderer/src/components/inbox/header-bar.tsx

import { ViewSwitcher } from './view-switcher'

// Replace the placeholder view toggle div with:
<ViewSwitcher
  currentView={currentView}
  onViewChange={onViewChange}
/>
```

### Content Area Rendering

The inbox page should conditionally render the appropriate view:

```tsx
// In inbox page component

import { CompactView } from '@/components/inbox/compact-view'
import { MediumView } from '@/components/inbox/medium-view'
import { ExpandedView } from '@/components/inbox/expanded-view'

function renderView() {
  switch (currentView) {
    case 'compact':
      return (
        <CompactView
          items={filteredItems}
          selectedIds={selectedIds}
          focusedId={focusedId}
          isBulkMode={isBulkMode}
          onSelect={handleSelect}
          onOpen={handleOpen}
          onFile={handleFile}
          onDelete={handleDelete}
        />
      )

    case 'medium':
      return (
        <MediumView
          items={filteredItems}
          selectedIds={selectedIds}
          focusedId={focusedId}
          isBulkMode={isBulkMode}
          onSelect={handleSelect}
          onOpen={handleOpen}
          onFile={handleFile}
          onDelete={handleDelete}
          onSnooze={handleSnooze}
        />
      )

    case 'expanded':
      return (
        <ExpandedView
          items={filteredItems}
          onFile={handleFile}
          onOpenOriginal={handleOpenOriginal}
          onSnooze={handleSnooze}
          onDelete={handleDelete}
          onAcceptSuggestion={handleAcceptSuggestion}
          onDismissSuggestion={handleDismissSuggestion}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />
      )
  }
}
```

---

## State Management

### Local State (Simple)

```tsx
const [currentView, setCurrentView] = useState<InboxViewMode>('medium')
```

### Persisted State (Enhanced)

For persistence across sessions, use localStorage:

```tsx
// src/renderer/src/lib/hooks/use-inbox-view.ts

import { useState, useEffect } from 'react'
import type { InboxViewMode } from '@/types/inbox'

const STORAGE_KEY = 'memry-inbox-view'

export function useInboxView() {
  const [view, setView] = useState<InboxViewMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return (saved as InboxViewMode) || 'medium'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, view)
  }, [view])

  return [view, setView] as const
}
```

---

## Props Interface

```typescript
interface ViewSwitcherProps {
  currentView: InboxViewMode   // Currently active view
  onViewChange: (view: InboxViewMode) => void  // Callback when view changes
  className?: string           // Additional CSS classes
}
```

---

## Acceptance Criteria

- [ ] `view-switcher.tsx` component created
- [ ] Three view options render with correct icons
- [ ] Current view has visual active state (bg-accent)
- [ ] Clicking a view triggers onViewChange
- [ ] Tooltips show on hover with label and shortcut
- [ ] Proper ARIA attributes (radiogroup, radio, aria-checked)
- [ ] Header bar updated to use ViewSwitcher
- [ ] Content area conditionally renders correct view component
- [ ] `pnpm typecheck` passes

---

## Keyboard Shortcut Integration

The 'v' shortcut will be implemented in prompt 17. The tooltip hints at the shortcut pattern:
- `v` then `1` - Switch to Compact
- `v` then `2` - Switch to Medium
- `v` then `3` - Switch to Expanded

For now, implement only the click behavior.

---

## Accessibility

- Use `role="radiogroup"` on container
- Use `role="radio"` on each button
- Use `aria-checked` to indicate selection
- Use `aria-label` for screen reader description
- Ensure keyboard focusability with Tab key

---

## Visual States

| State | Appearance |
|-------|------------|
| Default | Ghost button, no background |
| Hover | Subtle hover highlight |
| Active/Selected | bg-accent background |
| Focus | Focus ring visible |
| Disabled | Muted colors, cursor-not-allowed |

---

## Testing

```tsx
// Test component
function ViewSwitcherTest() {
  const [view, setView] = useState<InboxViewMode>('medium')

  return (
    <div className="p-8 space-y-4">
      <ViewSwitcher currentView={view} onViewChange={setView} />
      <p>Current view: {view}</p>
    </div>
  )
}
```
