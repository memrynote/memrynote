# 17 — Keyboard Shortcuts & Final Integration

## Objective

Wire up all keyboard shortcuts and complete the final integration of all inbox components. This prompt brings everything together into a cohesive, keyboard-navigable page.

## Prerequisites

All previous prompts (01-16) should be complete.

## What We're Building

1. **Keyboard Shortcut System** — Full navigation and actions
2. **Shortcuts Help Modal** — Reference for all shortcuts
3. **Final Page Assembly** — Integrate all components
4. **Responsive Behavior** — Sidebar collapse handling

## Placement

| What | Where |
|------|-------|
| Keyboard hook | `src/renderer/src/hooks/use-inbox-keyboard.ts` (NEW) |
| Shortcuts modal | `src/renderer/src/components/inbox/shortcuts-modal.tsx` (NEW) |
| Final page | `src/renderer/src/pages/inbox.tsx` (MODIFY) |

## Specifications

### Keyboard Shortcuts Reference

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                      ⌨️  Keyboard Shortcuts                          │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────   │
│                                                                      │
│  NAVIGATION                                                          │
│  ↑ / ↓ or j / k        Move between items                           │
│  Enter or Space        Open preview panel                            │
│  Escape                Close panel / Deselect all                    │
│  Home                  Jump to first item                            │
│  End                   Jump to last item                             │
│                                                                      │
│  SELECTION                                                           │
│  x                     Toggle selection on focused item              │
│  Shift + Click         Select range                                  │
│  ⌘/Ctrl + A            Select all visible items                      │
│  ⌘/Ctrl + Shift + A    Deselect all                                  │
│                                                                      │
│  ACTIONS                                                             │
│  f                     File selected item(s)                         │
│  t                     Add/edit tags                                 │
│  s                     Snooze selected item(s)                       │
│  Delete / Backspace    Delete selected item(s)                       │
│  o                     Open original (links/files)                   │
│                                                                      │
│  VIEW                                                                │
│  v                     Cycle view mode (Compact→Medium→Expanded)     │
│  r                     Refresh inbox                                 │
│  /                     Focus search                                  │
│  ?                     Show this help                                │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────   │
│                                                                      │
│                              [Close]                                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Keyboard Navigation System

**Focus Management:**
- Track `focusedItemId` in page state
- Focused item has visual ring indicator
- Focus moves with j/k or ↑/↓
- Focus wraps at list boundaries (optional)

**Navigation Shortcuts:**

| Key | Action |
|-----|--------|
| `↑` or `k` | Move focus to previous item |
| `↓` or `j` | Move focus to next item |
| `Home` | Focus first item |
| `End` | Focus last item |
| `Enter` | Open preview for focused item |
| `Space` | Same as Enter (open preview) |

---

### Selection Shortcuts

| Key | Action |
|-----|--------|
| `x` | Toggle selection on focused item |
| `⌘/Ctrl + A` | Select all visible items |
| `⌘/Ctrl + Shift + A` | Deselect all |
| `Escape` | Clear selection OR close open panel |

---

### Action Shortcuts

| Key | Action | Condition |
|-----|--------|-----------|
| `f` | Open filing panel | Item(s) selected or focused |
| `t` | Open tag popover | Item(s) selected or focused |
| `s` | Open snooze menu | Item(s) selected or focused |
| `Delete` / `Backspace` | Delete with confirmation | Item(s) selected or focused |
| `o` | Open original URL/file | Single item focused (links/files only) |

---

### View & Utility Shortcuts

| Key | Action |
|-----|--------|
| `v` | Cycle view: Compact → Medium → Expanded → Compact |
| `r` | Refresh inbox (re-fetch items) |
| `/` | Focus search input |
| `?` | Toggle shortcuts help modal |
| `Escape` | Close any open panel/modal |

---

### useInboxKeyboard Hook

```
interface UseInboxKeyboardProps {
  items: InboxItem[]
  focusedItemId: string | null
  selectedIds: Set<string>
  viewMode: ViewMode
  isSearchOpen: boolean
  isPanelOpen: boolean

  onFocusChange: (id: string | null) => void
  onSelectionChange: (ids: Set<string>) => void
  onViewModeChange: (mode: ViewMode) => void
  onOpenPreview: (id: string) => void
  onOpenFiling: (ids: string[]) => void
  onOpenSnooze: (ids: string[]) => void
  onDelete: (ids: string[]) => void
  onOpenOriginal: (id: string) => void
  onSearchFocus: () => void
  onRefresh: () => void
  onShowHelp: () => void
}

function useInboxKeyboard(props: UseInboxKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input
      if (isInputFocused()) return

      // Navigation
      if (e.key === 'ArrowUp' || e.key === 'k') { ... }
      if (e.key === 'ArrowDown' || e.key === 'j') { ... }

      // Selection
      if (e.key === 'x') { ... }
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') { ... }

      // Actions
      if (e.key === 'f') { ... }
      if (e.key === 't') { ... }
      if (e.key === 's') { ... }
      if (e.key === 'Delete' || e.key === 'Backspace') { ... }
      if (e.key === 'o') { ... }

      // View
      if (e.key === 'v') { ... }
      if (e.key === 'r') { ... }
      if (e.key === '/') { ... }
      if (e.key === '?') { ... }
      if (e.key === 'Escape') { ... }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [/* deps */])
}
```

---

### Shortcuts Help Modal

Triggered by `?` key:

- Uses shadcn `Dialog` component
- Lists all shortcuts grouped by category
- Shows ⌘ on Mac, Ctrl on Windows
- Closes on Escape or click outside

---

### Final Page Structure

```
export function InboxPage() {
  // State
  const [items, setItems] = useState<InboxItem[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('medium')
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null)
  const [filters, setFilters] = useState<InboxFilters>(defaultFilters)

  // Selection
  const selection = useInboxSelection(items)

  // Keyboard
  useInboxKeyboard({ /* props */ })

  // Derived
  const filteredItems = applyFilters(items, filters)
  const staleItems = getStaleItems(filteredItems)
  const nonStaleItems = getNonStaleItems(filteredItems)
  const snoozedItems = getSnoozedItems(items)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <InboxHeader
        itemCount={items.length}
        todayCount={getTodayCount(items)}
        snoozedCount={snoozedItems.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFiltersChange={setFilters}
        isInBulkMode={selection.selectedCount > 0}
        selectedCount={selection.selectedCount}
        onDeselectAll={selection.deselectAll}
      />

      {/* Active Filters */}
      {hasActiveFilters(filters) && (
        <ActiveFilters filters={filters} onClear={clearFilter} />
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <EmptyState ... />
        ) : (
          <>
            {viewMode === 'compact' && (
              <CompactView
                items={nonStaleItems}
                focusedId={focusedItemId}
                selectedIds={selection.selectedIds}
                ...
              />
            )}
            {viewMode === 'medium' && <MediumView ... />}
            {viewMode === 'expanded' && <ExpandedView ... />}

            {staleItems.length > 0 && (
              <StaleSection items={staleItems} ... />
            )}
          </>
        )}
      </div>

      {/* Bulk Actions */}
      {selection.selectedCount > 0 && (
        <BulkActionBar ... />
      )}

      {/* Panels */}
      <FilingPanel ... />
      <PreviewPanel ... />
      <SnoozeMenu ... />

      {/* Modals */}
      <ShortcutsModal ... />
      <DeleteConfirmationDialog ... />

      {/* Toasts */}
      <Toaster />
    </div>
  )
}
```

---

### Responsive Behavior

**Sidebar States:**

| Width | Sidebar | Content |
|-------|---------|---------|
| >1200px | Full (240px) | Normal |
| 900-1200px | Collapsed (64px, icons only) | Expanded |
| <900px | Hidden (hamburger menu) | Full width |

The inbox page should:
- Adapt to available width
- Not control sidebar (handled at app level)
- Handle narrow widths gracefully

---

### Toast Notifications

Use for action feedback:
- "Filed to Research" — with Undo
- "Added 2 tags to 3 items"
- "Deleted 5 items" — with Undo
- "Snoozed until tomorrow"

Undo action reverses the operation.

---

### Screen Reader Support

- Announce focus changes
- Announce selection changes
- Announce action results
- Use `aria-live` regions for dynamic content

```
<SRAnnouncer message={srMessage} />
```

## Design System Alignment

| Element | Style |
|---------|-------|
| Focus ring | `ring-2 ring-primary ring-offset-2` |
| Modal backdrop | `bg-black/50` |
| Shortcut key | `kbd` element or `bg-muted px-1.5 py-0.5 rounded text-xs font-mono` |
| Category headers | `text-xs font-medium text-muted-foreground uppercase mb-2` |

## Acceptance Criteria

- [ ] j/k and arrow keys navigate items
- [ ] Focus indicator visible on focused item
- [ ] x toggles selection
- [ ] Cmd+A selects all
- [ ] f opens filing panel
- [ ] t opens tag popover
- [ ] s opens snooze menu
- [ ] Delete triggers confirmation
- [ ] o opens original link
- [ ] v cycles view modes
- [ ] / focuses search
- [ ] ? opens help modal
- [ ] Escape closes panels/clears selection
- [ ] Shortcuts modal shows all shortcuts
- [ ] All components integrated in page
- [ ] Empty states render correctly
- [ ] Stale section renders at bottom
- [ ] Bulk action bar appears when selecting
- [ ] Toasts show for actions
- [ ] Screen reader announcements work

## Final Notes

This completes the 17-prompt sequence. After implementing all prompts, you will have:

- ✅ Full type system for 8 content types
- ✅ Page shell with header and controls
- ✅ Type icon/color system
- ✅ Three view modes (Compact, Medium, Expanded)
- ✅ Type-specific preview renderers
- ✅ Empty states (3 variants)
- ✅ Search and filtering
- ✅ Multi-select and bulk mode
- ✅ Bulk action bar with AI suggestions
- ✅ Filing system with folders and tags
- ✅ Snooze functionality
- ✅ Stale items management
- ✅ Full keyboard navigation
- ✅ Responsive layout

The inbox feature is now complete and ready for use.
