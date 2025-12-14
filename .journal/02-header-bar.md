# 02 - Header Bar Component

## Objective

Build the inbox header bar containing the page title, item count badge, search input trigger, filter button, and view mode toggle. This component anchors the top of the inbox page and provides primary navigation controls.

---

## Context

The header bar is the control center for the inbox. It displays:
- Page title with item statistics
- Expandable search (covered in detail in prompt 10)
- Filter toggle (covered in detail in prompt 11)
- View mode switcher (covered in detail in prompt 08)

This prompt focuses on the header structure and layout. Child components will be built in subsequent prompts.

**Dependencies:** 01-foundation-types (for InboxViewMode type)

**Blocks:** 08-view-switcher, 10-search-component, 11-filter-system

---

## Specifications

From inbox-layouts.md:

```
Header Bar Detail:
Components:
|- Title: "Inbox" (h1, font-semibold, text-2xl)
|- Badge: "24 items . 5 today" (muted, secondary)
|- Search: Expandable input (icon trigger -> full width on focus)
|- Filters: Dropdown or toggle pills (hidden by default -> progressive)
|- View Toggle: [List] [Card] [Expanded] icon buttons
```

### Layout Structure

```
+----------------------------------------------------------------------+
|                                                                      |
|  Inbox                    +------------------+                       |
|  o 24 items . 5 today     | Search...        |   [Filters]  [View]   |
|                           +------------------+                       |
|                                                                      |
+----------------------------------------------------------------------+
```

### Responsive Behavior

- On narrow screens, search expands to full width
- Filter button shows badge when filters are active
- View toggle uses icon-only buttons

---

## Implementation Guide

### File Location

Create new file: `src/renderer/src/components/inbox/header-bar.tsx`

### Component Structure

```tsx
// src/renderer/src/components/inbox/header-bar.tsx

import { Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { InboxViewMode } from '@/types/inbox'

interface HeaderBarProps {
  totalItems: number
  todayItems: number
  snoozedCount: number
  activeFilterCount: number
  currentView: InboxViewMode
  onViewChange: (view: InboxViewMode) => void
  onSearchClick: () => void
  onFilterClick: () => void
}

export function HeaderBar({
  totalItems,
  todayItems,
  snoozedCount,
  activeFilterCount,
  currentView,
  onViewChange,
  onSearchClick,
  onFilterClick,
}: HeaderBarProps): React.JSX.Element {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      {/* Left section: Title and stats */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          {totalItems} items
          {todayItems > 0 && ` . ${todayItems} today`}
          {snoozedCount > 0 && (
            <button className="ml-2 hover:underline">
              . {snoozedCount} snoozed
            </button>
          )}
        </p>
      </div>

      {/* Right section: Search, Filters, View Toggle */}
      <div className="flex items-center gap-2">
        {/* Search trigger - placeholder for SearchInput component */}
        <Button
          variant="outline"
          size="sm"
          className="w-[200px] justify-start text-muted-foreground"
          onClick={onSearchClick}
        >
          <Search className="mr-2 h-4 w-4" />
          Search...
        </Button>

        {/* Filter button - placeholder for FilterBar component */}
        <Button
          variant="outline"
          size="icon"
          onClick={onFilterClick}
          className="relative"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* View toggle - placeholder for ViewSwitcher component */}
        <div className="flex border rounded-md">
          {/* Will be replaced by ViewSwitcher in prompt 08 */}
        </div>
      </div>
    </header>
  )
}
```

### Styling Details

| Element | Classes |
|---------|---------|
| Header container | `flex items-center justify-between px-6 py-4 border-b` |
| Title | `text-2xl font-semibold` |
| Stats text | `text-sm text-muted-foreground` |
| Search button | `w-[200px] justify-start text-muted-foreground` |
| Filter badge | `absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary` |

---

## Props Interface

```typescript
interface HeaderBarProps {
  // Item counts
  totalItems: number        // Total items in inbox
  todayItems: number        // Items added today
  snoozedCount: number      // Items currently snoozed

  // Filter state
  activeFilterCount: number // Number of active filters (0 = no badge)

  // View state
  currentView: InboxViewMode
  onViewChange: (view: InboxViewMode) => void

  // Action handlers
  onSearchClick: () => void   // Opens search overlay/expands search
  onFilterClick: () => void   // Opens filter dropdown
}
```

---

## Acceptance Criteria

- [ ] File created at `src/renderer/src/components/inbox/header-bar.tsx`
- [ ] Header displays title "Inbox" with correct typography
- [ ] Item count badge shows total items and today count
- [ ] Snoozed count appears as clickable text when > 0
- [ ] Search button triggers `onSearchClick`
- [ ] Filter button triggers `onFilterClick`
- [ ] Filter button shows count badge when `activeFilterCount > 0`
- [ ] View toggle placeholder exists for later implementation
- [ ] Component is responsive (test at different widths)
- [ ] `pnpm typecheck` passes

---

## Integration Example

```tsx
// In inbox page
import { HeaderBar } from '@/components/inbox/header-bar'

function InboxPage() {
  const [view, setView] = useState<InboxViewMode>('medium')
  const [searchOpen, setSearchOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <HeaderBar
        totalItems={24}
        todayItems={5}
        snoozedCount={3}
        activeFilterCount={0}
        currentView={view}
        onViewChange={setView}
        onSearchClick={() => setSearchOpen(true)}
        onFilterClick={() => setFilterOpen(true)}
      />

      {/* Content area below */}
    </div>
  )
}
```

---

## Future Enhancements

In subsequent prompts, this component will be enhanced with:
- Real SearchInput component (prompt 10)
- Real FilterBar dropdown (prompt 11)
- Real ViewSwitcher component (prompt 08)

For now, implement with placeholder buttons that trigger the callback props.
