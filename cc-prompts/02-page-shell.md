# 02 — Page Shell & Header Bar

## Objective

Create the foundational page structure for the Inbox page — the outer shell that contains the header bar, content area, and establishes the layout grid. This shell will house all inbox components.

## Prerequisites

- **01-inbox-types.md** — Type definitions must exist

## What We're Building

The inbox page shell with:
- Page container with proper padding and scrolling
- Header bar with title, item count, search trigger, filter button, view toggle
- Main content area that will hold the item list
- Bottom area reserved for bulk action bar

## Placement

| What | Where |
|------|-------|
| Main page component | `src/renderer/src/pages/inbox.tsx` (exists, modify) |
| Header component | `src/renderer/src/components/inbox/inbox-header.tsx` (NEW) |
| Component index | `src/renderer/src/components/inbox/index.ts` (NEW) |

**Pattern Reference:** Look at `pages/tasks.tsx` for how complex pages are structured with internal components.

## Specifications

### Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER BAR (fixed height ~60px)                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Title  Badge  [Spacer]  Search  Filters  ViewToggle       │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CONTENT AREA (flex-1, scrollable)                              │
│  - Will contain view components (compact/medium/expanded)       │
│  - Handles overflow-y-auto                                      │
│                                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  BULK ACTION BAR AREA (conditional, fixed to bottom)            │
│  - Only visible when items selected                             │
│  - ~64px height                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Header Bar Components

**Left Section:**
- "Inbox" title — `text-2xl font-semibold`
- Badge showing count — "24 items · 5 today"
  - Total item count
  - Today's captures count (if > 0)

**Right Section (flex, gap-2):**
- Search trigger — Icon button that expands to full search
- Filters button — Opens filter dropdown/popover
- View toggle — 3-way toggle: Compact | Medium | Expanded

### Container Styling

Following the design system:
- Page padding: `px-6 pt-6`
- Background: inherit from app (warm beige)
- Header margin-bottom: `mb-6`
- Content area: `flex-1 overflow-y-auto`

### State Requirements

The page shell manages:
- `viewMode`: 'compact' | 'medium' | 'expanded' (default: 'medium')
- `isSearchOpen`: boolean for search expansion
- `isFiltersOpen`: boolean for filter dropdown
- Passes these down to child components

### Header Interactions

| Element | Click Action |
|---------|--------------|
| Search icon | Expands to full-width search input |
| Filters button | Opens filter popover |
| View toggle | Switches between 3 view modes |

## Design System Alignment

| Element | Style |
|---------|-------|
| Page background | Inherits `#F6F5F0` |
| Title | `text-2xl font-semibold text-foreground` |
| Badge | `text-muted-foreground` with `Badge` component |
| Icons | `size-4` using Lucide icons |
| Toggle | Use shadcn `ToggleGroup` component |
| Spacing | 8pt grid — `gap-2`, `gap-4`, `mb-6` |

### Icons to Use

- Search: `Search` from lucide-react
- Filters: `SlidersHorizontal` or `Filter`
- Compact view: `List`
- Medium view: `LayoutList`
- Expanded view: `LayoutGrid` or `Rows3`

## Acceptance Criteria

- [ ] InboxPage component renders without errors
- [ ] Header bar displays with title and badge
- [ ] Badge shows dynamic item count
- [ ] View toggle switches between 3 modes
- [ ] View mode state persists during session
- [ ] Search icon is clickable (expansion logic in later prompt)
- [ ] Filter button is clickable (filter logic in later prompt)
- [ ] Content area scrolls independently of header
- [ ] Layout matches the warm beige design system
- [ ] Components exported from `components/inbox/index.ts`

## Next Prompt

**03-type-icons.md** — Create the icon and color mapping system for content types.
