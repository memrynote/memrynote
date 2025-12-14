# 16 — Stale Items Section

## Objective

Build a warning section that highlights items sitting in the inbox for more than 7 days. This encourages users to process old items and provides batch actions for quick cleanup.

## Prerequisites

- **01-inbox-types.md** — Item types with timestamps
- **13-filing-data-model.md** — Unsorted folder concept

## What We're Building

1. **Stale Detection** — Logic to identify old items
2. **Stale Section** — Visual warning area
3. **Batch Actions** — Quick file/delete for stale items

## Placement

| What | Where |
|------|-------|
| StaleSection | `src/renderer/src/components/inbox/stale-section.tsx` (NEW) |
| Stale utils | `src/renderer/src/lib/stale-utils.ts` (NEW) |

## Specifications

### Stale Definition

An item is "stale" when:
- `createdAt` is more than 7 days ago
- AND `folderId` is null (unfiled)
- AND `snoozedUntil` is null or expired (not actively snoozed)

```
function isStale(item: InboxItem): boolean {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  return (
    item.createdAt < sevenDaysAgo &&
    item.folderId === null &&
    (!item.snoozedUntil || item.snoozedUntil <= new Date())
  )
}
```

---

### Stale Section Layout

Appears at bottom of inbox, below regular items:

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  [Regular inbox items above...]                                      │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────   │
│                                                                      │
│  ⚠️  Items older than 7 days (4)                                     │
│                                                                      │
│  These items have been sitting in your inbox. Consider filing        │
│  or deleting them.                                                   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  □  🔗  Old article from last month                  12d ago   │  │
│  │  □  📝  Random note                                   8d ago   │  │
│  │  □  🖼️  Screenshot                                    9d ago   │  │
│  │  □  🎤  Voice memo                                   14d ago   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│              [📁 File All to Unsorted]  [Review One by One]          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Section Header

```
⚠️  Items older than 7 days (4)
```

- Warning icon (⚠️ or AlertTriangle)
- Count of stale items
- Yellow/amber styling

---

### Helper Text

```
These items have been sitting in your inbox. Consider filing or deleting them.
```

Brief message explaining why items are highlighted.

---

### Stale Items List

Renders items in compact format:
- Same as compact view rows
- Shows age instead of normal timestamp: "12d ago"
- Sorted oldest first (most stale at top)

---

### Batch Actions

Two primary actions:

**1. File All to Unsorted**
```
[📁 File All to Unsorted]
```
- Files all stale items to the "Unsorted" folder
- Quick cleanup without deciding on destination
- Toast: "Filed 4 items to Unsorted"
- Items removed from inbox

**2. Review One by One**
```
[Review One by One]
```
- Enters sequential review mode
- Opens first stale item in preview
- Next/Skip navigation to go through each
- Each item: File or Delete decision

---

### Sequential Review Mode

When "Review One by One" clicked:

```
┌────────────────────────────────────────────────────────────────┐
│  Review stale items (1 of 4)                                   │
│  ─────────────────────────────────────────────────────────     │
│                                                                │
│  [Full item preview - expanded view style]                     │
│                                                                │
│  ─────────────────────────────────────────────────────────     │
│                                                                │
│    [Skip]     [🗑️ Delete]     [📁 File]     [Done]            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Actions:**
- **Skip** — Move to next item without action
- **Delete** — Delete current, move to next
- **File** — Open filing panel, then next
- **Done** — Exit review mode

**Progress indicator:** "1 of 4"

---

### Section Visibility

```
// Only show section if stale items exist
const staleItems = items.filter(isStale)

if (staleItems.length === 0) {
  return null
}
```

---

### Collapsible Behavior

Section can be collapsed to reduce visual noise:

```
▾ ⚠️ Items older than 7 days (4)     [Collapse]
```

**Collapsed state:**
```
▸ ⚠️ 4 stale items                   [Expand]
```

Collapsed state persisted (localStorage).

---

### Stale Timestamp Display

Show age relative to 7-day threshold:

| Age | Display |
|-----|---------|
| 7-8 days | "7d ago" |
| 8-14 days | "Xd ago" |
| 14+ days | "2w ago" |
| 30+ days | "1mo ago" |

Color intensity increases with age (optional):
- 7-14 days: normal
- 14-30 days: slightly bolder
- 30+ days: more prominent

---

### Utilities

```
// Detection
isStale(item: InboxItem, thresholdDays?: number): boolean
getStaleItems(items: InboxItem[]): InboxItem[]
getNonStaleItems(items: InboxItem[]): InboxItem[]

// Stats
getStaleCount(items: InboxItem[]): number
getOldestStaleItem(items: InboxItem[]): InboxItem | null
getStaleAgeDistribution(items: InboxItem[]): { [age: string]: number }

// Actions
fileAllToUnsorted(items: InboxItem[], unsortedFolderId: string): void
```

---

### Integration with Views

The StaleSection is rendered separately from the main view:

```
<div className="flex-1 overflow-y-auto">
  {viewMode === 'compact' && <CompactView items={nonStaleItems} />}
  {viewMode === 'medium' && <MediumView items={nonStaleItems} />}
  {viewMode === 'expanded' && <ExpandedView items={nonStaleItems} />}

  {staleItems.length > 0 && (
    <StaleSection items={staleItems} />
  )}
</div>
```

## Design System Alignment

| Element | Style |
|---------|-------|
| Section bg | `bg-amber-50/50 border border-amber-200 rounded-lg` |
| Warning icon | `text-amber-600` |
| Header text | `text-amber-800 font-medium` |
| Helper text | `text-amber-700 text-sm` |
| Item list | `bg-background rounded-md` inside amber container |
| Action buttons | `variant="outline"` with amber tint |

### Amber Warning Palette

```
bg: bg-amber-50
border: border-amber-200
icon: text-amber-600
heading: text-amber-800
text: text-amber-700
```

## Acceptance Criteria

- [ ] `isStale()` correctly identifies 7+ day items
- [ ] Stale section only shows when items exist
- [ ] Shows count of stale items
- [ ] Warning styling (amber colors)
- [ ] Items listed oldest first
- [ ] Timestamps show "Xd ago" format
- [ ] "File All to Unsorted" works
- [ ] "Review One by One" enters review mode
- [ ] Review mode shows progress (X of Y)
- [ ] Skip/Delete/File actions work in review
- [ ] Section is collapsible
- [ ] Collapsed state persisted
- [ ] Section below regular items

## Next Prompt

**17-keyboard-integration.md** — Add keyboard shortcuts and final page integration.
