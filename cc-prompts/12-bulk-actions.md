# 12 — Bulk Action Bar

## Objective

Build the floating action bar that appears when items are selected. This bar provides bulk operations (File, Tag, Snooze, Delete) and shows AI clustering suggestions.

## Prerequisites

- **11-item-selection.md** — Selection state management
- **03-type-icons.md** — Icons for actions

## What We're Building

A bottom-anchored action bar with:
- Selection count
- Primary actions: File, Tag, Snooze, Delete
- AI clustering suggestion (when applicable)
- Keyboard shortcuts hints

## Placement

| What | Where |
|------|-------|
| BulkActionBar | `src/renderer/src/components/inbox/bulk-action-bar.tsx` (NEW) |
| AISuggestion | `src/renderer/src/components/inbox/ai-cluster-suggestion.tsx` (NEW) |

## Specifications

### Bar Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   ☑ 5 selected              [📁 File] [🏷️ Tag] [🕐 Snooze] [🗑️ Delete] │
│                                                                        │
│   💡 3 similar items — "PKM articles"                   [+ Add to ▼]   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Bar Position & Animation

**Position:**
- Fixed to bottom of content area
- Full width with padding
- Above any other floating elements
- `z-index` higher than content

**Animation:**
- Slide up when items selected
- Slide down when deselected
- Smooth transition: `transform transition-transform duration-200`

---

### Primary Actions

| Action | Icon | Shortcut | Behavior |
|--------|------|----------|----------|
| File | FolderInput | `f` | Opens bulk filing panel |
| Tag | Tag | `t` | Opens tag popover |
| Snooze | Clock | `s` | Opens snooze menu |
| Delete | Trash2 | `Del/Backspace` | Confirms, then deletes |

### Action Buttons

```
[📁 File All]  [🏷️ Tag All]  [🕐 Snooze]  [🗑️ Delete]
```

- Use shadcn `Button` with icons
- Size: `sm` or `default`
- Delete button: `variant="destructive"` or red tint

---

### AI Clustering Suggestion

When the AI detects selected items are related:

```
┌─────────────────────────────────────────────────────────────┐
│  ✨ AI detected 3 more similar items                        │
│                                                             │
│  "Articles about Personal Knowledge Management"             │
│                                                             │
│  • How to Build a Second Brain                              │
│  • The Zettelkasten Method                                  │
│  • Linking Your Thinking                                    │
│                                                             │
│                      [Add All to Selection]  [Dismiss]      │
└─────────────────────────────────────────────────────────────┘
```

**Trigger:** When 2+ items selected that share:
- Same domain (for links)
- Similar tags
- Similar content (semantic matching)
- Same type with related titles

**Elements:**
- Sparkle icon (✨)
- Cluster description/label
- List of suggested items to add
- "Add All" button — adds to selection
- "Dismiss" — hides suggestion (doesn't show again for this cluster)

---

### Collapsed Suggestion

On the main bar, show collapsed hint:

```
│ ... │  💡 3 similar items — "PKM articles"  [+ Add to ▼]  │
```

Click expands to full suggestion panel above bar.

---

### Delete Confirmation

Before bulk delete, show confirmation:

```
┌────────────────────────────────────────────────┐
│  Delete 5 items?                               │
│                                                │
│  This action cannot be undone.                 │
│                                                │
│              [Cancel]  [Delete]                │
└────────────────────────────────────────────────┘
```

Use shadcn `AlertDialog` component.

---

### Keyboard Shortcut Hints

Show hints on buttons (visible on hover or always):

```
[📁 File (f)]  [🏷️ Tag (t)]  [🕐 Snooze (s)]  [🗑️ Delete (⌫)]
```

Or as tooltips.

---

### Component Props

```
interface BulkActionBarProps {
  selectedCount: number
  selectedItems: InboxItem[]
  onFileAll: () => void
  onTagAll: () => void
  onSnoozeAll: () => void
  onDeleteAll: () => void
  aiSuggestion?: ClusterSuggestion
  onAddSuggestion: () => void
  onDismissSuggestion: () => void
}

interface ClusterSuggestion {
  label: string
  items: InboxItem[]
  confidence: number
}
```

---

### Visibility Logic

```
if (selectedCount === 0) {
  return null  // Hidden
}
return <BulkActionBar ... />
```

---

### Action Flows

**File All:**
1. Click "File All" → Opens BulkFilePanel (prompt 14)
2. Select destination folder
3. All selected items filed
4. Selection cleared
5. Toast: "Filed 5 items to Research"

**Tag All:**
1. Click "Tag All" → Opens tag popover
2. Select/create tags
3. Tags applied to all selected
4. Selection preserved (tagging doesn't remove from inbox)
5. Toast: "Added 2 tags to 5 items"

**Snooze All:**
1. Click "Snooze" → Opens snooze menu
2. Select snooze time
3. Items snoozed
4. Selection cleared
5. Toast: "Snoozed 5 items until tomorrow"

**Delete All:**
1. Click "Delete" → Confirmation dialog
2. Confirm → Items deleted
3. Selection cleared
4. Toast: "Deleted 5 items" with Undo

## Design System Alignment

| Element | Style |
|---------|-------|
| Bar | `bg-background border-t shadow-lg` |
| Bar padding | `px-4 py-3` |
| Selection count | `font-medium text-foreground` |
| Action buttons | `gap-2` between them |
| AI suggestion bg | `bg-accent/50 rounded-lg p-3` |
| Sparkle icon | `text-amber-500` |

### Animation

```css
.bulk-bar-enter {
  transform: translateY(100%);
}
.bulk-bar-enter-active {
  transform: translateY(0);
  transition: transform 200ms ease-out;
}
.bulk-bar-exit-active {
  transform: translateY(100%);
  transition: transform 150ms ease-in;
}
```

## Acceptance Criteria

- [ ] Bar appears when items selected
- [ ] Bar slides up/down smoothly
- [ ] Shows correct selection count
- [ ] File button triggers filing flow
- [ ] Tag button opens tag popover
- [ ] Snooze button opens snooze menu
- [ ] Delete shows confirmation dialog
- [ ] Delete confirmation works
- [ ] AI suggestion appears when applicable
- [ ] Can add suggested items to selection
- [ ] Can dismiss AI suggestion
- [ ] Keyboard shortcuts work (f, t, s, Del)
- [ ] Toast notifications show after actions

## Next Prompt

**13-filing-data-model.md** — Define the data model for folders, tags, and item associations.
