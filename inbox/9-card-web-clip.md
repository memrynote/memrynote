Prompt #9: Card — Web Clip
The Prompt
You are building the Web Clip Card component for Memry's inbox. This is a reusable card that displays content clipped from web pages via browser extension, including highlighted text, captured images, and source attribution. The card will be used in both Grid View (masonry) and List View (timeline).

## What You Are Building

A content card that displays user-clipped content from websites — typically highlighted text passages, captured images, or page sections. The card prominently shows the clipped content in a quote style, with clear attribution to the source article and optional user annotations.

## Card Variants

This component has TWO layout variants controlled by a `variant` prop:

1. **Grid Variant** — Vertical card with prominent quote for masonry layout
2. **List Variant** — Horizontal row with truncated quote for timeline layout

Additionally, clips can contain:

1. **Text Clip** — Highlighted text passage
2. **Image Clip** — Captured image with optional caption
3. **Mixed Clip** — Both text and image together

---

## VARIANT 1: Grid Card (Masonry) — Text Clip

┌─────────────────────────────────────────┐
│                                         │
│  🌐  Clipped from ux-magazine.com       │  ← Source indicator
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ┃                               │    │
│  │ ┃  "The best interfaces are     │    │
│  │ ┃  invisible. Users shouldn't   │    │  ← Clipped text
│  │ ┃  have to think about how to   │    │     Quote styling
│  │ ┃  use your product—they        │    │     Left border accent
│  │ ┃  should just be able to       │    │
│  │ ┃  accomplish their goals."     │    │
│  │ ┃                               │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📄 How to Build Better UIs      │    │  ← Source article link
│  │    ux-magazine.com/article/123  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ┌───────┐ ┌──────────┐                 │
│  │  UX   │ │ Research │        6h ago   │  ← Tags + timestamp
│  └───────┘ └──────────┘                 │
│                                         │
└─────────────────────────────────────────┘

---

## Grid Card Specifications

**Card Container:**
- Width: Fluid (determined by grid column)
- Min-width: 280px
- Max-width: 400px
- Background: white
- Border-radius: 12px
- Border: 1px solid gray-200
- Padding: 16px
- Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04)

**Card Height:**
- Auto-height based on content
- Min-height: 140px
- Max-height: 360px (content fades if exceeded)

### Header Section (Source Indicator)

┌─────────────────────────────────────────┐
│                                         │
│  ┌────┐                                 │
│  │ 🌐 │  Clipped from ux-magazine.com   │
│  └────┘  ────────────────────────────   │
│  ▲       Source domain                  │
│  │       13px, gray-500                 │
│  │                                      │
│  Globe icon OR favicon                  │
│  14px, gray-400                         │
│                                         │
│  Flex row, items-center, gap: 6px       │
│  Margin-bottom: 12px                    │
│                                         │
└─────────────────────────────────────────┘

**Icon:**
- If favicon available: Show favicon, 14px × 14px, rounded-sm
- If no favicon: Show globe icon 🌐, 14px, gray-400

**Text:**
- Prefix: "Clipped from "
- Domain: Bold portion (font-weight: 500)
- Font-size: 13px
- Color: gray-500

### Clipped Content Section — Text

┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  Border-left: 3px solid         │    │
│  │  Border-color: blue-400         │    │
│  │  Padding-left: 16px             │    │
│  │  Background: gray-50            │    │
│  │  Border-radius: 0 8px 8px 0     │    │
│  │  Padding: 16px 16px 16px 16px   │    │
│  │                                 │    │
│  │  "The quoted text appears       │    │
│  │  here with smart quotes and     │    │
│  │  proper typographic styling.    │    │
│  │  It should feel like a          │    │
│  │  highlighted passage from       │    │
│  │  the original article."         │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Margin-bottom: 12px                    │
│                                         │
└─────────────────────────────────────────┘

**Quote Container:**
- Background: gray-50
- Border-left: 3px solid blue-400
- Border-radius: 0 8px 8px 0 (rounded right corners only)
- Padding: 16px

**Quote Text:**
- Font-size: 14px
- Line-height: 1.7 (generous for readability)
- Color: gray-700
- Font-style: italic
- Include curly quotes: " " (not straight quotes)
- Max lines: 6 (collapsed), with fade gradient
- Expandable on click (show full quote)

**Quote Marks Styling Option:**
Alternative: Large decorative quote mark
┌─────────────────────────────────┐
│  "                              │  ← Large quote mark
│     66px, gray-200, absolute    │     Decorative, top-left
│                                 │
│  The quoted text here...        │
│                                 │
└─────────────────────────────────┘

### Clipped Content Section — Image

When a clip contains an image (instead of or in addition to text):

┌─────────────────────────────────────────┐
│                                         │
│  🌐  Clipped from dribbble.com          │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │                                 │    │
│  │        CLIPPED IMAGE            │    │  ← Image preview
│  │                                 │    │     Same as Image card
│  │                                 │    │     Max-height: 200px
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  "Designer's caption or alt text        │  ← Optional caption
│  from the source page..."               │     Italic, gray-600
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📄 Dashboard UI Kit - Dribbble  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ───────────────────────────────────    │
│  #design  #inspiration         2h ago   │
└─────────────────────────────────────────┘

**Image Container:**
- Width: 100%
- Max-height: 200px
- Border-radius: 8px
- Overflow: hidden
- Object-fit: cover
- Margin-bottom: 8px

**Image Caption (if present):**
- Font-size: 13px
- Font-style: italic
- Color: gray-600
- Line-clamp: 2
- Margin-bottom: 12px

### Clipped Content Section — Mixed (Text + Image)

┌─────────────────────────────────────────┐
│                                         │
│  🌐  Clipped from medium.com            │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │        CLIPPED IMAGE            │    │  ← Image first
│  │        (smaller, 140px)         │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ┃                               │    │
│  │ ┃  "The quoted text that was    │    │  ← Then quote
│  │ ┃  highlighted along with       │    │     Shorter max-height
│  │ ┃  the image..."                │    │
│  │ ┃                               │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📄 Article Title Here           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ───────────────────────────────────    │
│  #productivity               3h ago     │
└─────────────────────────────────────────┘

**Mixed Layout Adjustments:**
- Image max-height: 140px (smaller than image-only)
- Quote max-lines: 3 (instead of 6)
- Overall card max-height still 360px

### Source Article Section

┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  📄  How to Build Better UIs    │    │
│  │      ux-magazine.com/article... │    │
│  │                             →   │    │  ← Arrow indicates link
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Clickable - opens source article       │
│                                         │
└─────────────────────────────────────────┘

**Source Link Container:**
- Background: white
- Border: 1px solid gray-200
- Border-radius: 8px
- Padding: 10px 12px
- Display: flex, items-start, gap: 10px
- Cursor: pointer
- Margin-bottom: 12px

**Document Icon:**
- Size: 16px × 16px
- Color: gray-400
- Flex-shrink: 0
- Margin-top: 2px (align with first line)

**Article Title:**
- Font-size: 13px
- Font-weight: 500
- Color: gray-700
- Line-clamp: 1

**Article URL:**
- Font-size: 12px
- Color: gray-400
- Line-clamp: 1
- Truncate with ellipsis in middle if long

**Arrow Icon:**
- Size: 14px
- Color: gray-300
- Position: Right side, centered vertically
- Indicates external link

**Hover State:**
- Background: gray-50
- Border-color: gray-300
- Arrow color: gray-500

### User Notes Section (Optional)

If user has added personal notes to the clip:

┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  ✏️  Your note                   │    │
│  │                                 │    │
│  │  "Great quote for the design    │    │  ← User's annotation
│  │  principles doc. Relates to     │    │     Different styling from clip
│  │  our progressive disclosure."   │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘

**User Note Container:**
- Background: yellow-50
- Border: 1px solid yellow-200
- Border-radius: 8px
- Padding: 10px 12px
- Margin-bottom: 12px

**Note Header:**
- Icon: ✏️ Pencil, 14px
- Text: "Your note", 12px, font-weight: 500, yellow-700
- Margin-bottom: 6px

**Note Text:**
- Font-size: 13px
- Color: gray-700
- Line-height: 1.5
- Line-clamp: 3

### Footer Section

┌─────────────────────────────────────────┐
│                                         │
│  ───────────────────────────────────    │  ← Divider
│                                         │
│  ┌───────┐ ┌──────────┐                 │
│  │  UX   │ │ Research │        6h ago   │  ← Tags + timestamp
│  └───────┘ └──────────┘                 │
│                                         │
│  Same styling as other cards            │
│                                         │
└─────────────────────────────────────────┘

---

## VARIANT 2: List Card (Timeline)

### Text Clip (List)

┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                        │
│  ┌────┐  ┌────┐                                                                                        │
│  │    │  │ 🌐 │  Web clip from ux-magazine.com                                            6 hours ago  │
│  │ ☐  │  │icon│  📄 How to Build Better UIs · #UX · #Research                                          │
│  │    │  │    │  "The best interfaces are invisible. Users shouldn't have to think..."                 │
│  └────┘  └────┘                                                                                        │
│                                                                                                        │
│  ▲       ▲      ▲                                                                                      │
│  │       │      │                                                                                      │
│  Check   Type   Content area                                                                           │
│  box     icon                                                                                          │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Image Clip (List)

┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                        │
│  ┌────┐  ┌────┐                                                                       ┌──────────────┐ │
│  │    │  │ 🌐 │  Web clip from dribbble.com                                  2h ago   │              │ │
│  │ ☐  │  │icon│  📄 Dashboard UI Kit · #design                                        │  Thumbnail   │ │
│  │    │  │    │  "Designer's caption text here..."                                    │   (64×64)    │ │
│  └────┘  └────┘                                                                       └──────────────┘ │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

### List Card Structure

**Layout:**
- Display: flex row
- Align-items: flex-start
- Gap: 12px
- Padding: 12px 16px
- Background: white
- Border-bottom: 1px solid gray-100
- Min-height: 72px

**Checkbox Column:**
- Width: 24px
- Opacity: 0 by default, 1 on hover/selected
- Checkbox: 18px × 18px

**Type Icon Column:**
- Width: 32px, Height: 32px
- Background: blue-50
- Border-radius: 8px
- Icon: Globe/Clip icon, 16px, blue-600

**Content Column:**
- Flex: 1
- Display: flex, flex-direction: column
- Gap: 2px

*Row 1 — Source + Time:*
- "Web clip from {domain}"
- Font-size: 14px
- Font-weight: 500
- Color: gray-900
- Time: 12px, gray-400, right-aligned

*Row 2 — Article + Tags:*
- "📄 {article title}" truncated
- Font-size: 13px
- Color: gray-500
- Separator: " · "
- Tags inline (max 2)

*Row 3 — Clipped Text Preview:*
- Quoted text from clip
- Font-size: 13px
- Color: gray-400
- Font-style: italic
- Line-clamp: 1

**Thumbnail Column (if image clip):**
- Width: 64px
- Height: 64px
- Border-radius: 8px
- Object-fit: cover
- Margin-left: auto
- Flex-shrink: 0

---

## Card States

### Interaction States

| State | Grid Appearance | List Appearance |
|-------|-----------------|-----------------|
| Default | White bg, subtle border | White bg, bottom border |
| Hover | Shadow lift, source link highlights | bg-gray-50, checkbox visible |
| Selected | bg-blue-50, border-blue-200 | bg-blue-50, checkbox checked |
| Focused | ring-2 ring-blue-500 | ring-2 ring-blue-500 |

### Quote Expansion (Grid)

When clipped text exceeds 6 lines:

**Collapsed (default):**
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐    │
│  │ ┃                               │    │
│  │ ┃  "Long quoted text that       │    │
│  │ ┃  continues for many lines     │    │
│  │ ┃  and eventually gets cut      │    │
│  │ ┃  off with a fade gradient     │    │
│  │ ┃  at the bottom..."            │    │
│  │ ┃  ░░░░░░░░░░░░░░░░░░░░░░░░░░░ │    │  ← Fade gradient
│  │ ┃                               │    │
│  │ ┃         [ Show more ]         │    │  ← Expand button
│  │ ┃                               │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘

**Expanded:**
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐    │
│  │ ┃                               │    │
│  │ ┃  "Long quoted text that       │    │
│  │ ┃  continues for many lines     │    │
│  │ ┃  and now shows the complete   │    │
│  │ ┃  passage without any          │    │
│  │ ┃  truncation. The user can     │    │
│  │ ┃  read everything that was     │    │
│  │ ┃  originally clipped from      │    │
│  │ ┃  the source article."         │    │
│  │ ┃                               │    │
│  │ ┃         [ Show less ]         │    │  ← Collapse button
│  │ ┃                               │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘

**Expand/Collapse Button:**
- Text: "Show more" / "Show less"
- Font-size: 12px
- Color: blue-600
- Hover: underline
- Centered at bottom of quote container
- Margin-top: 8px

### Hover Actions (Grid)

┌─────────────────────────────────────────┐
│                                         │
│  🌐  Clipped from ux-magazine  ┌───┐    │
│                                │ ⋮ │    │  ← More button
│                                └───┘    │
│  ┌─────────────────────────────────┐    │
│  │ ┃                               │    │
│  │ ┃  "The quoted text..."         │    │
│  │ ┃                               │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📄 Article Title →              │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐     │
│  │ 🌐 Open │ 📁 Move │ 🏷️ │ 🗑️   │     │  ← Action bar
│  └────────────────────────────────┘     │
│                                         │
│  ───────────────────────────────────    │
│  #UX  #Research               6h ago    │
└─────────────────────────────────────────┘

**Action Bar:**
- Position: Above footer, appears on hover
- Background: white/95, backdrop-blur
- Border: 1px solid gray-200
- Border-radius: 8px
- Padding: 4px
- Shadow: 0 2px 8px rgba(0,0,0,0.1)

**Action Buttons:**

| Button | Icon | Label | Action |
|--------|------|-------|--------|
| Open Source | 🌐 Globe | "Open" | Opens source URL in new tab |
| Move | 📁 Folder | — | Opens move modal |
| Tag | 🏷️ Tag | — | Opens tag editor |
| Delete | 🗑️ Trash | — | Deletes clip |

---

## AI Connections Section (Optional Enhancement)

If Memry has AI features to find related content:

┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  ✨ Related in your library     │    │
│  │                                 │    │
│  │  📝 Design principles draft  →  │    │  ← Related items
│  │  🔗 Nielsen Norman article   →  │    │     Clickable to open
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘

**AI Connections Container:**
- Background: purple-50
- Border: 1px solid purple-100
- Border-radius: 8px
- Padding: 10px 12px
- Margin-bottom: 12px

**Header:**
- Icon: ✨ Sparkles
- Text: "Related in your library"
- Font-size: 12px
- Font-weight: 500
- Color: purple-700
- Margin-bottom: 8px

**Related Items:**
- Each item: flex row, justify-between
- Icon: Type icon (📝, 🔗, etc.), 14px
- Title: 13px, gray-700, line-clamp-1
- Arrow: →, gray-400
- Hover: bg-purple-100, rounded
- Padding: 4px 6px
- Clickable to open that item

---

## Data Structure
```typescript
interface WebClipCardData {
  id: string;
  type: "webclip";

  // Clipped content
  clipType: "text" | "image" | "mixed";
  clippedText?: string;              // Highlighted text
  clippedImage?: {
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    caption?: string;                // Alt text or caption from source
  };

  // Source information
  source: {
    url: string;                     // Full URL
    domain: string;                  // Extracted domain
    favicon?: string;                // Favicon URL
    title: string;                   // Page/article title
    author?: string;                 // Article author if available
    publishedAt?: Date;              // Article publish date if available
  };

  // User additions
  userNote?: string;                 // User's annotation
  tags: string[];

  // AI features (optional)
  relatedItems?: {
    id: string;
    type: string;
    title: string;
  }[];

  // Timestamps
  createdAt: Date;                   // When clipped
  updatedAt: Date;

  // States
  isArchived?: boolean;
}
```

## Props Interface
```typescript
interface WebClipCardProps {
  // Data
  data: WebClipCardData;

  // Variant
  variant: "grid" | "list";

  // Expansion state (for long quotes in grid)
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;

  // Selection
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;

  // Actions
  onClick: (id: string) => void;              // Opens preview panel
  onOpenSource: (url: string) => void;        // Opens source in new tab
  onMove: (id: string) => void;
  onTag: (id: string) => void;
  onDelete: (id: string) => void;

  // Related items (optional)
  onOpenRelated?: (relatedId: string) => void;
}
```

## URL/Domain Formatting
```typescript
function formatDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove 'www.' prefix if present
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function truncateUrl(url: string, maxLength: number = 40): string {
  if (url.length <= maxLength) return url;

  // Keep start and end, truncate middle
  const start = url.substring(0, 20);
  const end = url.substring(url.length - 15);
  return `${start}...${end}`;
}
```

**Examples:**
- "https://www.ux-magazine.com/article/123" → "ux-magazine.com"
- Very long URL → "ux-magazine.com/art...design-tips"

## Quote Formatting
```typescript
function formatQuote(text: string): string {
  // Ensure smart/curly quotes
  let formatted = text.trim();

  // Add opening quote if not present
  if (!formatted.startsWith('"') && !formatted.startsWith('"')) {
    formatted = '"' + formatted;
  }

  // Add closing quote if not present
  if (!formatted.endsWith('"') && !formatted.endsWith('"')) {
    formatted = formatted + '"';
  }

  // Convert straight quotes to curly
  formatted = formatted
    .replace(/^"/, '"')      // Opening
    .replace(/"$/, '"')      // Closing
    .replace(/"/g, '"');     // Any remaining (context-dependent)

  return formatted;
}
```

---

## Loading Skeleton

**Grid Skeleton:**
┌─────────────────────────────────────────┐
│                                         │
│  ░░░░  ░░░░░░░░░░░░░░░░░░░░░           │  ← Source skeleton
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │    │  ← Quote skeleton
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │    │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░    │    │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░     │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ░░░░  ░░░░░░░░░░░░░░░░░░░░░░░   │    │  ← Source link skeleton
│  └─────────────────────────────────┘    │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ░░░░░░  ░░░░░░░░░░       ░░░░░░░░░    │  ← Tags + time skeleton
│                                         │
└─────────────────────────────────────────┘

**List Skeleton:**
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ░░  ░░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░░░░░        │
│            ░░░░░░░░░░░░░░░░░░░░░  ░░░░░░  ░░░░░░░░░                                                    │
│            ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                                         │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

---

## Broken Source State

When source URL is no longer accessible:

┌─────────────────────────────────────────┐
│                                         │
│  🌐  Clipped from ux-magazine.com       │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ┃                               │    │
│  │ ┃  "The quoted text is still    │    │  ← Clip content preserved
│  │ ┃  available even if source     │    │
│  │ ┃  is not..."                   │    │
│  │ ┃                               │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  ⚠️ 📄 Source may be unavailable │    │  ← Warning indicator
│  │     ux-magazine.com/article...  │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ───────────────────────────────────    │
│  #UX                            6h ago  │
└─────────────────────────────────────────┘

**Broken Source Styling:**
- Add ⚠️ warning icon before document icon
- Text color: gray-400 (more muted)
- Background: gray-50
- Border: 1px dashed gray-300 (dashed instead of solid)
- Still clickable (might work, might not)

---

## Accessibility Requirements

- Card container: role="article", aria-label="Web clip from {domain}"
- Clipped quote: Use <blockquote> element with cite attribute pointing to source
- Source link: aria-label="Open source article: {title} (opens in new tab)"
- External link indicator: Include icon + text or sr-only text "(opens in new tab)"
- Expand/collapse: aria-expanded="true/false", aria-controls="quote-content"
- Checkbox: aria-label="Select web clip from {domain}"
- User note section: aria-label="Your note"
- Related items: role="list" with aria-label="Related items in your library"

## Verification Checklist

After building, verify:
☐ Grid variant displays text clips with quote styling
☐ Grid variant displays image clips with preview
☐ Grid variant displays mixed clips (image + text)
☐ List variant displays with correct layout
☐ List variant shows thumbnail for image clips
☐ Quote uses curly/smart quotes
☐ Quote has left border accent (blue)
☐ Source domain extracts correctly from URL
☐ Source link section is clickable and opens new tab
☐ Favicon shows when available, globe icon as fallback
☐ Long quotes truncate with "Show more" button
☐ Show more/less toggle works
☐ User note section displays when present (yellow styling)
☐ Related items section displays when present (purple styling)
☐ Hover reveals action buttons
☐ "Open source" action works
☐ Selection state shows blue styling
☐ Broken source state shows warning styling
☐ Loading skeleton displays correctly

## Output

Create a React component called WebClipCard that accepts the props defined above. Use Tailwind CSS for styling. Include helper functions for URL formatting and quote formatting. The component should render different layouts based on the `variant` prop and handle text/image/mixed clip types.

Ensure the <blockquote> element is used for semantic HTML when rendering clipped text.

Implementation Notes
Key Techniques Used:
TechniqueWhyThree clip types (text/image/mixed)Web clipping varies; supporting all prevents edge casesSemantic blockquoteProper HTML for quoted content, helps accessibilitySmart quote formattingTypography detail that adds polishBroken source handlingLinks die over time; graceful degradation preserves valueExpandable long quotesPreserves full content without overwhelming card
Design Choices:

Blue left border accent — Classic quote styling that's universally recognized. Blue differentiates from yellow (user notes) and maintains visual hierarchy.
Source attribution prominent — Web clips are inherently about "where this came from." Domain in header + full link section ensures proper attribution.
User note in yellow — Clear visual separation between "what you clipped" (blue/gray) and "what you added" (yellow). Users can distinguish at a glance.
Related items in purple — AI/smart features get their own color (purple = "magic"). Doesn't interfere with content hierarchy.
Quotes preserved even if source dies — The clipped content is the user's copy. It should remain accessible regardless of source URL status.


Expected Output Structure
jsx// Grid variant - Text clip
<article className="webclip-card webclip-card--grid webclip-card--text">
  <div className="card-header">
    {data.source.favicon ? (
      <img src={data.source.favicon} className="favicon" alt="" />
    ) : (
      <GlobeIcon className="globe-icon" />
    )}
    <span className="source-text">
      Clipped from <strong>{data.source.domain}</strong>
    </span>
  </div>

  <div className="clipped-content">
    <blockquote cite={data.source.url}>
      <p className={`quote-text ${isExpanded ? 'expanded' : ''}`}>
        {formatQuote(data.clippedText)}
      </p>
      {needsTruncation && (
        <button className="expand-btn" onClick={handleToggle}>
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </blockquote>
  </div>

  <a
    href={data.source.url}
    target="_blank"
    rel="noopener noreferrer"
    className="source-link"
    onClick={(e) => { e.stopPropagation(); onOpenSource(data.source.url); }}
  >
    <DocumentIcon />
    <div className="source-info">
      <span className="source-title">{data.source.title}</span>
      <span className="source-url">{truncateUrl(data.source.url)}</span>
    </div>
    <ArrowRightIcon />
  </a>

  {data.userNote && (
    <div className="user-note">
      <div className="note-header">
        <PencilIcon />
        <span>Your note</span>
      </div>
      <p className="note-text">{data.userNote}</p>
    </div>
  )}

  {data.relatedItems?.length > 0 && (
    <div className="related-items">
      <div className="related-header">
        <SparklesIcon />
        <span>Related in your library</span>
      </div>
      <ul className="related-list">
        {data.relatedItems.map(item => (
          <li key={item.id} onClick={() => onOpenRelated?.(item.id)}>
            <TypeIcon type={item.type} />
            <span>{item.title}</span>
            <ArrowIcon />
          </li>
        ))}
      </ul>
    </div>
  )}

  <div className="hover-actions">
    <button onClick={() => onOpenSource(data.source.url)}>🌐 Open</button>
    <button onClick={onMove}><FolderIcon /></button>
    <button onClick={onTag}><TagIcon /></button>
    <button onClick={onDelete}><TrashIcon /></button>
  </div>

  <div className="card-footer">
    <div className="tags">{renderTags()}</div>
    <span className="timestamp">{formatRelativeTime(data.createdAt)}</span>
  </div>
</article>

Usage Guidelines

Test all clip types — Create clips with text only, image only, and both together
Test long quotes — Paste very long text passages to verify expand/collapse works
Test quote formatting — Verify curly quotes appear correctly
Test source links — Click source link to verify opens in new tab
Test broken sources — Pass an obviously bad URL to verify warning state
Test user notes — Add clips with and without userNote to verify conditional display
Test related items — Pass relatedItems array to verify AI section displays