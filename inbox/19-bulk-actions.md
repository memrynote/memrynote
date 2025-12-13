Prompt #19: Bulk Actions Bar
The Prompt
You are building the Bulk Actions Bar for Memry's inbox. This component appears when one or more items are selected, providing actions that can be applied to all selected items simultaneously. It replaces or overlays the Context Bar when active.

## What You Are Building

A floating action bar that:
1. Appears when 1+ items are selected
2. Shows the count of selected items
3. Provides bulk actions (Move, Tag, Archive, Delete)
4. Includes Select All and Deselect All controls
5. Supports keyboard shortcuts for all actions
6. Animates smoothly in and out
7. Remains accessible during scroll

## Selection Context

Selection can happen through:
- Clicking checkboxes on cards (Grid view)
- Clicking checkboxes on rows (List view)
- Shift+Click for range selection
- ⌘/Ctrl+Click for toggle selection
- ⌘/Ctrl+A for select all
- Keyboard navigation (Space to toggle)

---

## Bulk Actions Bar Position
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Header Bar                                                                                   │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Context Bar (hidden when Bulk Actions visible)                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ════════════════════════════════════════════════════════════════════════════════════════════════   │
│                                                                                                     │
│                    ┌─────────────────────────────────────────────────────────────┐                  │
│                    │                                                             │                  │
│                    │               BULK ACTIONS BAR                              │                  │
│                    │               (floating, centered)                          │                  │
│                    │                                                             │                  │
│                    └─────────────────────────────────────────────────────────────┘                  │
│                                                                                                     │
│  ════════════════════════════════════════════════════════════════════════════════════════════════   │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                               │  │
│  │                                                                                               │  │
│  │                                    Grid / List View                                           │  │
│  │                                    (items with selection state)                               │  │
│  │                                                                                               │  │
│  │                                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Quick Capture Bar                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

---

## Bulk Actions Bar Layout

### Full Layout
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                               │  │
│  │   ┌──────────────────────┐         ┌────────────────────────────────────────────┐   ┌──────┐  │  │
│  │   │                      │         │                                            │   │      │  │  │
│  │   │  ☑ 5 selected        │         │  📁 Move   🏷️ Tag   📥 Archive   🗑️ Delete │   │  ✕   │  │  │
│  │   │  Select all          │         │                                            │   │      │  │  │
│  │   │                      │         │                                            │   │      │  │  │
│  │   └──────────────────────┘         └────────────────────────────────────────────┘   └──────┘  │  │
│  │                                                                                               │  │
│  │   ▲                                ▲                                                ▲         │  │
│  │   │                                │                                                │         │  │
│  │   Selection info                   Action buttons                                   Close     │  │
│  │   + Select all link                (bulk operations)                                button    │  │
│  │                                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Container Specs
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Bulk Actions Bar Container:                                                │
│                                                                             │
│  - Position: fixed                                                          │
│  - Bottom: 24px (floats above Quick Capture)                                │
│  - Left: 50%                                                                │
│  - Transform: translateX(-50%)                                              │
│  - Min-width: 480px                                                         │
│  - Max-width: calc(100vw - 48px)                                            │
│  - Height: 56px                                                             │
│  - Background: gray-900                                                     │
│  - Border-radius: 14px                                                      │
│  - Box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24),                              │
│                0 2px 8px rgba(0, 0, 0, 0.12)                                │
│  - Z-index: 40                                                              │
│  - Display: flex                                                            │
│  - Align-items: center                                                      │
│  - Padding: 0 8px 0 16px                                                    │
│  - Gap: 16px                                                                │
│                                                                             │
│  Dark theme for contrast against page                                       │
│  Floating bottom position keeps it accessible during scroll                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Selection Info Section

### Selection Count & Controls
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │   ┌────┐                                                              │  │
│  │   │ ☑ │   5 selected   ·   Select all (156)                          │  │
│  │   │    │                    ──────────────────                        │  │
│  │   └────┘                    Link to select all                        │  │
│  │   ▲                                                                   │  │
│  │   │                                                                   │  │
│  │   Checkbox indicator                                                  │  │
│  │   (shows partial/all state)                                           │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Layout:                                                                    │
│  - Display: flex                                                            │
│  - Align-items: center                                                      │
│  - Gap: 10px                                                                │
│  - Flex-shrink: 0                                                           │
│                                                                             │
│  Checkbox indicator:                                                        │
│  - Size: 18px × 18px                                                        │
│  - Border: 2px solid gray-400                                               │
│  - Border-radius: 4px                                                       │
│  - Background: transparent                                                  │
│  - Display: flex                                                            │
│  - Align-items: center                                                      │
│  - Justify-content: center                                                  │
│                                                                             │
│  Checkbox states:                                                           │
│                                                                             │
│  ┌────┐   Some selected (partial)                                          │
│  │ ━ │   - Horizontal line (minus icon)                                    │
│  └────┘   - Color: white                                                    │
│                                                                             │
│  ┌────┐   All selected                                                      │
│  │ ✓ │   - Checkmark icon                                                  │
│  └────┘   - Background: blue-500                                            │
│           - Border-color: blue-500                                          │
│           - Checkmark: white                                                │
│                                                                             │
│  Selection count:                                                           │
│  - Font-size: 14px                                                          │
│  - Font-weight: 500                                                         │
│  - Color: white                                                             │
│                                                                             │
│  Separator (·):                                                             │
│  - Color: gray-500                                                          │
│                                                                             │
│  "Select all" link:                                                         │
│  - Font-size: 14px                                                          │
│  - Color: gray-400                                                          │
│  - Cursor: pointer                                                          │
│  - Hover: color white, underline                                            │
│  - Shows total count in parentheses                                         │
│                                                                             │
│  When all selected, shows "Deselect all" instead:                           │
│                                                                             │
│  ☑ 156 selected   ·   Deselect all                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Action Buttons Section

### Action Button Group
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │  │
│  │   │            │  │            │  │            │  │            │      │  │
│  │   │  📁 Move   │  │  🏷️ Tag   │  │ 📥 Archive │  │  🗑️ Delete │      │  │
│  │   │            │  │            │  │            │  │            │      │  │
│  │   └────────────┘  └────────────┘  └────────────┘  └────────────┘      │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Container:                                                                 │
│  - Display: flex                                                            │
│  - Gap: 4px                                                                 │
│  - Flex: 1                                                                  │
│  - Justify-content: center                                                  │
│                                                                             │
│  Action button:                                                             │
│  - Height: 40px                                                             │
│  - Padding: 0 14px                                                          │
│  - Border-radius: 8px                                                       │
│  - Background: gray-800                                                     │
│  - Border: none                                                             │
│  - Color: white                                                             │
│  - Font-size: 13px                                                          │
│  - Font-weight: 500                                                         │
│  - Display: flex                                                            │
│  - Align-items: center                                                      │
│  - Gap: 8px                                                                 │
│  - Cursor: pointer                                                          │
│  - Transition: background 100ms, transform 100ms                            │
│                                                                             │
│  Icon:                                                                      │
│  - Size: 16px                                                               │
│  - Color: gray-400 (default), white (hover)                                 │
│                                                                             │
│  States:                                                                    │
│  ────────                                                                   │
│                                                                             │
│  Default:                                                                   │
│  - Background: gray-800                                                     │
│  - Icon: gray-400                                                           │
│  - Text: white                                                              │
│                                                                             │
│  Hover:                                                                     │
│  - Background: gray-700                                                     │
│  - Icon: white                                                              │
│                                                                             │
│  Active (pressed):                                                          │
│  - Background: gray-600                                                     │
│  - Transform: scale(0.98)                                                   │
│                                                                             │
│  Delete button (special):                                                   │
│  - Default: Same as others                                                  │
│  - Hover: Background: red-600/30, Icon: red-400, Text: red-300              │
│                                                                             │
│  Focus (keyboard):                                                          │
│  - Ring: 2px, offset: 2px, white                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Action Buttons Reference

| Action | Icon | Shortcut | Description |
|--------|------|----------|-------------|
| Move | 📁 Folder | `M` | Move selected items to a folder |
| Tag | 🏷️ Tag | `T` | Add/remove tags from selected items |
| Archive | 📥 Archive | `E` | Archive selected items |
| Delete | 🗑️ Trash | `Delete` / `Backspace` | Delete selected items |

---

## Close Button
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │   ┌────────┐                                                          │  │
│  │   │        │                                                          │  │
│  │   │   ✕    │   Close / Deselect all                                   │  │
│  │   │        │                                                          │  │
│  │   └────────┘                                                          │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Button:                                                                    │
│  - Size: 40px × 40px                                                        │
│  - Border-radius: 8px                                                       │
│  - Background: transparent                                                  │
│  - Border: none                                                             │
│  - Color: gray-400                                                          │
│  - Cursor: pointer                                                          │
│  - Flex-shrink: 0                                                           │
│                                                                             │
│  Icon:                                                                      │
│  - Size: 18px                                                               │
│  - ✕ (X mark)                                                              │
│                                                                             │
│  Hover:                                                                     │
│  - Background: gray-800                                                     │
│  - Color: white                                                             │
│                                                                             │
│  Action: Clears all selection (same as Escape key)                          │
│                                                                             │
│  Tooltip: "Clear selection (Esc)"                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Dropdown Menus

### Move Dropdown

When "Move" is clicked:
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         ┌───────────────────────────────────┐               │
│                         │                                   │               │
│                         │  Move to                          │               │
│                         │  ───────                          │               │
│                         │                                   │               │
│                         │  🔍 Search folders...             │               │
│                         │                                   │               │
│                         │  ─────────────────────────────    │               │
│                         │                                   │               │
│                         │  📁  Work                         │               │
│                         │  📁  Personal                     │               │
│                         │  📁  Research                     │               │
│                         │  📁  Archive                      │               │
│                         │  📁  Projects                     │               │
│                         │      └── Design System            │               │
│                         │      └── Mobile App               │               │
│                         │                                   │               │
│                         │  ─────────────────────────────    │               │
│                         │                                   │               │
│                         │  + Create new folder              │               │
│                         │                                   │               │
│                         └───────────────────────────────────┘               │
│                                        ▲                                    │
│  ┌────────────────────────────────────┬┴────────────────────────────────┐   │
│  │  ☑ 5 selected  ·  Select all  │  📁 Move   🏷️ Tag  ...            │   │
│  └────────────────────────────────────┴─────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Dropdown specs:

Position: Above the button, centered
Width: 280px
Max-height: 320px
Background: gray-800
Border: 1px solid gray-700
Border-radius: 12px
Box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3)
Overflow-y: auto

Header:

Padding: 12px 14px
Font-size: 13px
Font-weight: 600
Color: gray-300
Border-bottom: 1px solid gray-700

Search input:

Margin: 8px 12px
Height: 36px
Background: gray-900
Border: 1px solid gray-700
Border-radius: 6px
Padding: 0 12px 0 36px
Font-size: 13px
Color: white
Placeholder: gray-500
Search icon: 14px, gray-500

Folder items:

Padding: 10px 14px
Display: flex
Align-items: center
Gap: 10px
Cursor: pointer
Color: gray-200
Hover: background gray-700

Nested folders:

Padding-left increases by 24px per level
Indentation shows hierarchy

"Create new folder":

Color: blue-400
Icon: + plus
Hover: color blue-300
Opens folder creation flow


### Tag Dropdown

When "Tag" is clicked:
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                              ┌───────────────────────────────────┐          │
│                              │                                   │          │
│                              │  Tags                             │          │
│                              │  ────                             │          │
│                              │                                   │          │
│                              │  🔍 Search or create tag...       │          │
│                              │                                   │          │
│                              │  ─────────────────────────────    │          │
│                              │                                   │          │
│                              │  ☑  #design      (all have)       │          │
│                              │  ━  #work        (some have)      │          │
│                              │  ☐  #research                     │          │
│                              │  ☐  #ideas                        │          │
│                              │  ☐  #personal                     │          │
│                              │  ☐  #reading                      │          │
│                              │                                   │          │
│                              │  ─────────────────────────────    │          │
│                              │                                   │          │
│                              │  + Create "#newta..."             │          │
│                              │                                   │          │
│                              │  ─────────────────────────────    │          │
│                              │                                   │          │
│                              │          [ Apply ]                │          │
│                              │                                   │          │
│                              └───────────────────────────────────┘          │
│                                        ▲                                    │
│  ┌────────────────────────────────────┬┴────────────────────────────────┐   │
│  │  ☑ 5 selected  ·  Select all  │  📁 Move   🏷️ Tag  ...            │   │
│  └────────────────────────────────────┴─────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Tag states for bulk selection:
────────────────────────────────
☑ All selected items have this tag

Checkbox: filled, blue-500 background
Clicking removes tag from ALL selected items

━ Some selected items have this tag (mixed)

Checkbox: horizontal line (partial indicator)
Clicking adds tag to items that don't have it

☐ No selected items have this tag

Checkbox: empty
Clicking adds tag to ALL selected items

Tag item:

Padding: 10px 14px
Display: flex
Align-items: center
Gap: 10px
Cursor: pointer
Color: gray-200
Hover: background gray-700

"(all have)" / "(some have)" indicator:

Font-size: 11px
Color: gray-500
Margin-left: auto

"Create tag" option:

Shows when search doesn't match existing tag
Color: blue-400

Apply button:

Full width minus padding
Height: 36px
Background: blue-600
Color: white
Border-radius: 6px
Hover: background blue-500

Note: Consider auto-applying changes without Apply button
for simpler UX (changes happen on click)

---

## Delete Confirmation

### Delete Confirmation Dialog
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                                                             │
│                    ┌─────────────────────────────────────────┐              │
│                    │                                         │              │
│                    │            🗑️                           │              │
│                    │                                         │              │
│                    │     Delete 5 items?                     │              │
│                    │                                         │              │
│                    │     This action cannot be undone.       │              │
│                    │     The items will be permanently       │              │
│                    │     removed from your inbox.            │              │
│                    │                                         │              │
│                    │     ┌─────────────────────────────┐     │              │
│                    │     │ ☐ Don't ask me again        │     │              │
│                    │     └─────────────────────────────┘     │              │
│                    │                                         │              │
│                    │     ┌───────────┐  ┌────────────────┐   │              │
│                    │     │  Cancel   │  │  Delete items  │   │              │
│                    │     └───────────┘  └────────────────┘   │              │
│                    │                                         │              │
│                    └─────────────────────────────────────────┘              │
│                                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Dialog:

Width: 400px
Background: white
Border-radius: 16px
Padding: 32px 24px 24px
Box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2)
Z-index: 60
Centered in viewport

Icon:

Size: 48px
Color: red-500

Title:

Font-size: 18px
Font-weight: 600
Color: gray-900
Margin-top: 16px

Description:

Font-size: 14px
Color: gray-600
Line-height: 1.5
Margin-top: 8px
Text-align: center

"Don't ask again" checkbox:

Margin-top: 20px
Font-size: 13px
Color: gray-500

Buttons:

Margin-top: 24px
Display: flex
Gap: 12px
Justify-content: center

Cancel button:

Height: 40px
Padding: 0 20px
Background: white
Border: 1px solid gray-200
Border-radius: 8px
Color: gray-700
Hover: background gray-50

Delete button:

Height: 40px
Padding: 0 20px
Background: red-600
Border: none
Border-radius: 8px
Color: white
Hover: background red-700
Focus: ring-2 red-500

Backdrop:

Position: fixed
Inset: 0
Background: black/50
Z-index: 59
Click to cancel


---

## Keyboard Shortcuts

### Shortcut Reference
```typescript
const BULK_ACTION_SHORTCUTS = {
  // Selection
  'Escape': 'Clear all selection',
  'Cmd/Ctrl+A': 'Select all visible items',
  'Cmd/Ctrl+Shift+A': 'Deselect all',

  // Actions (when items selected)
  'm': 'Open Move menu',
  't': 'Open Tag menu',
  'e': 'Archive selected items',
  'Delete': 'Delete selected items',
  'Backspace': 'Delete selected items',

  // Navigation
  'Tab': 'Cycle through action buttons',
  'Enter': 'Activate focused button',
  'ArrowLeft': 'Previous action button',
  'ArrowRight': 'Next action button',
};
```

### Keyboard Handler
```typescript
function useBulkActionsKeyboard(
  selectedIds: Set<string>,
  onMove: () => void,
  onTag: () => void,
  onArchive: () => void,
  onDelete: () => void,
  onClearSelection: () => void,
  onSelectAll: () => void
) {
  useEffect(() => {
    if (selectedIds.size === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClearSelection();
          break;

        case 'm':
          e.preventDefault();
          onMove();
          break;

        case 't':
          e.preventDefault();
          onTag();
          break;

        case 'e':
          e.preventDefault();
          onArchive();
          break;

        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          onDelete();
          break;

        case 'a':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (e.shiftKey) {
              onClearSelection();
            } else {
              onSelectAll();
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds.size, onMove, onTag, onArchive, onDelete, onClearSelection, onSelectAll]);
}
```

---

## Animation

### Bar Enter Animation
```css
@keyframes bulkBarEnter {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

.bulk-actions-bar {
  animation: bulkBarEnter 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
  /* Slight overshoot for playful feel */
}
```

### Bar Exit Animation
```css
@keyframes bulkBarExit {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.95);
  }
}

.bulk-actions-bar.exiting {
  animation: bulkBarExit 150ms ease-in forwards;
}
```

### Selection Count Animation
```css
/* Animate count changes */
.selection-count {
  display: inline-flex;
  transition: transform 100ms ease;
}

.selection-count.updating {
  transform: scale(1.1);
}

/* Or use a spring animation */
@keyframes countPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.selection-count.changed {
  animation: countPop 200ms ease;
}
```

### Dropdown Animation
```css
@keyframes dropdownEnter {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.bulk-dropdown {
  animation: dropdownEnter 150ms ease-out;
  transform-origin: bottom center;
}
```

---

## Processing State

### While Actions Are Processing
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │   ⟳ Processing 5 items...                                             │  │
│  │                                                                       │  │
│  │   ════════════════════════════════════░░░░░░░░░░░░░░░░                │  │
│  │   Progress bar (optional for longer operations)                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Processing state:                                                          │
│  - Spinner icon replaces checkbox                                           │
│  - "Processing X items..." text                                             │
│  - Action buttons disabled                                                  │
│  - Close button hidden                                                      │
│  - Optional progress bar for bulk operations                                │
│                                                                             │
│  Spinner:                                                                   │
│  - Size: 18px                                                               │
│  - Color: white                                                             │
│  - Animation: spin 1s linear infinite                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Success State (Brief)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │   ✓ 5 items archived                                         [ Undo ] │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Success state:                                                             │
│  - Green checkmark icon                                                     │
│  - Success message                                                          │
│  - Undo button (where applicable)                                           │
│  - Auto-dismisses after 3 seconds                                           │
│  - Or stays until clicked away                                              │
│                                                                             │
│  Checkmark:                                                                 │
│  - Size: 18px                                                               │
│  - Color: green-400                                                         │
│  - Optional: animate in with scale                                          │
│                                                                             │
│  "Undo" button:                                                             │
│  - Ghost style                                                              │
│  - Color: white                                                             │
│  - Border: 1px solid gray-600                                               │
│  - Hover: background gray-700                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Props Interface
```typescript
interface BulkActionsBarProps {
  // Selection state
  selectedIds: Set<string>;
  totalItemCount: number;

  // Selection controls
  onSelectAll: () => void;
  onClearSelection: () => void;

  // Actions
  onMove: (folderIds: string[], itemIds: string[]) => Promise<void>;
  onTag: (tagsToAdd: string[], tagsToRemove: string[], itemIds: string[]) => Promise<void>;
  onArchive: (itemIds: string[]) => Promise<void>;
  onDelete: (itemIds: string[]) => Promise<void>;

  // Undo
  onUndo: (() => void) | null;  // null if undo not available

  // Folder/tag data for dropdowns
  folders: Folder[];
  availableTags: string[];
  selectedItemsTags: Map<string, Set<string>>;  // itemId -> tags

  // Settings
  confirmDelete: boolean;  // Show confirmation dialog
  onUpdateConfirmDelete: (value: boolean) => void;

  // Processing state
  isProcessing: boolean;
  processingMessage?: string;
}

interface Folder {
  id: string;
  name: string;
  parentId?: string;
  children?: Folder[];
}
```

---

## State Management

### Selection State Hook
```typescript
interface SelectionState {
  selectedIds: Set<string>;
  lastSelectedId: string | null;  // For shift+click range
}

function useSelection(items: InboxItem[]) {
  const [state, setState] = useState<SelectionState>({
    selectedIds: new Set(),
    lastSelectedId: null,
  });

  const isAllSelected = useMemo(
    () => state.selectedIds.size === items.length && items.length > 0,
    [state.selectedIds.size, items.length]
  );

  const isSomeSelected = useMemo(
    () => state.selectedIds.size > 0 && state.selectedIds.size < items.length,
    [state.selectedIds.size, items.length]
  );

  const toggleSelection = useCallback((id: string, shiftKey = false) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedIds);

      if (shiftKey && prev.lastSelectedId) {
        // Range selection
        const lastIndex = items.findIndex(i => i.id === prev.lastSelectedId);
        const currentIndex = items.findIndex(i => i.id === id);

        const [start, end] = [lastIndex, currentIndex].sort((a, b) => a - b);

        for (let i = start; i <= end; i++) {
          newSelected.add(items[i].id);
        }
      } else {
        // Toggle single item
        if (newSelected.has(id)) {
          newSelected.delete(id);
        } else {
          newSelected.add(id);
        }
      }

      return {
        selectedIds: newSelected,
        lastSelectedId: id,
      };
    });
  }, [items]);

  const selectAll = useCallback(() => {
    setState({
      selectedIds: new Set(items.map(i => i.id)),
      lastSelectedId: null,
    });
  }, [items]);

  const clearSelection = useCallback(() => {
    setState({
      selectedIds: new Set(),
      lastSelectedId: null,
    });
  }, []);

  return {
    selectedIds: state.selectedIds,
    selectedCount: state.selectedIds.size,
    isAllSelected,
    isSomeSelected,
    toggleSelection,
    selectAll,
    clearSelection,
  };
}
```

### Bulk Action Handlers
```typescript
function useBulkActions(
  selectedIds: Set<string>,
  clearSelection: () => void
) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<{
    type: string;
    itemIds: string[];
    previousState: any;
  } | null>(null);

  const handleBulkMove = async (folderId: string) => {
    setIsProcessing(true);
    try {
      const itemIds = Array.from(selectedIds);
      // Store previous state for undo
      const previousFolders = await getPreviousFolders(itemIds);

      await api.moveItems(itemIds, folderId);

      setLastAction({
        type: 'move',
        itemIds,
        previousState: previousFolders,
      });

      clearSelection();
      showToast(`${itemIds.length} items moved`);
    } catch (error) {
      showToast('Failed to move items', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkTag = async (tagsToAdd: string[], tagsToRemove: string[]) => {
    setIsProcessing(true);
    try {
      const itemIds = Array.from(selectedIds);

      await api.updateTags(itemIds, tagsToAdd, tagsToRemove);

      clearSelection();
      showToast(`Tags updated for ${itemIds.length} items`);
    } catch (error) {
      showToast('Failed to update tags', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkArchive = async () => {
    setIsProcessing(true);
    try {
      const itemIds = Array.from(selectedIds);

      await api.archiveItems(itemIds);

      setLastAction({
        type: 'archive',
        itemIds,
        previousState: null,
      });

      clearSelection();
      showToast(`${itemIds.length} items archived`);
    } catch (error) {
      showToast('Failed to archive items', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      const itemIds = Array.from(selectedIds);

      await api.deleteItems(itemIds);

      // No undo for delete
      setLastAction(null);

      clearSelection();
      showToast(`${itemIds.length} items deleted`);
    } catch (error) {
      showToast('Failed to delete items', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndo = async () => {
    if (!lastAction) return;

    setIsProcessing(true);
    try {
      if (lastAction.type === 'move') {
        // Move items back to their original folders
        await api.restoreFolders(lastAction.itemIds, lastAction.previousState);
      } else if (lastAction.type === 'archive') {
        // Unarchive items
        await api.unarchiveItems(lastAction.itemIds);
      }

      setLastAction(null);
      showToast('Action undone');
    } catch (error) {
      showToast('Failed to undo', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleBulkMove,
    handleBulkTag,
    handleBulkArchive,
    handleBulkDelete,
    handleUndo: lastAction ? handleUndo : null,
  };
}
```

---

## Accessibility

### ARIA Attributes
```html
<div
  role="toolbar"
  aria-label="Bulk actions for selected items"
  aria-controls="inbox-items-list"
>
  <div role="group" aria-label="Selection info">
    <span aria-live="polite">
      {selectedCount} items selected
    </span>
    <button aria-label={isAllSelected ? "Deselect all items" : `Select all ${totalCount} items`}>
      {isAllSelected ? "Deselect all" : `Select all (${totalCount})`}
    </button>
  </div>

  <div role="group" aria-label="Actions">
    <button
      aria-label="Move selected items to folder"
      aria-haspopup="menu"
      aria-expanded={isMoveMenuOpen}
    >
      <FolderIcon aria-hidden="true" />
      Move
    </button>

    <button
      aria-label="Add or remove tags from selected items"
      aria-haspopup="menu"
      aria-expanded={isTagMenuOpen}
    >
      <TagIcon aria-hidden="true" />
      Tag
    </button>

    <button aria-label="Archive selected items">
      <ArchiveIcon aria-hidden="true" />
      Archive
    </button>

    <button aria-label="Delete selected items">
      <TrashIcon aria-hidden="true" />
      Delete
    </button>
  </div>

  <button aria-label="Clear selection">
    <XIcon aria-hidden="true" />
  </button>
</div>
```

### Focus Management

1. When bar appears: Don't auto-focus (user may continue selecting)
2. When Tab pressed: Cycle through action buttons
3. When menu opens: Focus first menu item
4. When menu closes: Return focus to trigger button
5. When bar closes: Return focus to last selected item

---

## Responsive Behavior

### Desktop (> 768px)

Full layout as shown above.

### Tablet (640px - 768px)
┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                         │  │
│  │   ☑ 5 selected           📁   🏷️   📥   🗑️                       ✕    │  │
│  │      Select all                                                         │  │
│  │                                                                         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  Changes:                                                                     │
│  - Hide text labels on action buttons (icon only)                             │
│  - Tooltips show labels on hover                                              │
│  - Narrower minimum width                                                     │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

### Mobile (< 640px)
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  ☑ 5   📁  🏷️  📥  🗑️      ✕   │    │
│  │     ▲                           │    │
│  │     │                           │    │
│  │  Short count                    │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Changes:                               │
│  - Very compact layout                  │
│  - Just count number (not "selected")   │
│  - No "Select all" link (use ⌘A)        │
│  - Icons only for actions               │
│  - Smaller button sizes                 │
│  - Min-width: 280px                     │
│  - Height: 48px                         │
│                                         │
└─────────────────────────────────────────┘

---

## Verification Checklist

After building, verify:
☐ Bar appears when 1+ items selected
☐ Bar disappears when all items deselected
☐ Selection count updates correctly
☐ Checkbox indicator shows partial (━) vs all (✓) state
☐ "Select all" link works and shows total count
☐ "Deselect all" appears when all selected
☐ Move button opens folder dropdown
☐ Folder dropdown has search functionality
☐ Folder dropdown shows nested structure
☐ Tag button opens tag dropdown
☐ Tags show correct state (all/some/none have)
☐ Clicking tag toggles correctly for all items
☐ Archive button archives all selected items
☐ Delete button shows confirmation dialog
☐ Delete confirmation has "don't ask again" option
☐ Close button clears selection
☐ Escape key clears selection
☐ All keyboard shortcuts work (M, T, E, Delete)
☐ ⌘/Ctrl+A selects all
☐ Processing state shows spinner and disables buttons
☐ Success state shows with undo option
☐ Undo works for reversible actions
☐ Enter/exit animations are smooth
☐ Responsive layouts work at all breakpoints
☐ Screen readers announce selection changes
☐ Focus management works correctly

## Output

Create a React component called BulkActionsBar that accepts the props defined above. Use Tailwind CSS for styling.

The component should:
1. Render the floating action bar when items are selected
2. Show selection count with checkbox indicator
3. Include all action buttons (Move, Tag, Archive, Delete)
4. Open appropriate dropdown menus for Move and Tag
5. Show confirmation dialog for Delete
6. Handle keyboard shortcuts
7. Show processing and success states
8. Animate smoothly on enter/exit

Also create supporting components:
- MoveDropdown for the folder selection menu
- TagDropdown for the tag management menu
- DeleteConfirmDialog for delete confirmation

Implementation Notes
Key Techniques Used:
TechniqueWhyFixed bottom positionAlways accessible, doesn't interfere with contentDark themeHigh contrast, clearly different from page contentPartial checkbox stateShows when selection is mixedKeyboard shortcutsPower users expect quick actionsUndo supportReduces anxiety about bulk operations
Design Choices:

Floating bottom bar — Keeps actions accessible while scrolling. User can select items anywhere and immediately act.
Dark theme — Creates clear visual separation from page. Users immediately see something is "active."
Checkbox indicator states — Partial (━) vs full (✓) helps users understand selection state at a glance.
Tag dropdown with mixed state — When some items have a tag and others don't, show that clearly. User can add to all or remove from all.
Delete confirmation with "don't ask again" — Protects users from accidents, but power users can skip it.
Undo for reversible actions — Move and archive can be undone. Delete cannot (data is gone).


Expected Output Structure
jsx// BulkActionsBar.tsx
<div
  className={`bulk-actions-bar ${isExiting ? 'exiting' : ''}`}
  role="toolbar"
  aria-label="Bulk actions for selected items"
>
  {/* Selection Info */}
  <div className="selection-info">
    <div className="checkbox-indicator">
      {isAllSelected ? <CheckIcon /> : <MinusIcon />}
    </div>
    <span className="selection-count">
      {selectedCount} selected
    </span>
    <span className="separator">·</span>
    <button
      className="select-toggle"
      onClick={isAllSelected ? onClearSelection : onSelectAll}
    >
      {isAllSelected ? 'Deselect all' : `Select all (${totalCount})`}
    </button>
  </div>

  {/* Action Buttons */}
  <div className="action-buttons">
    <button
      className="action-btn"
      onClick={() => setIsMoveOpen(true)}
      disabled={isProcessing}
    >
      <FolderIcon />
      <span>Move</span>
    </button>

    <button
      className="action-btn"
      onClick={() => setIsTagOpen(true)}
      disabled={isProcessing}
    >
      <TagIcon />
      <span>Tag</span>
    </button>

    <button
      className="action-btn"
      onClick={handleArchive}
      disabled={isProcessing}
    >
      <ArchiveIcon />
      <span>Archive</span>
    </button>

    <button
      className="action-btn delete-btn"
      onClick={() => setIsDeleteOpen(true)}
      disabled={isProcessing}
    >
      <TrashIcon />
      <span>Delete</span>
    </button>
  </div>

  {/* Close Button */}
  <button
    className="close-btn"
    onClick={onClearSelection}
    aria-label="Clear selection"
  >
    <XIcon />
  </button>

  {/* Dropdowns */}
  {isMoveOpen && (
    <MoveDropdown
      folders={folders}
      onSelect={handleMove}
      onClose={() => setIsMoveOpen(false)}
    />
  )}

  {isTagOpen && (
    <TagDropdown
      availableTags={availableTags}
      selectedItemsTags={selectedItemsTags}
      onApply={handleTag}
      onClose={() => setIsTagOpen(false)}
    />
  )}

  {/* Delete Confirmation */}
  {isDeleteOpen && (
    <DeleteConfirmDialog
      itemCount={selectedCount}
      onConfirm={handleDelete}
      onCancel={() => setIsDeleteOpen(false)}
      showDontAskAgain={true}
    />
  )}
</div>

// Processing/Success overlay
{isProcessing && (
  <div className="processing-overlay">
    <Spinner />
    <span>Processing {selectedCount} items...</span>
  </div>
)}

{showSuccess && (
  <div className="success-overlay">
    <CheckIcon className="success-icon" />
    <span>{successMessage}</span>
    {onUndo && (
      <button onClick={onUndo}>Undo</button>
    )}
  </div>
)}

Usage Guidelines

Test selection states — Select 1, some, and all items. Verify indicator changes.
Test range selection — Shift+click to select range
Test keyboard shortcuts — M, T, E, Delete, Escape, ⌘A
Test Move dropdown — Search folders, select nested folder
Test Tag dropdown — Verify mixed state shows correctly
Test Delete confirmation — Cancel, confirm, "don't ask again"
Test undo — Archive items, then undo
Test responsive — Verify compact layout on mobile