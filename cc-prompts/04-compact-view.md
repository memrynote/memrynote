# 04 — Compact List View

## Objective

Build the compact list view — a dense, scannable list optimized for power users who want to process many items quickly. This view shows maximum items per screen with minimal visual chrome.

## Prerequisites

- **01-inbox-types.md** — Item types
- **02-page-shell.md** — Page structure
- **03-type-icons.md** — TypeBadge component

## What We're Building

A list view where each item is a single 44px row containing:
- Checkbox (selection)
- Type icon
- Title (truncated)
- Timestamp
- Action menu

Plus hover/selected/focused states for interaction.

## Placement

| What | Where |
|------|-------|
| CompactView component | `src/renderer/src/components/inbox/compact-view.tsx` (NEW) |
| CompactRow component | `src/renderer/src/components/inbox/compact-row.tsx` (NEW) |

## Specifications

### Row Layout (44px height)

```
┌──────────────────────────────────────────────────────────────────────┐
│ □  🔗  How to Build a Second Brain — Forte Labs          2h ago  ⋮  │
│ │   │   │                                                  │      │  │
│ │   │   └─ Title (flex-1, truncate)                        │      │  │
│ │   └─ Type icon (16px)                                    │      │  │
│ └─ Checkbox (20px, opacity-0 until hover/bulk)     Timestamp │  Menu │
└──────────────────────────────────────────────────────────────────────┘
```

### Row Structure

| Element | Width | Behavior |
|---------|-------|----------|
| Checkbox | 20px | Hidden until hover or bulk mode active |
| Type Icon | 16px | Always visible, colored by type |
| Title | flex-1 | Truncate with ellipsis, single line |
| Timestamp | ~60px | Relative time (2h ago, Yesterday) |
| Actions | 24px | ⋮ menu, visible on hover |

### Item States

**Default State:**
- Checkbox: `opacity-0` (invisible but takes space)
- Background: transparent
- Actions menu: `opacity-0`

**Hover State:**
- Checkbox: `opacity-100` (visible)
- Background: `bg-accent/50` (subtle highlight)
- Actions menu: `opacity-100` with quick actions visible

**Selected State:**
- Checkbox: filled/checked
- Background: `bg-accent` (more prominent)
- Border-left: `border-l-2 border-primary` (selection indicator)

**Focused State (keyboard navigation):**
- Ring: `ring-2 ring-primary ring-offset-1`
- Distinguishes keyboard focus from mouse hover

### Hover Actions

When hovering, show quick action buttons:
```
│ ...title...                              [File] [Preview] [⋮] │
```

- **File** — Opens filing panel
- **Preview** — Opens preview panel
- **⋮ Menu** — Dropdown with: Open Original, Snooze, Delete

### Timestamp Display Logic

| Age | Display |
|-----|---------|
| < 1 hour | "Xm ago" |
| < 24 hours | "Xh ago" |
| Yesterday | "Yesterday" |
| < 7 days | "X days ago" |
| ≥ 7 days | "Mon DD" (Jan 15) |

### List Container

The CompactView component:
- Receives `items: InboxItem[]` prop
- Handles virtualization for performance (if >100 items)
- Manages focused item state for keyboard nav
- Emits selection changes to parent

### Interactions

| Action | Result |
|--------|--------|
| Click row | Toggle selection (if checkbox hidden) OR preview (if not bulk mode) |
| Click checkbox | Toggle selection |
| Double-click | Open preview panel |
| Right-click | Show context menu |
| Hover | Show checkbox + actions |

## Design System Alignment

| Element | Style |
|---------|-------|
| Row height | `h-11` (44px) |
| Row padding | `px-3` |
| Row gap | `gap-3` |
| Title | `text-sm font-medium text-foreground truncate` |
| Timestamp | `text-xs text-muted-foreground` |
| Checkbox | Use shadcn `Checkbox` component |
| Divider | `border-b border-border/50` (very subtle) |
| Hover bg | `bg-accent/50` |
| Selected bg | `bg-accent` |

### Animation

- State transitions: `transition-colors duration-150`
- Checkbox opacity: `transition-opacity duration-100`
- Keep animations subtle and fast

## Acceptance Criteria

- [ ] CompactView renders list of items
- [ ] Each row is exactly 44px tall
- [ ] Type icon shows with correct color
- [ ] Title truncates properly with ellipsis
- [ ] Timestamp displays in relative format
- [ ] Checkbox appears on hover
- [ ] Quick actions appear on hover
- [ ] Selected state visually distinct
- [ ] Focused state has keyboard ring
- [ ] Click toggles selection
- [ ] Rows have subtle dividers
- [ ] Smooth hover/focus transitions

## Next Prompt

**05-medium-view.md** — Build the medium density view with preview content.
