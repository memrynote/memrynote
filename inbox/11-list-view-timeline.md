Prompt #11: List View (Timeline)
The Prompt
You are building the List View (Timeline) component for Memry's inbox. This component displays all card types (URL, Note, Image, Voice, Web Clip) in a vertical list format optimized for rapid triage, scanning, and keyboard-driven workflows. This is the alternative to Grid View.

## What You Are Building

A vertical timeline list that displays inbox items as compact rows organized by date groups. Each row shows essential information at a glance with hover-reveal actions. This view prioritizes density and keyboard navigation for users who want to quickly process their inbox.

## List View Placement

This component renders inside Zone 3 (Content Area) of the page layout, same as Grid View:

┌─────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (Zone 1)                                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│  CONTEXT BAR (Zone 2)                                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CONTENT AREA (Zone 3) — LIST VIEW RENDERS HERE                                 │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                           │  │
│  │   TODAY                                                          6 items  │  │
│  │   ════════════════════════════════════════════════════════════════════    │  │
│  │                                                                           │  │
│  │   ┌───────────────────────────────────────────────────────────────────┐   │  │
│  │   │ ☐  🔗  Article Title Here                              2h ago     │   │  │
│  │   │       example.com · #design · #research                           │   │  │
│  │   │       "Meta description preview text..."                          │   │  │
│  │   ├───────────────────────────────────────────────────────────────────┤   │  │
│  │   │ ☐  📝  Meeting notes from standup                      3h ago     │   │  │
│  │   │       #work · #standup                                            │   │  │
│  │   │       "Discussed the new feature roadmap..."                      │   │  │
│  │   ├───────────────────────────────────────────────────────────────────┤   │  │
│  │   │ ☐  🖼️  screenshot.png                                  4h ago     │   │  │
│  │   │       1.2 MB · 1920×1080                                          │   │  │
│  │   │       AI: dashboard, chart, analytics                             │   │  │
│  │   └───────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                           │  │
│  │   YESTERDAY                                                      8 items  │  │
│  │   ════════════════════════════════════════════════════════════════════    │  │
│  │   ...                                                                     │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  QUICK CAPTURE BAR (Zone 4)                                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

---

## Overall Structure
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  List View Container                                                            │
│  ───────────────────                                                            │
│  - Padding: 0 (rows go edge-to-edge within content area)                        │
│  - Max-width: 960px                                                             │
│  - Margin: 0 auto (centered)                                                    │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                           │  │
│  │  DATE GROUP: TODAY                                                        │  │
│  │                                                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  List Row 1                                                         │  │  │
│  │  ├─────────────────────────────────────────────────────────────────────┤  │  │
│  │  │  List Row 2                                                         │  │  │
│  │  ├─────────────────────────────────────────────────────────────────────┤  │  │
│  │  │  List Row 3                                                         │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                           │  │
│  │  DATE GROUP: YESTERDAY                                                    │  │
│  │                                                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  List Row 4                                                         │  │  │
│  │  ├─────────────────────────────────────────────────────────────────────┤  │  │
│  │  │  ...                                                                │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

---

## Date Group Component (List Version)

### Date Group Header

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   TODAY                                                              6 items ▾  │
│   ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│   Full-width underline instead of partial                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

**Header Layout:**
- Display: flex
- Justify-content: space-between
- Align-items: center
- Padding: 12px 24px (match row horizontal padding)
- Background: gray-50
- Border-bottom: 1px solid gray-200

**Title:**
- Font-size: 12px
- Font-weight: 600 (semibold)
- Color: gray-500
- Text-transform: uppercase
- Letter-spacing: 0.05em

**Count + Toggle:**
- Font-size: 12px
- Color: gray-400
- Chevron: 14px, rotates on collapse

**Spacing:**
- Between groups: 0 (groups stack directly)
- Sticky header: Group headers stick below Context Bar while scrolling

### Sticky Group Headers
┌─────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (fixed)                                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│  CONTEXT BAR (sticky)                                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│  TODAY                                                              6 items ▾   │  ← Sticky
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  │ List rows scroll under sticky header │                                       │
│  │                                      │                                       │
│  │                                      │                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
When scrolling into next group:
┌─────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (fixed)                                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│  CONTEXT BAR (sticky)                                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│  YESTERDAY                                                          8 items ▾   │  ← New sticky
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  │ Yesterday's rows                     │                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

**Sticky Header CSS:**
```css
.date-group-header {
  position: sticky;
  top: 104px; /* header (56px) + context bar (48px) */
  z-index: 30;
  background: rgb(249 250 251); /* gray-50 */
}
```

---

## List Row Structure

### Standard Row Layout

┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                        │
│  ┌────┐  ┌────┐   CONTENT                                             ACTIONS      TIME     VISUAL   │
│  │    │  │    │   ───────                                             ───────      ────     ──────   │
│  │ ☐  │  │ 🔗 │   Title line (row 1)                                  │📁│🏷️│⋮│   2h ago   [thumb]  │
│  │    │  │    │   Meta line (row 2)                                                                   │
│  └────┘  └────┘   Preview line (row 3)                                                                │
│                                                                                                        │
│  24px    32px     flex-grow                                           hover      fixed    optional    │
│                                                                       reveal     width               │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Row Dimensions & Spacing

**Row Container:**
- Width: 100%
- Min-height: 72px
- Max-height: 100px (content truncates)
- Padding: 12px 24px
- Background: white
- Border-bottom: 1px solid gray-100
- Display: flex
- Align-items: flex-start
- Gap: 12px
- Cursor: pointer
- Transition: background 150ms ease

### Row Columns Breakdown

**Column 1: Checkbox**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌──────┐                                                      │
│  │      │   Width: 24px                                        │
│  │  ☐   │   Checkbox: 18px × 18px                              │
│  │      │   Vertical align: top (margin-top: 2px)              │
│  └──────┘                                                      │
│                                                                │
│  Default: opacity 0                                            │
│  On row hover: opacity 1                                       │
│  When checked: opacity 1 always                                │
│  Transition: opacity 150ms                                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘

**Checkbox States:**

| State | Appearance |
|-------|------------|
| Unchecked (hidden) | opacity: 0 |
| Unchecked (hover) | opacity: 1, border: gray-300, bg: white |
| Checked | opacity: 1, bg: blue-600, checkmark: white |
| Focused | ring-2 ring-blue-500 ring-offset-2 |

**Column 2: Type Icon**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌──────────┐                                                  │
│  │          │   Width: 32px                                    │
│  │    🔗    │   Height: 32px                                   │
│  │          │   Border-radius: 8px                             │
│  └──────────┘   Display: flex, center                          │
│                 Icon: 16px                                     │
│                 Flex-shrink: 0                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘

**Type Icon Colors:**

| Type | Background | Icon Color |
|------|------------|------------|
| URL/Link | blue-50 | blue-600 |
| Note (text) | gray-100 | gray-600 |
| Note (checklist) | green-50 | green-600 |
| Note (code) | purple-50 | purple-600 |
| Image | pink-50 | pink-600 |
| Voice | orange-50 | orange-600 |
| Web Clip | indigo-50 | indigo-600 |

**Column 3: Content Area**
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                                                │
│  Flex: 1 (takes remaining space)                                               │
│  Display: flex, flex-direction: column                                         │
│  Gap: 2px                                                                      │
│  Min-width: 0 (allows text truncation)                                         │
│  Padding-right: 12px                                                           │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │  ROW 1: Title                                                            │  │
│  │  ────────────                                                            │  │
│  │  Font-size: 14px                                                         │  │
│  │  Font-weight: 500 (medium)                                               │  │
│  │  Color: gray-900                                                         │  │
│  │  Line-clamp: 1                                                           │  │
│  │  White-space: nowrap                                                     │  │
│  │  Overflow: hidden                                                        │  │
│  │  Text-overflow: ellipsis                                                 │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │  ROW 2: Meta (domain/tags/metadata)                                      │  │
│  │  ────────────────────────────────                                        │  │
│  │  Font-size: 13px                                                         │  │
│  │  Color: gray-500                                                         │  │
│  │  Line-clamp: 1                                                           │  │
│  │  Inline items separated by " · "                                         │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │  ROW 3: Preview (description/content snippet)                            │  │
│  │  ───────────────────────────────────────                                 │  │
│  │  Font-size: 13px                                                         │  │
│  │  Color: gray-400                                                         │  │
│  │  Line-clamp: 1                                                           │  │
│  │  Font-style: normal (or italic for quotes)                               │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘

**Column 4: Quick Actions (Hover Reveal)**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌───────────────────────────────────┐                         │
│  │                                   │                         │
│  │  │ 📁 │ 🏷️ │ ⋮ │                  │  Appears on hover       │
│  │  └────┴────┴───┘                  │  Between content & time │
│  │                                   │                         │
│  └───────────────────────────────────┘                         │
│                                                                │
│  Container:                                                    │
│  - Display: flex                                               │
│  - Gap: 4px                                                    │
│  - Opacity: 0 → 1 on hover                                     │
│  - Transition: opacity 150ms                                   │
│                                                                │
│  Each button:                                                  │
│  - Size: 28px × 28px                                           │
│  - Border-radius: 6px                                          │
│  - Background: transparent                                     │
│  - Icon: 14px, gray-500                                        │
│  - Hover: bg-gray-100, icon gray-700                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘

**Quick Action Buttons:**

| Button | Icon | Tooltip | Action |
|--------|------|---------|--------|
| Move | 📁 Folder | "Move to folder" | Opens move modal |
| Tag | 🏷️ Tag | "Add tag" | Opens tag editor |
| More | ⋮ Dots | "More actions" | Opens dropdown menu |

**More Menu Dropdown:**
┌──────────────────────────────────────┐
│                                      │
│  🔗  Open                      ⌘O    │  ← For URLs: Open in new tab
│  📋  Copy link                 ⌘C    │
│  ─────────────────────────────────   │
│  📥  Archive                   ⌘E    │
│  🗑️  Delete                    ⌫     │
│                                      │
└──────────────────────────────────────┘

**Column 5: Timestamp**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌──────────────┐                                              │
│  │              │                                              │
│  │   2h ago     │   Width: auto (content-based)                │
│  │              │   Min-width: 60px                            │
│  └──────────────┘   Text-align: right                          │
│                     White-space: nowrap                        │
│                     Font-size: 12px                            │
│                     Color: gray-400                            │
│                     Flex-shrink: 0                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘

**Column 6: Visual/Thumbnail (Optional)**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Only shown for: Image cards, URL cards with preview           │
│                                                                │
│  ┌────────────────┐                                            │
│  │                │   Width: 64px                              │
│  │   Thumbnail    │   Height: 64px                             │
│  │                │   Border-radius: 8px                       │
│  └────────────────┘   Object-fit: cover                        │
│                       Flex-shrink: 0                           │
│                       Margin-left: 12px                        │
│                                                                │
│  No thumbnail: Column doesn't render (no empty space)          │
│                                                                │
└────────────────────────────────────────────────────────────────┘

---

## Content by Item Type

### URL/Link Row
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    │
│  ☐   🔗   Article Title That Might Be Long...                    │📁│🏷️│⋮│   2h ago   ┌────────┐ │
│            example.com · 🏷️ Design · 🏷️ Research                                       │  img   │ │
│            "Meta description preview text from the article..."                         └────────┘ │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
Row 1: Title (from og:title or page title)
Row 2: Domain + tags (favicon inline optional)
Row 3: Description (og:description or meta)
Visual: og:image thumbnail (if available)

### Note Row (Plain Text)
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    │
│  ☐   📝   Meeting notes from standup                             │📁│🏷️│⋮│   3h ago             │
│            #work · #standup                                                                        │
│            "Discussed the new feature roadmap and timeline..."                                     │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
Row 1: Title (or first line)
Row 2: Tags
Row 3: Content preview
Visual: None

### Note Row (Checklist)
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    │
│  ☐   ☑️   Shopping list                                          │📁│🏷️│⋮│   1d ago             │
│            #personal · 4/7 completed                                                               │
│            ☐ Milk, ☐ Eggs, ☑ Butter, ☐ Bread...                                                   │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
Row 1: Title
Row 2: Tags + completion progress (e.g., "4/7 completed")
Row 3: Inline checklist preview with check states
Visual: None
Icon: Checkbox (green) instead of document

### Note Row (Code)
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    │
│  ☐   </>  API response handler                                   │📁│🏷️│⋮│   2d ago             │
│            #dev · #javascript                                                                      │
│            const handleResponse = (data) => { if (data.error)...                                  │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
Row 1: Title
Row 2: Tags + language (if detected)
Row 3: Code preview (monospace font)
Visual: None
Icon: Code brackets (purple)

### Image Row
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    │
│  ☐   🖼️   screenshot.png                                         │📁│🏷️│⋮│   4h ago   ┌────────┐ │
│            1.2 MB · 1920 × 1080 · #Screenshots                                         │  img   │ │
│            AI: dashboard, chart, analytics, dark mode                                  └────────┘ │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
Row 1: Filename (or user title)
Row 2: File size · Dimensions · Tags
Row 3: AI-detected tags (prefixed with "AI:")
Visual: Image thumbnail (64×64)

### Image Row (Multi-Image)
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    │
│  ☐   🖼️   5 images                                               │📁│🏷️│⋮│   2h ago   ┌──┬──┬──┐ │
│            4.8 MB total · #Inspiration                                                 │  │  │+2│ │
│            AI: various subjects                                                        └──┴──┴──┘ │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
Row 1: "{count} images"
Row 2: Total size · Tags
Row 3: AI tags or "various subjects"
Visual: Stacked thumbnails (48×48 each, max 3 visible + overflow)

### Voice Row
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    │
│  ☐   🎤   Voice memo                       ▶  0:00/1:24          │📁│🏷️│⋮│   5h ago             │
│            📍 Transcribed · #calls                                                                 │
│            "Remember to call back the client about the proposal..."                                │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
Row 1: Title + mini player (play button + time)
Row 2: Status badge + Tags
Row 3: Transcript preview (italic)
Visual: None (player inline in row 1)

**Voice Row with Mini Player:**
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    │
│  Title area expanded:                                                                              │
│                                                                                                    │
│  Voice memo                    ┌─────────────────────────────────────┐                            │
│                                │  ▶  │  ───────○──────  │  0:32/1:24 │                            │
│                                │     │  Progress bar    │            │                            │
│                                └─────────────────────────────────────┘                            │
│                                                                                                    │
│  Mini player:                                                                                      │
│  - Play/Pause button: 24px circle, orange                                                          │
│  - Progress bar: 80-120px wide, gray-200 track, orange-500 fill                                    │
│  - Time: current/duration                                                                          │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Web Clip Row
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    │
│  ☐   🌐   Web clip from ux-magazine.com                          │📁│🏷️│⋮│   6h ago             │
│            📄 How to Build Better UIs · #UX · #Research                                            │
│            "The best interfaces are invisible. Users shouldn't..."                                 │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
Row 1: "Web clip from {domain}"
Row 2: Article title (with 📄 icon) + Tags
Row 3: Clipped text preview (italic, quoted)
Visual: None (or clipped image if image clip)

---

## Row States

### Interaction States

| State | Appearance |
|-------|------------|
| Default | bg-white, border-bottom: gray-100 |
| Hover | bg-gray-50, checkbox visible, actions visible |
| Focused (keyboard) | bg-gray-50, ring-2 ring-blue-500 ring-inset |
| Selected | bg-blue-50, checkbox checked, border-left: 3px blue-500 |
| Playing (voice) | bg-orange-50, border-left: 3px orange-500 |

### Row Hover State
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░                                                                                                ░ │
│ ░  ☐   🔗   Article Title Here...                     │📁│🏷️│⋮│   2h ago   ┌────────┐            ░ │
│ ░            example.com · #design                                          │  img   │            ░ │
│ ░            "Description preview..."                                       └────────┘            ░ │
│ ░                                                                                                ░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                                                                    │
│  Background: gray-50                                                                               │
│  Checkbox: opacity 1                                                                               │
│  Actions: opacity 1                                                                                │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Row Selected State
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ┃                                                                                                  │
│ ┃  ☑   🔗   Article Title Here...                     │📁│🏷️│⋮│   2h ago   ┌────────┐            │
│ ┃            example.com · #design                                          │  img   │            │
│ ┃            "Description preview..."                                       └────────┘            │
│ ┃                                                                                                  │
│ ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                                                                    │
│  Border-left: 3px solid blue-500                                                                   │
│  Background: blue-50                                                                               │
│  Checkbox: checked (blue-600 bg, white checkmark)                                                  │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘

---

## Keyboard Navigation

### Focus & Navigation

List View is optimized for keyboard-driven workflows:
```typescript
interface KeyboardNavigation {
  // Navigation
  'j' | 'ArrowDown': 'Move to next row',
  'k' | 'ArrowUp': 'Move to previous row',
  'g g': 'Go to first row',
  'G' | 'Shift+g': 'Go to last row',

  // Actions
  'Enter': 'Open item in preview panel',
  'o': 'Open item (same as Enter)',
  'Space': 'Toggle selection',
  'x': 'Toggle selection (vim-style)',

  // Bulk selection
  'Shift+j' | 'Shift+ArrowDown': 'Select current and move to next',
  'Shift+k' | 'Shift+ArrowUp': 'Select current and move to previous',
  'Cmd+a' | 'Ctrl+a': 'Select all visible',
  'Escape': 'Clear selection',

  // Item actions
  'm': 'Move selected/focused item',
  't': 'Tag selected/focused item',
  'e': 'Archive selected/focused item',
  'Delete' | 'Backspace': 'Delete selected/focused item',

  // Voice-specific
  'p': 'Play/pause voice memo (when focused)',
}
```

### Visual Focus Indicator
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    │
│  Previous row                                                                                      │
│                                                                                                    │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ╔══════════════════════════════════════════════════════════════════════════════════════════════╗   │
│ ║                                                                                              ║   │
│ ║  ☐   🔗   Focused Row                              │📁│🏷️│⋮│   2h ago   ┌────────┐          ║   │
│ ║            example.com · #design                                        │  img   │          ║   │
│ ║            "Description preview..."                                     └────────┘          ║   │
│ ║                                                                                              ║   │
│ ╚══════════════════════════════════════════════════════════════════════════════════════════════╝   │
│                                                                                                    │
│  Ring: 2px solid blue-500, inset                                                                   │
│  Background: gray-50                                                                               │
│                                                                                                    │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                    │
│  Next row                                                                                          │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Keyboard Focus Hook
```typescript
function useListKeyboardNav(
  items: InboxItem[],
  selectedIds: Set<string>,
  onSelectionChange: (ids: Set<string>) => void,
  onItemOpen: (id: string) => void
) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const rowRefs = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(i => Math.min(i + 1, items.length - 1));
          if (e.shiftKey) {
            toggleSelection(items[focusedIndex].id);
          }
          break;

        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(i => Math.max(i - 1, 0));
          if (e.shiftKey) {
            toggleSelection(items[focusedIndex].id);
          }
          break;

        case 'Enter':
        case 'o':
          e.preventDefault();
          if (focusedIndex >= 0) {
            onItemOpen(items[focusedIndex].id);
          }
          break;

        case ' ':
        case 'x':
          e.preventDefault();
          if (focusedIndex >= 0) {
            toggleSelection(items[focusedIndex].id);
          }
          break;

        case 'm':
          e.preventDefault();
          handleMove();
          break;

        case 't':
          e.preventDefault();
          handleTag();
          break;

        case 'Escape':
          e.preventDefault();
          onSelectionChange(new Set());
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, items, selectedIds]);

  // Scroll focused row into view
  useEffect(() => {
    const row = rowRefs.current.get(focusedIndex);
    if (row) {
      row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedIndex]);

  return { focusedIndex, rowRefs };
}
```

---

## Selection Behavior

### Click Selection

| Action | Result |
|--------|--------|
| Click checkbox | Toggle that item's selection |
| Click row (not checkbox) | Open preview panel |
| Shift + Click | Select range from last selected to clicked |
| Cmd/Ctrl + Click | Toggle individual without clearing others |

### Selection Counter in Context Bar

When items selected, Context Bar transforms (defined in Prompt #3):
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    │
│   ☑  3 selected                                          [ Cancel ]    [ Actions ▼ ]             │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘

---

## Loading States

### Initial Loading Skeleton
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  ░░░░░░░░                                                                          ░░░░░░           │
│  ═══════════════════════════════════════════════════════════════════════════════════════════════    │
│                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  ░░  ░░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░░░░░   ░░░░░░░░ │    │
│  │            ░░░░░░░░░░░░░░░░░  ░░░░░░  ░░░░░░░░░                                            │    │
│  │            ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                            │    │
│  ├─────────────────────────────────────────────────────────────────────────────────────────────┤    │
│  │  ░░  ░░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░░░░░            │    │
│  │            ░░░░░░░░░░░░░░░░░                                                               │    │
│  │            ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                                     │    │
│  ├─────────────────────────────────────────────────────────────────────────────────────────────┤    │
│  │  ░░  ░░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░░░░░   ░░░░░░░░ │    │
│  │            ░░░░░░░░░░░░░░░░░  ░░░░░░                                                       │    │
│  │            ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                           │    │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

**Skeleton Rows:**
- Show 8-10 skeleton rows
- Alternate with/without thumbnail placeholder
- Vary content line widths
- Animate-pulse on gray-200 bars

### Loading More (Bottom)
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│   ... existing rows ...                                                                             │
│                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                                             │    │
│  │                           ◌  Loading more...                                                │    │
│  │                                                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

---

## Empty States

Same as Grid View but styled for list context:

### First-Time Empty
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│                                                                                                     │
│                                          📥                                                         │
│                                                                                                     │
│                                 Your inbox is empty                                                 │
│                                                                                                     │
│                      Start capturing — type below, paste a link,                                    │
│                      or drag files here.                                                            │
│                                                                                                     │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Filtered Empty
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│                                                                                                     │
│                                          🔍                                                         │
│                                                                                                     │
│                               No items match your filters                                           │
│                                                                                                     │
│                                  [ Clear filters ]                                                  │
│                                                                                                     │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

---

## Props Interface
```typescript
interface ListViewProps {
  // Data
  items: InboxItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;

  // Selection
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;

  // Group state
  collapsedGroups: Set<DateGroup>;
  onToggleGroup: (group: DateGroup) => void;

  // Filters
  searchQuery: string;
  activeFilters: FilterState;
  onClearFilters: () => void;

  // Item actions
  onItemClick: (id: string) => void;
  onItemMove: (id: string) => void;
  onItemTag: (id: string) => void;
  onItemDelete: (id: string) => void;
  onItemArchive: (id: string) => void;

  // Voice playback
  playingVoiceId: string | null;
  voiceCurrentTime: number;
  onVoicePlay: (id: string) => void;
  onVoicePause: (id: string) => void;
  onVoiceSeek: (id: string, time: number) => void;

  // URL-specific
  onOpenExternal: (url: string) => void;
}
```

---

## Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| < 640px | Hide timestamp column, show as tooltip. Reduce padding to 12px. Hide Row 3 (preview). |
| 640px - 1024px | Show all columns. Reduce max-width to 100%. |
| > 1024px | Full layout. Max-width: 960px, centered. |

### Mobile Adaptation (< 640px)
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  ☐  🔗  Article Title That Might Be...                    │
│         example.com · #design                              │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ☐  📝  Meeting notes from standup                        │
│         #work · #standup                                   │
│                                                            │
└────────────────────────────────────────────────────────────┘

No timestamp visible (available in preview)
No preview row (Row 3 hidden)
No thumbnail column
Tighter padding


---

## Verification Checklist

After building, verify:
☐ List displays all item types correctly (URL, Note, Image, Voice, Web Clip)
☐ Each type shows appropriate icon and color
☐ Type-specific content renders correctly in each row
☐ Date groups display with sticky headers
☐ Sticky headers transition smoothly when scrolling between groups
☐ Group collapse/expand works
☐ Row hover shows background change and reveals checkbox/actions
☐ Checkbox toggles selection
☐ Selected rows show blue styling with left border
☐ Multi-select works (Shift+click, Cmd/Ctrl+click)
☐ Keyboard navigation works (j/k, Enter, Space, etc.)
☐ Focus indicator visible on keyboard navigation
☐ Quick actions appear on hover and work correctly
☐ More menu dropdown opens and shows correct options
☐ Voice rows show mini player that works
☐ Thumbnails display for Image and URL items
☐ Loading skeleton displays on initial load
☐ Loading more indicator shows at bottom
☐ Empty states display correctly
☐ Filtered empty state shows with clear button
☐ Responsive layout works at all breakpoints
☐ Scroll position preserved when returning from preview

## Output

Create a React component called ListView that accepts the props defined above. Use Tailwind CSS for styling. The component should render the date-grouped vertical list with all item types, handle selection and keyboard navigation, support infinite scroll, and display appropriate loading/empty states.

Use the list variant (`variant="list"`) when rendering card components, or create dedicated list row components that match this specification.

Implementation Notes
Key Techniques Used:
TechniqueWhySticky group headersProvides context while scrolling long listsVim-style keyboard shortcutsPower users expect j/k navigation in list interfacesMini inline player for voicePlay without opening preview, faster triageHover-reveal actionsKeeps rows clean, actions available on demandSelected row left borderClear visual indicator without overwhelming
Design Choices:

Narrower max-width (960px) — Lists are easier to scan when not too wide. Optimal line length for reading applies here.
Three content rows — Title, meta, preview gives enough info to decide without opening. Each line has a specific purpose.
Sticky group headers — In long lists, users lose context of which time period they're viewing. Sticky headers solve this.
J/K navigation — Standard in email clients (Gmail), RSS readers (Feedly), and productivity tools. Power users expect this.
Mini voice player inline — Voice memos are unique — you often want to hear without full preview. Inline player enables quick playback.
Left border for selection — Subtle but clear. Doesn't interfere with content, provides strong visual grouping of selected items.


Expected Output Structure
jsx<div className="list-view">
  {isLoading ? (
    <ListSkeleton />
  ) : items.length === 0 ? (
    hasActiveFilters ? (
      <FilteredEmptyState onClear={onClearFilters} />
    ) : (
      <EmptyState />
    )
  ) : (
    <>
      {groupedItems.map(({ group, label, items: groupItems }) => (
        <div key={group} className="date-group">
          <div className="group-header sticky">
            <span className="group-label">{label}</span>
            <div className="group-meta">
              <span className="count">{groupItems.length} items</span>
              <button onClick={() => onToggleGroup(group)}>
                <ChevronIcon className={collapsed ? '-rotate-90' : ''} />
              </button>
            </div>
          </div>

          {!collapsedGroups.has(group) && (
            <div className="group-rows">
              {groupItems.map((item, index) => (
                <ListRow
                  key={item.id}
                  ref={el => rowRefs.current.set(globalIndex, el)}
                  item={item}
                  isSelected={selectedIds.has(item.id)}
                  isFocused={focusedIndex === globalIndex}
                  onSelect={() => toggleSelection(item.id)}
                  onClick={() => onItemClick(item.id)}
                  onMove={() => onItemMove(item.id)}
                  onTag={() => onItemTag(item.id)}
                  onDelete={() => onItemDelete(item.id)}
                  // Voice props
                  isPlaying={playingVoiceId === item.id}
                  currentTime={voiceCurrentTime}
                  onPlay={() => onVoicePlay(item.id)}
                  onPause={() => onVoicePause(item.id)}
                  onSeek={(time) => onVoiceSeek(item.id, time)}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {isLoadingMore && <LoadingMoreIndicator />}
    </>
  )}
</div>

Usage Guidelines

Test all item types — Add URL, Note (all subtypes), Image, Voice, Web Clip to verify rendering
Test keyboard navigation — Use j/k, Enter, Space, m, t extensively
Test sticky headers — Scroll through multiple groups to verify header transitions
Test voice playback — Click play on voice row, verify mini player works
Test selection modes — Single click, Shift+click range, Cmd+click individual
Test at narrow widths — Verify mobile layout hides appropriate elements