# 11 — Selection & Bulk Mode

## Objective

Build the item selection system that enables bulk operations. Users can select multiple items via checkboxes, shift-click for range select, and enter "bulk mode" where the UI adapts to multi-item operations.

## Prerequisites

- **04-compact-view.md** — Checkbox rendering in rows
- **05-medium-view.md** — Checkbox rendering in cards

## What We're Building

1. **Selection State Management** — Track selected item IDs
2. **Checkbox Interactions** — Click, shift-click, select all
3. **Bulk Mode UI** — Header changes when items selected
4. **Selection Utilities** — Helper functions

## Placement

| What | Where |
|------|-------|
| Selection hook | `src/renderer/src/hooks/use-inbox-selection.ts` (NEW) |
| Integration | Used in `pages/inbox.tsx` and view components |

## Specifications

### Selection State

```
interface SelectionState {
  selectedIds: Set<string>
  lastSelectedId: string | null  // For shift-click range
  isAllSelected: boolean
}
```

### Selection Hook

```
const {
  selectedIds,
  selectedCount,
  isSelected,
  toggleSelection,
  selectRange,
  selectAll,
  deselectAll,
  clearSelection,
} = useInboxSelection(items)
```

---

### Checkbox Behavior

**Single Click:**
- Toggle that item's selection
- Update `lastSelectedId`

**Shift + Click:**
- Select range from `lastSelectedId` to clicked item
- All items between (inclusive) become selected
- Don't deselect others outside range

**Cmd/Ctrl + Click:**
- Toggle without affecting other selections
- Standard multi-select behavior

**Select All:**
- Checkbox in header (when in bulk mode) or Cmd+A
- Selects all visible items (respects current filters)

---

### Bulk Mode Detection

```
const isInBulkMode = selectedIds.size > 0
```

When `isInBulkMode` is true:
- Header transforms to show selection count
- Bulk action bar appears at bottom
- Checkboxes always visible (not just on hover)

---

### Header Transformation

**Normal Header:**
```
│  Inbox  [24 items · 5 today]     [Search] [Filters] [View]  │
```

**Bulk Mode Header:**
```
│  ☑ 5 selected                    [Deselect all]     [View]  │
```

**Elements in bulk mode:**
- Checkmark icon indicating selection mode
- Count: "5 selected"
- "Deselect all" button
- View toggle remains

---

### Checkbox Visibility Rules

| Context | Checkbox Visibility |
|---------|---------------------|
| Normal mode, default | Hidden (`opacity-0`) |
| Normal mode, row hover | Visible (`opacity-100`) |
| Bulk mode (any selected) | Always visible |
| Header checkbox | Shows in bulk mode only |

---

### Range Selection Logic

```
function selectRange(items, fromId, toId) {
  const fromIndex = items.findIndex(i => i.id === fromId)
  const toIndex = items.findIndex(i => i.id === toId)

  const start = Math.min(fromIndex, toIndex)
  const end = Math.max(fromIndex, toIndex)

  const rangeIds = items.slice(start, end + 1).map(i => i.id)

  // Add range to selection (don't replace)
  return new Set([...currentSelection, ...rangeIds])
}
```

---

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `x` | Toggle selection on focused item |
| `Cmd/Ctrl + A` | Select all visible items |
| `Cmd/Ctrl + Shift + A` | Deselect all |
| `Escape` | Clear selection (exit bulk mode) |

---

### Selection Persistence

- Selection is **not** persisted across sessions
- Selection clears when filters change significantly
- Selection preserved when switching views
- Selection IDs validated against current items (remove stale)

---

### Visual Feedback

**Selected Item:**
- Checkbox: checked state
- Background: `bg-accent`
- Optional: border accent `border-l-2 border-primary`

**Focused Item (keyboard):**
- Ring: `ring-2 ring-primary`
- Distinct from selected (can be focused but not selected)

**Both Focused AND Selected:**
- Both styles applied

---

### Integration with Views

Each view (Compact, Medium, Expanded) receives:

```
interface ViewProps {
  items: InboxItem[]
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onItemClick: (id: string, event: MouseEvent) => void
}
```

Click handler determines behavior based on:
- `event.shiftKey` → range select
- `event.metaKey` / `event.ctrlKey` → toggle select
- Neither → single select (or preview in non-bulk mode)

## Design System Alignment

| Element | Style |
|---------|-------|
| Checkbox | shadcn `Checkbox` component |
| Selected bg | `bg-accent` |
| Selected border | `border-l-2 border-primary` |
| Bulk count | `font-semibold` |
| Deselect button | `variant="ghost"` |

## Acceptance Criteria

- [ ] `useInboxSelection` hook works correctly
- [ ] Single click toggles selection
- [ ] Shift+click selects range
- [ ] Cmd/Ctrl+click toggles without deselecting others
- [ ] Select All selects all visible items
- [ ] Deselect All clears selection
- [ ] Header transforms in bulk mode
- [ ] Checkboxes always visible in bulk mode
- [ ] Selected items have visual distinction
- [ ] Escape clears selection
- [ ] Selection works across all three views
- [ ] `x` keyboard shortcut toggles focused item

## Next Prompt

**12-bulk-actions.md** — Build the bulk action bar with File, Tag, Delete operations.
