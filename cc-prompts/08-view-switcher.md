# 08 — View Mode Switcher

## Objective

Build the toggle component that lets users switch between Compact, Medium, and Expanded views. This component lives in the header bar and controls which view is rendered.

## Prerequisites

- **02-page-shell.md** — Header bar structure
- **04-compact-view.md** — Compact view
- **05-medium-view.md** — Medium view
- **07-expanded-view.md** — Expanded view

## What We're Building

A three-way toggle component that:
- Shows three view options as icon buttons
- Indicates current selection
- Triggers view change on click
- Integrates into the header bar

## Placement

| What | Where |
|------|-------|
| ViewSwitcher component | `src/renderer/src/components/inbox/view-switcher.tsx` (NEW) |
| Integration | Used in `inbox-header.tsx` |

## Specifications

### Toggle Layout

```
┌─────────────────────────────┐
│  [≡]  [▤]  [▦]              │
│   │    │    │               │
│   │    │    └─ Expanded     │
│   │    └─ Medium (default)  │
│   └─ Compact                │
└─────────────────────────────┘
```

### Button States

**Default (unselected):**
- Background: transparent
- Icon: `text-muted-foreground`

**Selected (active):**
- Background: `bg-accent`
- Icon: `text-foreground`
- Subtle border or ring

**Hover:**
- Background: `bg-accent/50`

### Icons

| View | Icon | Description |
|------|------|-------------|
| Compact | `List` | Horizontal lines (list) |
| Medium | `LayoutList` | Stacked cards |
| Expanded | `Rows3` or `Square` | Large cards |

### Component Props

```
interface ViewSwitcherProps {
  value: 'compact' | 'medium' | 'expanded'
  onChange: (view: ViewMode) => void
  className?: string
}
```

### Integration with Page

The InboxPage manages `viewMode` state and passes it to:
1. ViewSwitcher (for display/control)
2. Content area (for rendering correct view)

```
// In InboxPage
const [viewMode, setViewMode] = useState<ViewMode>('medium')

// In header
<ViewSwitcher value={viewMode} onChange={setViewMode} />

// In content
{viewMode === 'compact' && <CompactView items={items} />}
{viewMode === 'medium' && <MediumView items={items} />}
{viewMode === 'expanded' && <ExpandedView items={items} />}
```

### Keyboard Shortcut

- `V` key cycles through views: Compact → Medium → Expanded → Compact
- Hint shown in tooltip: "Press V to switch view"

### Tooltip Labels

Each button shows tooltip on hover:
- Compact: "Compact view"
- Medium: "Default view"
- Expanded: "Expanded view"

### Using shadcn ToggleGroup

Build using shadcn's `ToggleGroup` component:

```
<ToggleGroup type="single" value={value} onValueChange={onChange}>
  <ToggleGroupItem value="compact" aria-label="Compact view">
    <List className="size-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="medium" aria-label="Medium view">
    <LayoutList className="size-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="expanded" aria-label="Expanded view">
    <Rows3 className="size-4" />
  </ToggleGroupItem>
</ToggleGroup>
```

### Accessibility

- Each button has `aria-label`
- `role="tablist"` on container
- Selected button has `aria-selected="true"`
- Keyboard navigation with arrow keys

## Design System Alignment

| Element | Style |
|---------|-------|
| Toggle group | `gap-1` between items |
| Toggle item | `size-9` (36px) |
| Icons | `size-4` (16px) |
| Selected bg | `bg-accent` |
| Hover bg | `bg-accent/50` |
| Border radius | `rounded-md` |

### Position in Header

```
│  Inbox  [badge]  [spacer]  [Search]  [Filters]  [ViewSwitcher]  │
```

Right-aligned in the header's control section.

## Acceptance Criteria

- [ ] ViewSwitcher renders 3 toggle buttons
- [ ] Correct icon for each view
- [ ] Selected state visually distinct
- [ ] Clicking toggles changes view
- [ ] onChange callback fires with new value
- [ ] Tooltips show view names
- [ ] Works with keyboard (arrow keys)
- [ ] Accessible with proper ARIA labels
- [ ] Integrates into header bar
- [ ] V key shortcut works (if keyboard system ready)

## Next Prompt

**09-empty-states.md** — Build the three empty state variants for the inbox.
