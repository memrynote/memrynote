Prompt #5: Card — URL/Link
The Prompt
You are building the URL/Link Card component for Memry's inbox. This is a reusable card that displays saved links/bookmarks with rich previews. The card will be used in both Grid View (masonry) and List View (timeline).

## What You Are Building

A content card that displays a saved URL with its preview image, title, domain, description snippet, and tags. The card automatically adapts its layout based on the view context (grid vs list).

## Card Variants

This component has TWO layout variants controlled by a `variant` prop:

1. **Grid Variant** — Vertical card for masonry layout
2. **List Variant** — Horizontal row for timeline layout

---

## VARIANT 1: Grid Card (Masonry)

┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │                                     │ │
│ │         PREVIEW IMAGE               │ │  ← 16:9 aspect ratio container
│ │         (og:image)                  │ │     Object-fit: cover
│ │                                     │ │     Height: 140px
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  Article Title That Might Be Long and   │  ← Title area
│  Wrap to Two Lines Maximum Here...      │     Max 2 lines
│                                         │
│  ┌──────┐                               │
│  │ 🌐   │  example.com                  │  ← Domain with favicon
│  └──────┘                               │
│                                         │
│  "Preview description text from the     │  ← Description (optional)
│  meta description or og:description..." │     Max 2 lines, muted color
│                                         │
│  ───────────────────────────────────    │  ← Divider line
│                                         │
│  ┌────────┐ ┌────────┐                  │
│  │ Design │ │ +2     │         2h ago   │  ← Tags + Timestamp
│  └────────┘ └────────┘                  │
│                                         │
└─────────────────────────────────────────┘

**Card Dimensions:**
- Width: Fluid (determined by grid column)
- Min-width: 280px
- Max-width: 400px
- Padding: 0 (image bleeds to edge), 16px (content area)

### Grid Card Sections

**Image Section:**
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │       Preview Image             │    │
│  │       (og:image)                │    │
│  │                                 │    │
│  │    ┌─────┐                      │    │  ← Hover: Show actions
│  │    │ ⋮   │  (appears on hover)  │    │
│  │    └─────┘                      │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Image container:                       │
│  - Height: 140px                        │
│  - Border-radius: 12px 12px 0 0 (top)   │
│  - Overflow: hidden                     │
│  - Background: gray-100 (placeholder)   │
│                                         │
└─────────────────────────────────────────┘

**Fallback when no image:**
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │    ┌────────────────────┐       │    │
│  │    │                    │       │    │
│  │    │   🌐               │       │    │  ← Large favicon or globe icon
│  │    │   64px             │       │    │     Centered
│  │    │                    │       │    │
│  │    └────────────────────┘       │    │
│  │                                 │    │
│  │    Background: gradient         │    │
│  │    (gray-100 to gray-200)       │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘

**Content Section:**
┌─────────────────────────────────────────┐
│  Padding: 16px                          │
│                                         │
│  TITLE                                  │
│  ─────                                  │
│  Font-size: 15px                        │
│  Font-weight: 600 (semibold)            │
│  Color: gray-900                        │
│  Line-height: 1.4                       │
│  Max lines: 2 (line-clamp-2)            │
│  Margin-bottom: 8px                     │
│                                         │
│  DOMAIN ROW                             │
│  ──────────                             │
│  Flex row, items-center, gap: 6px       │
│  Favicon: 14px × 14px, rounded-sm       │
│  Domain text: 13px, gray-500            │
│  Margin-bottom: 8px                     │
│                                         │
│  DESCRIPTION (if available)             │
│  ───────────                            │
│  Font-size: 13px                        │
│  Color: gray-500                        │
│  Line-height: 1.5                       │
│  Max lines: 2 (line-clamp-2)            │
│  Margin-bottom: 12px                    │
│                                         │
└─────────────────────────────────────────┘

**Footer Section:**
┌─────────────────────────────────────────┐
│                                         │
│  Border-top: 1px solid gray-100         │
│  Padding-top: 12px                      │
│  Display: flex                          │
│  Justify-content: space-between         │
│  Align-items: center                    │
│                                         │
│  TAGS (left side)                       │
│  ────                                   │
│  Flex row, gap: 6px                     │
│  Max visible: 2 tags + overflow count   │
│                                         │
│  Each tag:                              │
│  - Padding: 4px 10px                    │
│  - Font-size: 12px                      │
│  - Color: gray-600                      │
│  - Background: gray-100                 │
│  - Border-radius: 6px                   │
│                                         │
│  Overflow indicator: "+2"               │
│  - Same style as tag                    │
│  - Background: gray-200                 │
│                                         │
│  TIMESTAMP (right side)                 │
│  ─────────                              │
│  Font-size: 12px                        │
│  Color: gray-400                        │
│  Whitespace: nowrap                     │
│                                         │
└─────────────────────────────────────────┘

---

## VARIANT 2: List Card (Timeline)

┌────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                    │
│  ┌────┐  ┌────┐                                                                    │
│  │    │  │ 🔗 │  Article Title That Might Be Quite Long...           2 hours ago  │
│  │ ☐  │  │icon│  example.com · 🏷️ Design · 🏷️ Research                            │
│  │    │  │    │  "Preview description text from meta..."                          │
│  └────┘  └────┘                                                                    │
│                                                                                    │
│  ▲       ▲      ▲                                                   ▲             │
│  │       │      │                                                   │             │
│  Check   Type   Content area                                        Time          │
│  box     icon   (flex-grow)                                                       │
│                                                                                    │
│  Height: auto (min 72px, max ~100px)                                              │
│  Padding: 12px 16px                                                               │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘

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
- Opacity: 0 (hidden by default)
- Opacity: 1 on row hover OR when checked
- Checkbox: 18px × 18px
- Margin-top: 2px (align with first line of text)

**Type Icon Column:**
- Width: 32px
- Height: 32px
- Background: blue-50
- Border-radius: 8px
- Display: flex, items-center, justify-center
- Icon: Link icon, 16px, color: blue-600

**Content Column:**
- Flex: 1 (takes remaining space)
- Display: flex, flex-direction: column
- Gap: 2px

**Content Row 1 — Title + Time:**
- Display: flex, justify-content: space-between, align-items: flex-start
- Title:
  - Font-size: 14px
  - Font-weight: 500
  - Color: gray-900
  - Line-clamp: 1
  - Flex: 1
- Time:
  - Font-size: 12px
  - Color: gray-400
  - Margin-left: 12px
  - White-space: nowrap

**Content Row 2 — Domain + Tags:**
- Display: flex, align-items: center, gap: 8px
- Font-size: 13px
- Color: gray-500
- Domain: includes favicon (12px) + text
- Separator: " · " (middle dot with spaces)
- Tags: inline, max 2 visible

**Content Row 3 — Description (optional):**
- Font-size: 13px
- Color: gray-400
- Line-clamp: 1
- Margin-top: 2px

---

## Card States

### Interaction States

| State | Grid Appearance | List Appearance |
|-------|-----------------|-----------------|
| Default | White bg, subtle shadow | White bg, bottom border |
| Hover | Shadow increases, slight lift (translateY -2px) | bg-gray-50, checkbox visible |
| Selected | Blue-50 bg, blue-200 border (2px) | Blue-50 bg, checkbox checked |
| Focused | Ring-2 ring-blue-500 | Ring-2 ring-blue-500 |
| Loading | Skeleton pulse animation | Skeleton pulse animation |

### Hover Actions (Grid only)

When hovering the grid card, show action buttons on the image:

┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐    │
│  │                            ┌───┐│    │
│  │       Preview Image        │ ⋮ ││    │  ← More menu button
│  │                            └───┘│    │     Top-right corner
│  │                                 │    │
│  │  ┌──────────────────────────┐   │    │
│  │  │ 📁 Move  │ 🏷️ Tag  │ 🗑️  │   │    │  ← Quick action bar
│  │  └──────────────────────────┘   │    │     Bottom of image
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘

**Hover overlay:**
- Background: linear-gradient(transparent 0%, rgba(0,0,0,0.4) 100%)
- Appears on hover with fade transition (150ms)

**More button (⋮):**
- Position: top-right, 8px from edges
- Size: 28px × 28px
- Background: white/90 (slightly transparent)
- Border-radius: 6px
- Icon: 16px, gray-700
- Hover: bg-white

**Quick action bar:**
- Position: bottom, 8px from edges
- Background: white/95
- Border-radius: 8px
- Padding: 4px
- Display: flex, gap: 2px

**Quick action buttons:**
- Size: 32px × 32px
- Border-radius: 6px
- Icon: 14px
- Colors: gray-600
- Hover: bg-gray-100

### Hover Actions (List)

On list row hover, show actions on the right side:

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ☐  🔗  Article Title...                              │ 📁 │ 🏷️ │ ⋮ │           2 hours ago  │
│                                                       └────┴────┴───┘                         │
│                                                       Quick actions appear                    │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

- Actions appear between content and timestamp on hover
- Buttons: 32px × 32px, same style as grid quick actions
- Timestamp shifts left to make room (or actions overlay)

---

## Data Structure
```typescript
interface UrlCardData {
  id: string;
  type: "url";
  url: string;

  // Extracted metadata
  title: string;
  description?: string;
  domain: string;
  favicon?: string;        // URL to favicon
  previewImage?: string;   // URL to og:image

  // User data
  tags: string[];
  notes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // States
  isRead?: boolean;
  isArchived?: boolean;
}
```

## Props Interface
```typescript
interface UrlCardProps {
  // Data
  data: UrlCardData;

  // Variant
  variant: "grid" | "list";

  // Selection
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;

  // Actions
  onClick: (id: string) => void;          // Opens preview panel
  onMove: (id: string) => void;           // Opens move modal
  onTag: (id: string) => void;            // Opens tag editor
  onDelete: (id: string) => void;         // Deletes item
  onOpenExternal: (url: string) => void;  // Opens URL in new tab
}
```

## Timestamp Formatting

| Time Difference | Display |
|-----------------|---------|
| < 1 minute | "Just now" |
| 1-59 minutes | "Xm ago" |
| 1-23 hours | "Xh ago" |
| 1-6 days | "Xd ago" |
| 7+ days | "Mon D" (e.g., "Dec 15") |
| Different year | "Mon D, YYYY" |

## Loading State (Skeleton)

**Grid Skeleton:**
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │  ← Pulsing gray block
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │     Height: 140px
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░           │  ← Title skeleton
│  ░░░░░░░░░░░░░░░░░                     │
│                                         │
│  ░░░░  ░░░░░░░░░░░░                    │  ← Domain skeleton
│                                         │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │  ← Description skeleton
│                                         │
│  ───────────────────────────────────    │
│  ░░░░░░  ░░░░░░             ░░░░░░░░   │  ← Tags + time skeleton
└─────────────────────────────────────────┘

- Use `animate-pulse` on gray-200 backgrounds
- Border-radius matches actual content elements

**List Skeleton:**
┌────────────────────────────────────────────────────────────────────────────────────┐
│  ░░  ░░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░░░░░  │
│            ░░░░░░░░░░░░░░░░░  ░░░░░░░  ░░░░░░░                                    │
│            ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                                      │
└────────────────────────────────────────────────────────────────────────────────────┘

## Error State (Broken Link)

When URL is unreachable or metadata fetch failed:

**Grid:**
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │      ⚠️  Link may be broken         │ │  ← Warning icon + message
│ │                                     │ │     Background: red-50
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  example.com/some/broken/path           │  ← Show URL as title
│                                         │
│  ┌──────┐                               │
│  │ 🌐   │  example.com                  │
│  └──────┘                               │
│                                         │
│  ───────────────────────────────────    │
│  [ 🔄 Retry ]               2h ago      │  ← Retry button instead of tags
└─────────────────────────────────────────┘

- Image area: bg-red-50, centered warning icon (24px), text: "Link may be broken"
- Title: Falls back to URL path
- Footer: Shows "Retry" button to re-fetch metadata

## Accessibility Requirements

- Card container: role="article", aria-labelledby pointing to title
- Checkbox: aria-label="Select {title}"
- Image: alt text = title or "Preview for {domain}"
- Interactive elements: Visible focus states (ring-2)
- Hover actions: Also keyboard accessible (Tab into card reveals actions)
- External link indicator: aria-label includes "opens in new tab"

## Click Behavior

| Target | Action |
|--------|--------|
| Card body (not actions) | Trigger onClick → opens preview panel |
| Checkbox | Toggle selection |
| Move button | Trigger onMove |
| Tag button | Trigger onTag |
| Delete button | Trigger onDelete |
| More menu (⋮) | Show dropdown with: Open link, Copy URL, Archive, Delete |

## Verification Checklist

After building, verify:
☐ Grid variant displays correctly with all elements
☐ List variant displays correctly with horizontal layout
☐ Image loads and covers container properly
☐ Fallback (no image) shows gradient + favicon/icon
☐ Title truncates at 2 lines (grid) / 1 line (list)
☐ Description truncates properly
☐ Tags show max 2 + overflow count
☐ Timestamp formats correctly for various ages
☐ Hover state on grid shows shadow lift
☐ Hover state on list shows background + checkbox
☐ Hover reveals quick action buttons
☐ Selection state shows blue styling
☐ Loading skeleton animates
☐ Error state shows warning and retry
☐ Checkbox toggles selection
☐ Quick actions trigger correct callbacks

## Output

Create a React component called UrlCard that accepts the props defined above. Use Tailwind CSS for styling. The component should render different layouts based on the `variant` prop. Export this component for use in the inbox grid and list views.

Include a helper function `formatRelativeTime(date: Date): string` for timestamp formatting.

Implementation Notes
Key Techniques Used:
TechniqueWhyDual variant designOne component serves both views, reducing code duplicationExplicit skeleton layoutsLoading states often forgotten; specifying ensures good UXError state with retryURLs can break; graceful handling maintains trustHover action layersGrid and list need different action patternsData interface providedEnsures component matches expected data shape
Design Choices:

16:9 image container — Standard aspect ratio prevents layout shift as images load. Object-fit cover ensures consistent appearance regardless of source image dimensions.
Favicon + domain — Shows source at a glance without reading full URL. Favicon builds trust and recognition.
2-tag limit with overflow — Prevents tag sprawl from breaking layout. "+2" indicator shows more exist without clutter.
Actions on hover only — Keeps default state clean. Power users discover actions; casual users click card to see details.
Separate checkbox column (list) — Enables multi-select workflow without interfering with click-to-open. Checkbox visibility on hover hints at capability.


Expected Output Structure
jsx// Grid variant
<article className="url-card url-card--grid">
  <div className="card-image">
    {previewImage ? (
      <img src={previewImage} alt={title} />
    ) : (
      <div className="image-fallback">
        <GlobeIcon />
      </div>
    )}
    <div className="hover-overlay">
      <button className="more-btn">⋮</button>
      <div className="quick-actions">
        <button onClick={onMove}>📁</button>
        <button onClick={onTag}>🏷️</button>
        <button onClick={onDelete}>🗑️</button>
      </div>
    </div>
  </div>

  <div className="card-content">
    <h3 className="title">{title}</h3>
    <div className="domain-row">
      <img src={favicon} className="favicon" />
      <span>{domain}</span>
    </div>
    {description && <p className="description">{description}</p>}
  </div>

  <div className="card-footer">
    <div className="tags">{renderTags()}</div>
    <span className="timestamp">{formatRelativeTime(createdAt)}</span>
  </div>
</article>

// List variant
<article className="url-card url-card--list">
  <input type="checkbox" checked={isSelected} onChange={handleSelect} />
  <div className="type-icon"><LinkIcon /></div>
  <div className="content">
    <div className="row-1">
      <h3 className="title">{title}</h3>
      <span className="timestamp">{formatRelativeTime(createdAt)}</span>
    </div>
    <div className="row-2">
      <span className="domain">{domain}</span>
      <span className="separator">·</span>
      {renderInlineTags()}
    </div>
    {description && <p className="row-3">{description}</p>}
  </div>
</article>

Usage Guidelines

Test both variants — Render with variant="grid" and variant="list" to verify both layouts
Test with/without image — Pass data with and without previewImage to verify fallback
Test long content — Use very long titles and descriptions to verify truncation
Test many tags — Pass 5+ tags to verify overflow count displays
Test selection — Toggle isSelected prop to verify selection styling