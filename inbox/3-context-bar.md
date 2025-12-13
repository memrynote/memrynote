Prompt #3: Context Bar
The Prompt
You are building the Context Bar component for Memry's inbox page. This component lives inside Zone 2 of the page layout shell (the sticky 48px bar below the header).

## What You Are Building

A horizontal bar that displays the current view title, item count with "new today" indicator, and a process/bulk action dropdown. This bar provides context about what the user is viewing and quick access to batch operations.

## Context Bar Layout

┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                   │
│   ┌─────────────────────────────────────────────────────────┐    ┌─────────────────────────────┐  │
│   │                                                         │    │                             │  │
│   │   LEFT SECTION                                          │    │   RIGHT SECTION             │  │
│   │   Icon + Title + Count Badge                            │    │   Process Dropdown          │  │
│   │                                                         │    │                             │  │
│   └─────────────────────────────────────────────────────────┘    └─────────────────────────────┘  │
│                                                                                                   │
│   ◄──── 24px padding ────►                                        ◄──── 24px padding ────►       │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
  Height: 48px | Background: gray-50 | Border-bottom: 1px solid gray-200 | Position: sticky

## Section Details

### Left Section — Title & Count

┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   ┌────┐                                                                         │
│   │ 📥 │   Inbox                    12 items  ·  3 new today                     │
│   │icon│   ─────                    ────────────────────────                     │
│   └────┘   Title                    Count info (muted)                           │
│                                                                                  │
│   ▲        ▲                        ▲                                            │
│   │        │                        │                                            │
│   20px     18px, semibold           14px, gray-500                               │
│   icon     gray-900                                                              │
│                                                                                  │
│   ◄─ 10px gap ─►◄──── 16px gap ────►                                             │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

- Container: flex row, items-center, gap defined per element
- Inbox icon: 20px × 20px, color: gray-600
  - Use a "inbox" or "tray" style icon (box with arrow pointing down)
- Title text:
  - Content: "Inbox"
  - Font-size: 18px
  - Font-weight: 600 (semibold)
  - Color: gray-900
  - Margin-left: 10px from icon
- Count text:
  - Content: "{totalCount} items · {newCount} new today"
  - Font-size: 14px
  - Color: gray-500
  - Margin-left: 16px from title
  - Middle dot (·) as separator with spaces around it

### Count Display Logic

| Scenario | Display Text |
|----------|--------------|
| Has items, has new | "12 items · 3 new today" |
| Has items, no new | "12 items" |
| Single item | "1 item" (singular) |
| Single new | "1 new today" (singular) |
| No items | "No items" |
| Loading | Show skeleton pulse (gray-200 animated bar) |

### Right Section — Process Dropdown

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                        ┌──────────────────────────────────┐  │
│                        │   Process              ▼         │  │
│                        │   ────────            icon       │  │
│                        │   Button text                    │  │
│                        └──────────────────────────────────┘  │
│                                                              │
│                        ▲                                     │
│                        │                                     │
│                        Height: 36px                          │
│                        Padding: 0 14px                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘

- Button container: flex row, items-center, gap: 8px
- Height: 36px
- Padding: 0 14px
- Background: white
- Border: 1px solid gray-200
- Border-radius: 8px (rounded-lg)
- Text: "Process"
  - Font-size: 14px
  - Font-weight: 500 (medium)
  - Color: gray-700
- Chevron down icon: 16px × 16px, color: gray-500
- Hover state: bg-gray-50, border-color: gray-300
- Active/Open state: bg-gray-100, border-color: gray-400

### Process Dropdown Menu (appears on click)

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │  ☑  Select all                              ⌘A       │   │
│   ├──────────────────────────────────────────────────────┤   │
│   │  ☐  Select none                             Esc      │   │
│   ├──────────────────────────────────────────────────────┤   │
│   │  ─────────────────────────────────────────────────── │   │  ← Divider
│   ├──────────────────────────────────────────────────────┤   │
│   │  📥 Archive all read                                 │   │
│   ├──────────────────────────────────────────────────────┤   │
│   │  🗑️  Clear processed                                 │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                              │
│   Width: 220px                                               │
│   Position: Below button, right-aligned                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘

- Dropdown container:
  - Position: absolute
  - Top: 100% + 4px (gap below button)
  - Right: 0 (right-aligned with button)
  - Width: 220px
  - Background: white
  - Border: 1px solid gray-200
  - Border-radius: 10px
  - Box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12)
  - Padding: 6px
  - Z-index: 100

- Menu items:
  - Height: 36px
  - Padding: 0 12px
  - Border-radius: 6px
  - Display: flex row, items-center, justify-between
  - Font-size: 14px
  - Color: gray-700
  - Icon: 16px, margin-right: 10px
  - Keyboard shortcut text: font-size: 12px, color: gray-400
  - Hover: bg-gray-100
  - Active/Click: bg-gray-200

- Divider:
  - Height: 1px
  - Background: gray-200
  - Margin: 6px 0

### Dropdown Menu Items

| Item | Icon | Label | Shortcut | Action |
|------|------|-------|----------|--------|
| 1 | ☑ (checkbox-checked) | Select all | ⌘A | Selects all visible items |
| 2 | ☐ (checkbox-empty) | Select none | Esc | Clears selection |
| - | — | — | — | Divider |
| 3 | 📥 (archive) | Archive all read | — | Archives items user has viewed |
| 4 | 🗑️ (trash) | Clear processed | — | Deletes archived items permanently |

## Component States

### Context Bar States

| State | Appearance |
|-------|------------|
| Default | Shows count, Process button normal |
| Loading | Count area shows skeleton, Process button disabled |
| Empty inbox | Shows "No items", Process button disabled |
| Items selected | Count changes to "X selected" in blue, Process becomes "Actions" |

### Selection Active State

When items are selected elsewhere in the UI, the context bar transforms:

┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                   │
│   ┌────┐                                                                                          │
│   │ ☑  │   3 selected                           [ Cancel ]    [ Actions ▼ ]                      │
│   │icon│   ──────────                                                                             │
│   └────┘   Blue text                            Ghost btn     Primary btn                         │
│                                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘

- Checkbox icon replaces inbox icon: 20px, color: blue-600
- "3 selected" text:
  - Font-size: 18px
  - Font-weight: 600
  - Color: blue-600
- Cancel button appears:
  - Ghost style (no background, no border)
  - Text: "Cancel", color: gray-600
  - Hover: bg-gray-100
- Process button changes to "Actions":
  - Background: blue-600
  - Text color: white
  - Hover: bg-blue-700

## Interactive Behaviors

### Process/Actions Dropdown
- onClick button: Toggle dropdown visibility
- Click outside: Close dropdown
- Escape key: Close dropdown
- Click menu item: Execute action + close dropdown

### Dropdown Actions (for now, console.log)
onSelectAll: () => console.log("Select all")
onSelectNone: () => console.log("Select none")
onArchiveRead: () => console.log("Archive all read")
onClearProcessed: () => console.log("Clear processed")

### Cancel Selection
- onClick: Clears all selected items (callback to parent)

## Props Interface
```typescript
interface ContextBarProps {
  // Count display
  totalCount: number;
  newTodayCount: number;
  isLoading: boolean;

  // Selection state
  selectedCount: number;
  onCancelSelection: () => void;

  // Dropdown actions
  onSelectAll: () => void;
  onSelectNone: () => void;
  onArchiveRead: () => void;
  onClearProcessed: () => void;
}
```

## Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| < 768px | Hide "new today" portion of count. Shorten "3 selected" to "3 sel." |
| 768px - 1024px | Show full text but tighter spacing |
| > 1024px | Full layout as specified |

## Accessibility Requirements

- Process/Actions button:
  - aria-haspopup="true"
  - aria-expanded="true/false" based on dropdown state
  - aria-controls="process-menu"
- Dropdown menu:
  - role="menu"
  - id="process-menu"
- Menu items:
  - role="menuitem"
  - Keyboard navigation: Arrow up/down to move, Enter to select, Escape to close
- Cancel button: aria-label="Cancel selection"
- Selection count: Use aria-live="polite" to announce changes

## Verification Checklist

After building, verify:
☐ Title and count display correctly with proper spacing
☐ Count grammar is correct (item vs items, singular/plural)
☐ Process dropdown opens on click
☐ Dropdown closes on click outside and Escape key
☐ Dropdown menu items have hover states
☐ Selection state transforms the bar correctly (shows selected count, Cancel, Actions)
☐ Cancel button clears selection
☐ Loading state shows skeleton for count
☐ Empty state shows "No items" and disables Process button
☐ Sticky positioning works (bar sticks below header on scroll)
☐ Keyboard navigation works within dropdown menu

## Output

Create a React component called ContextBar that accepts the props defined above. Use Tailwind CSS for styling. Include a local state for dropdown open/close. Replace the "Context Bar" placeholder text in Zone 2 of InboxPageLayout with this component.

Implementation Notes
Key Techniques Used:
TechniqueWhyState transformation tableShows how component morphs when selection is activeGrammar rules for countEnsures proper singular/plural handlingDropdown positioning specsExplicit placement avoids common dropdown bugsSkeleton loading mentionPrompts AI to handle loading state gracefullyKeyboard shortcut displayEven though shortcuts come later, UI shows them now
Design Choices:

Sticky (not fixed) — Bar scrolls with content initially, then sticks below header. This gives more content space than double-fixed bars while keeping context accessible.
Context transformation on selection — Rather than showing a separate bulk-action bar, the context bar transforms in place. Reduces UI jumping and keeps actions in a predictable location.
Right-aligned dropdown — Dropdown aligns to button's right edge, preventing it from going off-screen on narrower viewports.
Disabled states — Process button disabled when nothing to process (empty or loading). Prevents confusion.


Expected Output Structure
jsx<div className="context-bar">
  {/* Left: Title & Count */}
  <div className="context-left">
    {selectedCount > 0 ? (
      <>
        <CheckboxIcon className="text-blue-600" />
        <span className="selected-count">{selectedCount} selected</span>
      </>
    ) : (
      <>
        <InboxIcon />
        <h1 className="title">Inbox</h1>
        <span className="count">{renderCount()}</span>
      </>
    )}
  </div>

  {/* Right: Actions */}
  <div className="context-right">
    {selectedCount > 0 && (
      <button className="cancel-btn" onClick={onCancelSelection}>
        Cancel
      </button>
    )}

    <div className="dropdown-container">
      <button className="process-btn" onClick={toggleDropdown}>
        {selectedCount > 0 ? 'Actions' : 'Process'}
        <ChevronDownIcon />
      </button>

      {isDropdownOpen && (
        <div className="dropdown-menu">
          {/* Menu items */}
        </div>
      )}
    </div>
  </div>
</div>

Usage Guidelines

Track selection count in parent — InboxPageLayout should manage selectedCount state and pass it down
Test both modes — Verify normal state and selection state by changing selectedCount prop
Test count grammar — Pass 0, 1, 5 as totalCount to verify "No items", "1 item", "5 items"
Verify sticky behavior — Scroll the content area to confirm bar sticks at correct position