Prompt #13: Preview Panel Shell
The Prompt
You are building the Preview Panel Shell for Memry's inbox. This is the slide-over panel container that opens from the right side when a user clicks on an inbox item. The shell provides the structure, header, and action bar — content-type-specific previews will render inside it.

## What You Are Building

A slide-over panel that:
1. Opens from the right edge of the screen
2. Takes 50% width (or adapts responsively)
3. Contains a header with navigation and controls
4. Has a scrollable content area for item-specific previews
5. Includes a fixed action bar at the bottom
6. Supports fullscreen mode
7. Handles keyboard navigation and accessibility

## Panel Behavior Overview
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                       │
│  INBOX PAGE (compressed when panel open)                    │  PREVIEW PANEL (50% width)             │
│                                                             │                                         │
│  ┌─────────────────────────────────────────────────────┐    │  ┌─────────────────────────────────┐   │
│  │  Header Bar                                         │    │  │  Panel Header                   │   │
│  ├─────────────────────────────────────────────────────┤    │  │  ← Back  Title  ⛶ ⋮ ✕          │   │
│  │  Context Bar                                        │    │  ├─────────────────────────────────┤   │
│  ├─────────────────────────────────────────────────────┤    │  │                                 │   │
│  │                                                     │    │  │                                 │   │
│  │                                                     │    │  │  Content Area                   │   │
│  │  Grid/List View                                     │    │  │  (scrollable)                   │   │
│  │  (still visible, interactive)                       │    │  │                                 │   │
│  │                                                     │    │  │  [Item-specific preview         │   │
│  │                                                     │    │  │   renders here]                 │   │
│  │                                                     │    │  │                                 │   │
│  │                                                     │    │  │                                 │   │
│  │                                                     │    │  ├─────────────────────────────────┤   │
│  │                                                     │    │  │  Action Bar                     │   │
│  │                                                     │    │  │  [ Open/Save ]  [ Move ]  🗑️    │   │
│  └─────────────────────────────────────────────────────┘    │  └─────────────────────────────────┘   │
│                                                             │                                         │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────┤
│  Quick Capture Bar                                          │                                         │
│                                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘

---

## Panel Container

### Positioning & Layout
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│                                                    ┌───────────────────────────────────────────────┐│
│                                                    │                                               ││
│  Backdrop (optional)                               │  PREVIEW PANEL                                ││
│  - Click to close                                  │                                               ││
│  - Semi-transparent on mobile                      │  Position: fixed                              ││
│  - None on desktop (see-through)                   │  Top: 0                                       ││
│                                                    │  Right: 0                                     ││
│                                                    │  Bottom: 0                                    ││
│                                                    │  Width: 50%                                   ││
│                                                    │  Max-width: 720px                             ││
│                                                    │  Min-width: 400px                             ││
│                                                    │                                               ││
│                                                    │  Background: white                            ││
│                                                    │  Border-left: 1px solid gray-200              ││
│                                                    │  Box-shadow: -4px 0 24px rgba(0,0,0,0.08)     ││
│                                                    │                                               ││
│                                                    │  Z-index: 40                                  ││
│                                                    │                                               ││
│                                                    └───────────────────────────────────────────────┘│
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

**Panel Container Specs:**
- Position: fixed
- Top: 0
- Right: 0
- Bottom: 0
- Width: 50vw
- Min-width: 400px
- Max-width: 720px
- Background: white
- Border-left: 1px solid gray-200
- Box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08)
- Z-index: 40
- Display: flex
- Flex-direction: column

### Panel Internal Structure
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          HEADER (fixed)                               │  │
│  │                          Height: 56px                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                       CONTENT AREA (scrollable)                       │  │
│  │                       Flex: 1                                         │  │
│  │                       Overflow-y: auto                                │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        ACTION BAR (fixed)                             │  │
│  │                        Height: 64px                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Panel Header

### Header Layout
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│   ┌──────┐   ┌─────────────────────────────────────────────────┐   ┌──────┬──────┬──────┐          │
│   │  ←   │   │  Title / Item Name                              │   │  ⛶  │  ⋮  │  ✕  │          │
│   │ Back │   │  Subtitle (optional metadata)                   │   │full │more │close│          │
│   └──────┘   └─────────────────────────────────────────────────┘   └──────┴──────┴──────┘          │
│                                                                                                     │
│   ▲          ▲                                                     ▲      ▲      ▲                 │
│   │          │                                                     │      │      │                 │
│   Back       Title area                                            Full   More   Close             │
│   button     (flex-grow)                                           screen menu   button            │
│                                                                                                     │
│   Height: 56px                                                                                      │
│   Padding: 0 16px                                                                                   │
│   Border-bottom: 1px solid gray-200                                                                 │
│   Background: white                                                                                 │
│   Display: flex                                                                                     │
│   Align-items: center                                                                               │
│   Gap: 12px                                                                                         │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Header Elements

**Back Button:**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌──────────────────────┐                                      │
│  │                      │                                      │
│  │   ←   Back           │   Optional: Show "Back" text         │
│  │  icon  text          │   Or just icon on narrow widths      │
│  │                      │                                      │
│  └──────────────────────┘                                      │
│                                                                │
│  Button specs:                                                 │
│  - Height: 36px                                                │
│  - Padding: 0 12px                                             │
│  - Border-radius: 8px                                          │
│  - Background: transparent                                     │
│  - Icon: ← arrow left, 18px                                    │
│  - Text: "Back", 14px (optional, hide on narrow)               │
│  - Color: gray-600                                             │
│  - Hover: bg-gray-100                                          │
│  - Gap between icon and text: 6px                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘

**Title Area:**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Flex: 1 (takes remaining space)                               │
│  Min-width: 0 (allows text truncation)                         │
│  Overflow: hidden                                              │
│                                                                │
│  TITLE                                                         │
│  ─────                                                         │
│  Font-size: 16px                                               │
│  Font-weight: 600 (semibold)                                   │
│  Color: gray-900                                               │
│  Line-clamp: 1                                                 │
│  White-space: nowrap                                           │
│  Overflow: hidden                                              │
│  Text-overflow: ellipsis                                       │
│                                                                │
│  SUBTITLE (optional)                                           │
│  ────────                                                      │
│  Font-size: 13px                                               │
│  Color: gray-500                                               │
│  Line-clamp: 1                                                 │
│  Margin-top: 2px                                               │
│                                                                │
│  Examples:                                                     │
│  - URL: "Article Title" / "example.com"                        │
│  - Note: "Meeting Notes" / "Created 2 hours ago"               │
│  - Image: "screenshot.png" / "1920×1080 · 1.2 MB"              │
│  - Voice: "Voice memo" / "1:24 · Transcribed"                  │
│  - Clip: "Web clip" / "from ux-magazine.com"                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘

**Action Buttons (Right Side):**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Display: flex                                                 │
│  Gap: 4px                                                      │
│  Flex-shrink: 0                                                │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐                      │  │
│  │  │   ⛶   │  │   ⋮   │  │   ✕   │                      │  │
│  │  │  full  │  │  more  │  │ close  │                      │  │
│  │  └────────┘  └────────┘  └────────┘                      │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Each button:                                                  │
│  - Size: 36px × 36px                                           │
│  - Border-radius: 8px                                          │
│  - Background: transparent                                     │
│  - Icon: 18px                                                  │
│  - Color: gray-500                                             │
│  - Hover: bg-gray-100, color: gray-700                         │
│  - Active: bg-gray-200                                         │
│                                                                │
│  Close button (✕):                                             │
│  - Hover: bg-red-50, color: red-600                            │
│                                                                │
└────────────────────────────────────────────────────────────────┘

### More Menu Dropdown
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                                                    ┌──────────────────────┐  │
│                                                    │                      │  │
│                                         ⋮ ←───────│  Copy link      ⌘C   │  │
│                                                    │  Share          ⌘S   │  │
│                                                    │  ──────────────────  │  │
│                                                    │  Duplicate           │  │
│                                                    │  Export as PDF       │  │
│                                                    │  ──────────────────  │  │
│                                                    │  View history        │  │
│                                                    │  Item details        │  │
│                                                    │                      │  │
│                                                    └──────────────────────┘  │
│                                                                              │
│  Dropdown:                                                                   │
│  - Width: 200px                                                              │
│  - Position: Below button, right-aligned                                     │
│  - Background: white                                                         │
│  - Border: 1px solid gray-200                                                │
│  - Border-radius: 10px                                                       │
│  - Box-shadow: 0 4px 16px rgba(0,0,0,0.12)                                   │
│  - Padding: 6px                                                              │
│                                                                              │
│  Menu items: Same style as Context Bar dropdown                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

---

## Content Area

### Scrollable Container
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Content Area Container:                                                    │
│  - Flex: 1 (fills available space)                                          │
│  - Overflow-y: auto                                                         │
│  - Overflow-x: hidden                                                       │
│  - Padding: 0 (child components handle padding)                             │
│  - Background: white (or gray-50 for some content types)                    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │   CONTENT-TYPE SPECIFIC PREVIEW                                       │  │
│  │   (Rendered via children or render prop)                              │  │
│  │                                                                       │  │
│  │   - UrlPreview                                                        │  │
│  │   - NotePreview                                                       │  │
│  │   - ImagePreview                                                      │  │
│  │   - VoicePreview                                                      │  │
│  │   - WebClipPreview                                                    │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Loading State (Content Area)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Padding: 24px                                                        │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │  │
│  │  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │  │
│  │  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                                 │  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                                        │  │
│  │                                                                       │  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     │  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                            │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Show skeleton that roughly matches expected content structure              │
│  Animate with pulse                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Error State (Content Area)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                            ⚠️                                          │  │
│  │                                                                       │  │
│  │                   Unable to load this item                            │  │
│  │                                                                       │  │
│  │              The item may have been deleted or moved.                 │  │
│  │                                                                       │  │
│  │                       [ Try again ]                                   │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Icon: Warning triangle, 48px, gray-300                                     │
│  Title: 20px, semibold, gray-900                                            │
│  Subtitle: 14px, gray-500                                                   │
│  Button: Ghost style                                                        │
│  Centered vertically and horizontally                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Action Bar

### Action Bar Layout
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  Action Bar Container:                                                                              │
│  - Height: 64px                                                                                     │
│  - Padding: 12px 16px                                                                               │
│  - Background: white                                                                                │
│  - Border-top: 1px solid gray-200                                                                   │
│  - Display: flex                                                                                    │
│  - Align-items: center                                                                              │
│  - Justify-content: space-between                                                                   │
│  - Gap: 12px                                                                                        │
│                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                                             │    │
│  │   ┌─────────────────────────┐   ┌──────────────────────────────────────────┐   ┌────────┐  │    │
│  │   │                         │   │                                          │   │        │  │    │
│  │   │    PRIMARY ACTION       │   │         SECONDARY ACTIONS                │   │ DELETE │  │    │
│  │   │    (varies by type)     │   │         Move  │  Tag  │  Archive         │   │   🗑️   │  │    │
│  │   │                         │   │                                          │   │        │  │    │
│  │   └─────────────────────────┘   └──────────────────────────────────────────┘   └────────┘  │    │
│  │                                                                                             │    │
│  │   ▲                             ▲                                              ▲            │    │
│  │   │                             │                                              │            │    │
│  │   Primary button                Secondary buttons                              Danger btn   │    │
│  │   (type-specific)               (common actions)                               (always)     │    │
│  │                                                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Primary Actions by Type

| Item Type | Primary Action | Button Text | Icon |
|-----------|----------------|-------------|------|
| URL/Link | Open original | "Open link" | ↗️ External link |
| Note | Save changes | "Save" | 💾 Save (if edited) |
| Image | Download | "Download" | ⬇️ Download |
| Voice | Download audio | "Download" | ⬇️ Download |
| Web Clip | Open source | "Open source" | ↗️ External link |

### Action Button Styles

**Primary Button:**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌────────────────────────────┐                                │
│  │                            │                                │
│  │  ↗️   Open link             │                                │
│  │  icon  text                │                                │
│  │                            │                                │
│  └────────────────────────────┘                                │
│                                                                │
│  - Height: 40px                                                │
│  - Padding: 0 16px                                             │
│  - Background: gray-900                                        │
│  - Color: white                                                │
│  - Border-radius: 8px                                          │
│  - Font-size: 14px                                             │
│  - Font-weight: 500                                            │
│  - Icon: 16px, margin-right: 8px                               │
│  - Hover: bg-gray-800                                          │
│  - Active: bg-gray-950                                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘

**Secondary Buttons:**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌────────────────────────────────────────────────────┐        │
│  │                                                    │        │
│  │  │  📁 Move  │  🏷️ Tag  │  📥 Archive  │          │        │
│  │  └───────────┴──────────┴─────────────┘          │        │
│  │                                                    │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                │
│  Button group (connected):                                     │
│  - Container: border: 1px solid gray-200, rounded-lg           │
│  - Each button: Height: 40px, padding: 0 14px                  │
│  - Background: white                                           │
│  - Color: gray-700                                             │
│  - Icon: 16px                                                  │
│  - Hover: bg-gray-50                                           │
│  - Dividers between buttons: 1px solid gray-200                │
│  - First button: rounded-l-lg                                  │
│  - Last button: rounded-r-lg                                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘

**Delete Button:**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌──────────┐                                                  │
│  │          │                                                  │
│  │    🗑️    │                                                  │
│  │          │                                                  │
│  └──────────┘                                                  │
│                                                                │
│  - Size: 40px × 40px                                           │
│  - Border-radius: 8px                                          │
│  - Background: transparent                                     │
│  - Border: 1px solid gray-200                                  │
│  - Icon: 18px, gray-500                                        │
│  - Hover: bg-red-50, border-red-200, icon: red-600             │
│  - Active: bg-red-100                                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘

---

## Fullscreen Mode

### Fullscreen Layout
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                               │  │
│  │                            FULLSCREEN OVERLAY                                                 │  │
│  │                            Background: white                                                  │  │
│  │                            Z-index: 50                                                        │  │
│  │                                                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Panel Header (same as before, centered)                                                │  │  │
│  │  │  Max-width: 800px, margin: 0 auto                                                       │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                                         │  │  │
│  │  │                          Content Area (centered)                                        │  │  │
│  │  │                          Max-width: 800px                                               │  │  │
│  │  │                          Padding: 24px                                                  │  │  │
│  │  │                                                                                         │  │  │
│  │  │                                                                                         │  │  │
│  │  │                                                                                         │  │  │
│  │  │                                                                                         │  │  │
│  │  │                                                                                         │  │  │
│  │  │                                                                                         │  │  │
│  │  │                                                                                         │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Action Bar (centered, max-width: 800px)                                                │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

**Fullscreen Specs:**
- Position: fixed
- Inset: 0 (covers entire viewport)
- Background: white
- Z-index: 50 (above panel)
- Content max-width: 800px
- Content centered horizontally

**Fullscreen Toggle Button State:**
- In panel: Shows expand icon (⛶)
- In fullscreen: Shows collapse icon (⛶ or ↙️)
- Tooltip changes: "Enter fullscreen" / "Exit fullscreen"

---

## Animations

### Panel Open Animation
```css
/* Panel slide in from right */
@keyframes panelSlideIn {
  from {
    transform: translateX(100%);
    opacity: 0.8;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.preview-panel {
  animation: panelSlideIn 200ms ease-out;
}

/* Or using Tailwind */
.preview-panel {
  @apply animate-[slideIn_200ms_ease-out];
}
```

### Panel Close Animation
```css
/* Panel slide out to right */
@keyframes panelSlideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0.8;
  }
}

.preview-panel.closing {
  animation: panelSlideOut 150ms ease-in forwards;
}
```

### Fullscreen Transition
```css
/* Expand to fullscreen */
@keyframes expandFullscreen {
  from {
    width: 50%;
    max-width: 720px;
    right: 0;
  }
  to {
    width: 100%;
    max-width: 100%;
    right: 0;
  }
}

/* Overlay fade in */
@keyframes overlayFadeIn {
  from {
    background: transparent;
  }
  to {
    background: white;
  }
}
```

### Content Crossfade (Item Navigation)
```css
/* When navigating between items */
@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-content {
  animation: contentFadeIn 150ms ease-out;
}
```

---

## Item Navigation

### Navigation Within Panel

Users can navigate between items without closing the panel:
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  Keyboard: J/↓ = Next item, K/↑ = Previous item                                                    │
│                                                                                                     │
│  Current item: 3 of 12                                                                              │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                               │  │
│  │   ← Back    Article Title                                          3/12     ⛶  ⋮  ✕         │  │
│  │             example.com                                            ────                       │  │
│  │                                                                    Position                   │  │
│  │                                                                    indicator                  │  │
│  │                                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

**Position Indicator (Optional):**
- Shows "3/12" or "3 of 12"
- Position: Between title and action buttons
- Font-size: 12px
- Color: gray-400
- Background: gray-100
- Padding: 2px 8px
- Border-radius: 4px

---

## Close Behaviors

### Ways to Close Panel

| Trigger | Action |
|---------|--------|
| Click ✕ button | Close panel |
| Press Escape | Close panel (if not in input) |
| Press ← (Back) button | Close panel |
| Click outside panel (mobile) | Close panel |
| Click backdrop (if shown) | Close panel |

### Close Confirmation

If item has unsaved changes (e.g., edited note):
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    ┌─────────────────────────────────────┐                  │
│                    │                                     │                  │
│                    │      Unsaved changes                │                  │
│                    │                                     │                  │
│                    │   You have unsaved changes.         │                  │
│                    │   Are you sure you want to close?   │                  │
│                    │                                     │                  │
│                    │   [ Discard ]    [ Save & Close ]   │                  │
│                    │                                     │                  │
│                    └─────────────────────────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Props Interface
```typescript
interface PreviewPanelShellProps {
  // State
  isOpen: boolean;
  isFullscreen: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;

  // Current item
  itemId: string;
  itemType: "url" | "note" | "image" | "voice" | "webclip";
  title: string;
  subtitle?: string;

  // Navigation
  currentIndex?: number;      // e.g., 3
  totalItems?: number;        // e.g., 12
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;

  // Actions
  onClose: () => void;
  onToggleFullscreen: () => void;
  onRetry?: () => void;       // For error state

  // Dirty state (unsaved changes)
  isDirty: boolean;
  onSaveAndClose?: () => void;
  onDiscardAndClose?: () => void;

  // Action bar props
  primaryAction: {
    label: string;
    icon: ReactNode;
    onClick: () => void;
    disabled?: boolean;
  };
  onMove: () => void;
  onTag: () => void;
  onArchive: () => void;
  onDelete: () => void;

  // Content
  children: ReactNode;        // The type-specific preview content
}
```

---

## Keyboard Navigation
```typescript
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't handle if user is typing
    if (e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement) {
      // Exception: Escape should still close
      if (e.key === 'Escape') {
        handleClose();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;

      case 'j':
      case 'ArrowDown':
        if (canNavigateNext) {
          e.preventDefault();
          onNavigateNext();
        }
        break;

      case 'k':
      case 'ArrowUp':
        if (canNavigatePrev) {
          e.preventDefault();
          onNavigatePrev();
        }
        break;

      case 'f':
        e.preventDefault();
        onToggleFullscreen();
        break;

      case 'ArrowLeft':
        if (!isFullscreen) {
          e.preventDefault();
          handleClose();
        }
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isOpen, canNavigateNext, canNavigatePrev, isFullscreen]);
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close panel |
| `← (ArrowLeft)` | Close panel (when not fullscreen) |
| `j` / `↓` | Next item |
| `k` / `↑` | Previous item |
| `f` | Toggle fullscreen |
| `m` | Move item |
| `t` | Tag item |
| `e` | Archive item |
| `Delete` | Delete item |

---

## Responsive Behavior

| Breakpoint | Panel Width | Behavior |
|------------|-------------|----------|
| < 768px | 100% (fullscreen) | Panel covers entire screen, acts like a page |
| 768px - 1024px | 60% | Wider to give more space for content |
| 1024px - 1440px | 50% | Standard split view |
| > 1440px | 50% (max 720px) | Capped width for readability |

### Mobile Layout (< 768px)
┌─────────────────────────────────────────┐
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  ←  Back    Title           ⋮  ✕  │  │  ← No fullscreen button (already full)
│  │             Subtitle              │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │                                   │  │
│  │         Content Area              │  │
│  │         (full width)              │  │
│  │                                   │  │
│  │                                   │  │
│  │                                   │  │
│  │                                   │  │
│  │                                   │  │
│  │                                   │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  [ Open link ]  Move  Tag  🗑️     │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘

Panel is 100% width
No backdrop/split view
Hide fullscreen toggle (already full)
Action bar may stack vertically if needed


---

## Accessibility

### ARIA Attributes
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="panel-title"
  aria-describedby="panel-subtitle"
  class="preview-panel"
>
  <header>
    <button aria-label="Go back to inbox">← Back</button>
    <div>
      <h2 id="panel-title">Article Title</h2>
      <p id="panel-subtitle">example.com</p>
    </div>
    <button aria-label="Enter fullscreen">⛶</button>
    <button aria-label="More options">⋮</button>
    <button aria-label="Close preview">✕</button>
  </header>

  <main aria-live="polite">
    {/* Content */}
  </main>

  <footer>
    {/* Actions */}
  </footer>
</div>
```

### Focus Management

1. When panel opens: Focus first focusable element (Back button) or content area
2. Trap focus within panel while open
3. When panel closes: Return focus to the item that opened it
4. Tab order: Back → Title area → Fullscreen → More → Close → Content → Actions

---

## Verification Checklist

After building, verify:
☐ Panel slides in from right when opened
☐ Panel slides out to right when closed
☐ Panel width is 50% on desktop, 100% on mobile
☐ Header displays title and subtitle correctly
☐ Back button closes panel
☐ Close (✕) button closes panel
☐ Escape key closes panel
☐ Fullscreen toggle expands panel to full screen
☐ Fullscreen toggle collapses back to panel mode
☐ More menu dropdown opens and shows options
☐ Loading state shows skeleton in content area
☐ Error state shows message and retry button
☐ Action bar displays all buttons correctly
☐ Primary action button shows correct text/icon per item type
☐ Secondary actions (Move, Tag, Archive) are clickable
☐ Delete button has hover danger state
☐ J/K navigation moves between items
☐ Position indicator updates when navigating
☐ Content crossfades when navigating between items
☐ Dirty state shows confirmation dialog on close
☐ Focus is trapped within panel
☐ Focus returns to trigger element on close
☐ Panel is announced to screen readers
☐ All interactive elements have focus states
☐ Responsive layout works at all breakpoints

## Output

Create a React component called PreviewPanelShell that accepts the props defined above. Use Tailwind CSS for styling. The component should:

1. Render the panel container with correct positioning
2. Include the header with all controls
3. Render children in the scrollable content area
4. Include the action bar with configurable primary action
5. Handle fullscreen mode toggle
6. Implement all keyboard shortcuts
7. Manage focus appropriately
8. Include loading and error states

This shell will wrap content-type-specific preview components (built in subsequent prompts).

Implementation Notes
Key Techniques Used:
TechniqueWhyFixed positioning with transformsSmooth slide animation, predictable layoutFlex column layoutHeader/content/footer structure that works at any heightFocus trappingRequired for modal-like components per WCAGKeyboard navigationPower users expect vim-style shortcutsDirty state handlingPrevents accidental data loss
Design Choices:

50% width default — Split view keeps inbox visible for context. Users can see which item they're previewing in relation to others.
No backdrop on desktop — Backdrop would darken the inbox, reducing usefulness of split view. Mobile uses backdrop since panel covers everything.
Position indicator — "3 of 12" helps users understand where they are in a list, especially when using J/K navigation.
Configurable primary action — Different item types have different primary actions. Props allow parent to customize.
Close from multiple triggers — Users have different mental models for closing. Support all reasonable methods.


Expected Output Structure
jsx<div
  className={`preview-panel ${isFullscreen ? 'fullscreen' : ''} ${isClosing ? 'closing' : ''}`}
  role="dialog"
  aria-modal="true"
  aria-labelledby="panel-title"
>
  {/* Header */}
  <header className="panel-header">
    <button className="back-btn" onClick={onClose}>
      <ArrowLeftIcon />
      <span className="back-text">Back</span>
    </button>

    <div className="title-area">
      <h2 id="panel-title" className="title">{title}</h2>
      {subtitle && <p id="panel-subtitle" className="subtitle">{subtitle}</p>}
    </div>

    {totalItems && (
      <span className="position-indicator">
        {currentIndex}/{totalItems}
      </span>
    )}

    <div className="header-actions">
      <button
        className="fullscreen-btn"
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <CollapseIcon /> : <ExpandIcon />}
      </button>

      <MoreMenuDropdown />

      <button
        className="close-btn"
        onClick={handleClose}
        aria-label="Close preview"
      >
        <XIcon />
      </button>
    </div>
  </header>

  {/* Content */}
  <main className="panel-content">
    {isLoading ? (
      <ContentSkeleton />
    ) : hasError ? (
      <ErrorState message={errorMessage} onRetry={onRetry} />
    ) : (
      children
    )}
  </main>

  {/* Action Bar */}
  <footer className="panel-actions">
    <button className="primary-action" onClick={primaryAction.onClick}>
      {primaryAction.icon}
      {primaryAction.label}
    </button>

    <div className="secondary-actions">
      <button onClick={onMove}><FolderIcon /> Move</button>
      <button onClick={onTag}><TagIcon /> Tag</button>
      <button onClick={onArchive}><ArchiveIcon /> Archive</button>
    </div>

    <button className="delete-btn" onClick={onDelete}>
      <TrashIcon />
    </button>
  </footer>

  {/* Unsaved Changes Dialog */}
  {showUnsavedDialog && (
    <UnsavedChangesDialog
      onDiscard={onDiscardAndClose}
      onSave={onSaveAndClose}
      onCancel={() => setShowUnsavedDialog(false)}
    />
  )}
</div>

Usage Guidelines

Test open/close animations — Verify smooth slide in/out
Test fullscreen mode — Toggle and verify transition
Test keyboard shortcuts — J/K navigation, Escape, F for fullscreen
Test focus management — Tab through elements, verify focus trap
Test dirty state — Make a change (in Note preview), try to close, verify dialog
Test responsive — Resize to mobile width, verify full-width behavior
Test error state — Pass hasError=true, verify retry button works