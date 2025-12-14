# 10 — Search & Filter System

## Objective

Build the search and filtering system following progressive disclosure — filters are hidden by default and revealed when users need them. Search is always accessible via icon.

## Prerequisites

- **01-inbox-types.md** — Filter type definitions
- **02-page-shell.md** — Header bar integration points

## What We're Building

1. **Search Input** — Expandable search with recent queries
2. **Filter Popover** — Type filters, time range, sort options
3. **Active Filter Pills** — Show applied filters with clear option

## Placement

| What | Where |
|------|-------|
| SearchInput | `src/renderer/src/components/inbox/search-input.tsx` (NEW) |
| FilterPopover | `src/renderer/src/components/inbox/filter-popover.tsx` (NEW) |
| ActiveFilters | `src/renderer/src/components/inbox/active-filters.tsx` (NEW) |

## Specifications

### Search Input Behavior

**Collapsed State (default):**
```
[🔍]  ← Icon button
```

**Expanded State (on click):**
```
┌────────────────────────────────────────────────────────────────┐
│ 🔍  Search inbox...                                         ✕  │
└────────────────────────────────────────────────────────────────┘

Recent searches:
• "project alpha"
• "meeting notes"
```

**With Results:**
```
┌────────────────────────────────────────────────────────────────┐
│ 🔍  project alpha                                           ✕  │
└────────────────────────────────────────────────────────────────┘

3 results for "project alpha"                              [Clear]
```

### Search Features

- **Instant search** — Filter as you type (debounced)
- **Recent searches** — Last 5 queries stored
- **Clear button** — Resets search
- **Keyboard shortcut** — `/` focuses search
- **Escape** — Closes search

### Search Matching

Search across:
- Title (primary)
- Content/excerpt (secondary)
- URL/domain (for links)
- Transcription (for voice)
- Filename (for files)

Highlight matched text in results (optional enhancement).

---

### Filter Popover

**Trigger:** Click "Filters" button in header

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  TYPE                                                          │
│  [All] [🔗 Links] [📝 Notes] [🖼️ Images] [🎤 Voice] [📄 Files]  │
│                                                                │
│  TIME                                                          │
│  [All] [Today] [This Week] [Older] [Stale 7d+]                 │
│                                                                │
│  SORT                                                          │
│  [Newest ▼]  ○ Newest  ○ Oldest  ○ Type                        │
│                                                                │
│                                            [Reset] [Apply]     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Filter Sections

**1. Type Filter (multi-select):**
- All (default) — no type filtering
- Individual types — can select multiple
- Uses type icons for visual recognition

**2. Time Filter (single-select):**
- All — no time filtering
- Today — captured today
- This Week — last 7 days
- Older — more than 7 days
- Stale 7d+ — specifically stale items

**3. Sort Options (single-select):**
- Newest first (default)
- Oldest first
- By type (grouped)

### Filter State Management

```
interface InboxFilters {
  types: InboxItemType[] | 'all'
  timeRange: 'all' | 'today' | 'thisWeek' | 'older' | 'stale'
  sort: 'newest' | 'oldest' | 'type'
  searchQuery: string
}
```

---

### Active Filters Display

When filters are applied, show below header:

```
┌──────────────────────────────────────────────────────────────────────┐
│  Active: [🔗 Links ✕] [This Week ✕]                    [Clear All]   │
└──────────────────────────────────────────────────────────────────────┘
```

**Elements:**
- Pills for each active filter
- ✕ button removes individual filter
- "Clear All" resets to defaults

**Hide when:** No filters active (all defaults)

---

### Filter Badge in Header

Show count of active filters on the Filters button:

```
Default:      [≡ Filters]
With filters: [≡ Filters •2]  ← dot with count
```

---

### Progressive Disclosure

1. **Default:** Filters hidden, search collapsed
2. **Search active:** Input expanded, no filters shown
3. **Filters open:** Popover with options
4. **Filters applied:** Active pills shown below header

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search input |
| `Escape` | Close search/filters |
| `Enter` | Apply filters (in popover) |

## Design System Alignment

| Element | Style |
|---------|-------|
| Search input | `h-9 px-3 rounded-md border` |
| Search expanded | `w-64` or `flex-1` |
| Filter popover | `w-80 p-4 rounded-lg shadow-lg` |
| Filter pills | Toggle buttons using shadcn `Toggle` |
| Active filter pills | `Badge` with close button |
| Section labels | `text-xs font-medium text-muted-foreground uppercase` |

### Using shadcn Components

- `Popover` for filter dropdown
- `Toggle` for filter options
- `RadioGroup` for sort
- `Badge` for active filters
- `Input` for search

## Acceptance Criteria

- [ ] Search icon expands to full input
- [ ] Search filters items in real-time
- [ ] Recent searches shown on focus
- [ ] Filter button opens popover
- [ ] Type filters allow multi-select
- [ ] Time filters are single-select
- [ ] Sort options work correctly
- [ ] Active filters show as pills
- [ ] Can remove individual filters
- [ ] Clear All resets everything
- [ ] Filter count badge shows on button
- [ ] `/` shortcut focuses search
- [ ] Escape closes search/popover

## Next Prompt

**11-item-selection.md** — Build the selection system for bulk operations.
