Prompt #7: Card — Image
The Prompt
You are building the Image Card component for Memry's inbox. This is a reusable card that displays uploaded images with thumbnails, metadata, AI-detected content tags, and optional user captions. The card will be used in both Grid View (masonry) and List View (timeline).

## What You Are Building

A content card that displays uploaded images with prominent visual preview, file information, AI-generated content descriptions, and user-added metadata. The card handles single images and multi-image uploads differently.

## Card Variants

This component has TWO layout variants controlled by a `variant` prop:

1. **Grid Variant** — Vertical card with large image for masonry layout
2. **List Variant** — Horizontal row with thumbnail for timeline layout

Additionally, images can be:

1. **Single Image** — One image uploaded
2. **Multi-Image** — Multiple images uploaded together (batch)

---

## VARIANT 1: Grid Card (Masonry) — Single Image

┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │                                     │ │
│ │                                     │ │
│ │          IMAGE THUMBNAIL            │ │  ← Proportional height
│ │          (preserves aspect ratio)   │ │     Min: 140px, Max: 300px
│ │                                     │ │     Object-fit: cover
│ │                                     │ │
│ │                                     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  🖼️  screenshot.png                     │  ← Filename with icon
│                                         │
│  1.2 MB · 1920 × 1080                   │  ← File size + dimensions
│                                         │
│  AI: dashboard, chart, analytics,       │  ← AI-detected content
│  dark mode, sidebar                     │     (clickable tags)
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ┌─────────────┐                        │
│  │ Screenshots │               4h ago   │  ← User tags + timestamp
│  └─────────────┘                        │
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
- Padding: 0 (image bleeds) / 16px (content)
- Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04)
- Overflow: hidden

### Image Section

┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │                                 │    │
│  │       IMAGE THUMBNAIL           │    │
│  │                                 │    │
│  │    ┌─────┐           ┌─────┐    │    │  ← Hover: actions appear
│  │    │ 🔍  │           │  ⋮  │    │    │
│  │    └─────┘           └─────┘    │    │
│  │    Zoom              More       │    │
│  │                                 │    │
│  │  ┌────────────────────────────┐ │    │
│  │  │ 📁 Move │ 🏷️ Tag │ ⬇️ │ 🗑️ │ │    │  ← Action bar (bottom)
│  │  └────────────────────────────┘ │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘

**Image Container:**
- Width: 100%
- Height: Auto (proportional to image aspect ratio)
- Min-height: 140px
- Max-height: 300px
- Border-radius: 12px 12px 0 0 (top corners only)
- Overflow: hidden
- Background: gray-100 (shows during load)
- Position: relative (for overlay positioning)

**Image Element:**
- Object-fit: cover (for very tall/wide images)
- Object-position: center
- Width: 100%
- Height: 100%
- Transition: transform 150ms (for hover zoom effect)

**Aspect Ratio Handling:**
| Image Aspect | Behavior |
|--------------|----------|
| Landscape (16:9, 4:3) | Show full width, natural height (capped at 300px) |
| Square (1:1) | Show at natural size up to 300px |
| Portrait (9:16, 3:4) | Crop to max 300px height, show center |
| Panoramic (21:9, 3:1) | Show full width, height ~140-160px |

**Hover Overlay:**
- Background: linear-gradient(transparent 0%, rgba(0,0,0,0.5) 100%)
- Opacity: 0 → 1 on hover
- Transition: opacity 150ms ease

**Zoom Button (top-left on hover):**
- Position: absolute, top: 8px, left: 8px
- Size: 32px × 32px
- Background: white/90 (backdrop-blur)
- Border-radius: 8px
- Icon: Magnifying glass with plus, 16px
- Hover: bg-white
- Purpose: Opens image in lightbox/fullscreen

**More Button (top-right on hover):**
- Position: absolute, top: 8px, right: 8px
- Size: 32px × 32px
- Background: white/90
- Border-radius: 8px
- Icon: Three dots vertical, 16px

**Quick Action Bar (bottom on hover):**
- Position: absolute, bottom: 8px, left: 8px, right: 8px
- Background: white/95 (backdrop-blur)
- Border-radius: 8px
- Padding: 4px
- Display: flex, justify-content: center, gap: 4px

**Action Buttons:**
- Size: 32px × 32px each
- Border-radius: 6px
- Icon: 14px, gray-600
- Hover: bg-gray-100

| Button | Icon | Action |
|--------|------|--------|
| Move | 📁 Folder | Opens move modal |
| Tag | 🏷️ Tag | Opens tag editor |
| Download | ⬇️ Arrow down | Downloads original image |
| Delete | 🗑️ Trash | Deletes image |

### Content Section

┌─────────────────────────────────────────┐
│                                         │
│  Padding: 16px                          │
│                                         │
│  FILENAME ROW                           │
│  ────────────                           │
│  ┌────┐                                 │
│  │ 🖼️ │  screenshot.png                 │
│  └────┘  ───────────────                │
│  ▲       Filename                       │
│  │       14px, medium, gray-900         │
│  Icon    Truncate with ellipsis         │
│  16px                                   │
│  gray-500                               │
│                                         │
│  Flex row, items-center, gap: 8px       │
│  Margin-bottom: 4px                     │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  METADATA ROW                           │
│  ────────────                           │
│  1.2 MB · 1920 × 1080                   │
│                                         │
│  Font-size: 13px                        │
│  Color: gray-500                        │
│  Margin-bottom: 8px                     │
│                                         │
│  Format: {size} · {width} × {height}    │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  AI TAGS ROW (if available)             │
│  ────────────                           │
│  AI: dashboard, chart, analytics,       │
│  dark mode, sidebar                     │
│                                         │
│  "AI:" prefix in gray-400               │
│  Tags in gray-500, comma-separated      │
│  Clickable (filter by AI tag)           │
│  Line-clamp: 2                          │
│  Margin-bottom: 8px                     │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  CAPTION (if user added)                │
│  ───────                                │
│  "Dashboard redesign concept - v2"      │
│                                         │
│  Font-size: 14px                        │
│  Color: gray-700                        │
│  Font-style: normal                     │
│  Line-clamp: 2                          │
│                                         │
└─────────────────────────────────────────┘

### Footer Section

┌─────────────────────────────────────────┐
│                                         │
│  ───────────────────────────────────    │  ← Divider: 1px gray-100
│                                         │
│  ┌─────────────┐                        │
│  │ Screenshots │               4h ago   │  ← User tags + timestamp
│  └─────────────┘                        │
│                                         │
│  Same style as other cards              │
│  Max 2 tags + overflow                  │
│                                         │
└─────────────────────────────────────────┘

---

## VARIANT 1: Grid Card — Multi-Image

When multiple images were uploaded together:

┌─────────────────────────────────────────┐
│ ┌───────────────────┬─────────────────┐ │
│ │                   │                 │ │
│ │                   │    Image 2      │ │
│ │     Image 1       │                 │ │
│ │     (primary)     ├─────────────────┤ │
│ │                   │                 │ │
│ │                   │    +3 more      │ │  ← Overlay showing count
│ │                   │                 │ │
│ └───────────────────┴─────────────────┘ │
│                                         │
│  🖼️  Uploaded 5 images                  │  ← Count instead of filename
│                                         │
│  4.8 MB total                           │  ← Combined file size
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ┌────────────┐                         │
│  │ Inspiration │              2h ago    │
│  └────────────┘                         │
│                                         │
└─────────────────────────────────────────┘

**Multi-Image Grid Layout:**
For 2 images:
┌────────────┬────────────┐
│            │            │
│   Image 1  │   Image 2  │
│            │            │
└────────────┴────────────┘
50% / 50% width
For 3 images:
┌────────────┬────────────┐
│            │   Image 2  │
│   Image 1  ├────────────┤
│            │   Image 3  │
└────────────┴────────────┘
60% / 40% width
For 4+ images:
┌────────────┬────────────┐
│            │   Image 2  │
│   Image 1  ├────────────┤
│            │  +N more   │
└────────────┴────────────┘
Show first 2, overlay count on position 3

**Overflow Indicator (+N more):**
- Background: rgba(0, 0, 0, 0.6)
- Color: white
- Font-size: 16px
- Font-weight: 600
- Display: flex, items-center, justify-center
- Full size of that grid cell

---

## VARIANT 2: List Card (Timeline)

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                 │
│  ┌────┐  ┌────┐                                                           ┌──────────────────┐ │
│  │    │  │ 🖼️ │  screenshot.png                                4 hours ago │                  │ │
│  │ ☐  │  │icon│  1.2 MB · 1920 × 1080                                      │    Thumbnail     │ │
│  │    │  │    │  AI: dashboard, chart, analytics...                        │    (64 × 64)     │ │
│  └────┘  └────┘                                                           └──────────────────┘ │
│                                                                                                 │
│  ▲       ▲      ▲                                                          ▲                   │
│  │       │      │                                                          │                   │
│  Check   Type   Content                                                    Thumb               │
│  box     icon   area                                                       preview             │
│                                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

### List Card Structure

**Layout:**
- Display: flex row
- Align-items: center
- Gap: 12px
- Padding: 12px 16px
- Background: white
- Border-bottom: 1px solid gray-100
- Min-height: 80px

**Checkbox Column:**
- Width: 24px
- Opacity: 0 by default, 1 on hover/selected
- Checkbox: 18px × 18px

**Type Icon Column:**
- Width: 32px, Height: 32px
- Background: purple-50
- Border-radius: 8px
- Icon: Image icon, 16px, purple-600

**Content Column:**
- Flex: 1
- Display: flex, flex-direction: column
- Gap: 2px

*Row 1 — Filename + Time:*
- Filename: 14px, font-weight: 500, gray-900, line-clamp-1
- Time: 12px, gray-400, right-aligned

*Row 2 — Metadata:*
- "1.2 MB · 1920 × 1080"
- Font-size: 13px, gray-500

*Row 3 — AI Tags (optional):*
- "AI: dashboard, chart, analytics..."
- Font-size: 13px, gray-400
- Line-clamp: 1

**Thumbnail Column:**
- Width: 64px
- Height: 64px
- Border-radius: 8px
- Overflow: hidden
- Object-fit: cover
- Margin-left: auto (pushes to right)
- Flex-shrink: 0

**Multi-Image in List:**
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                 │
│  ☐   🖼️   5 images                                              2h ago   ┌────┬────┬────┬────┐  │
│           4.8 MB total                                                   │img1│img2│img3│+2  │  │
│           AI: various subjects...                                        └────┴────┴────┴────┘  │
│                                                                                                 │
│                                                                          Stacked thumbnails     │
│                                                                          4 × 48px squares       │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

**Stacked Thumbnails (Multi-Image List):**
- Container: flex row, gap: 2px
- Each thumbnail: 48px × 48px
- Max visible: 3 images + overflow indicator
- Overflow: "+N" in gray-200 box

---

## Card States

### Interaction States

| State | Grid Appearance | List Appearance |
|-------|-----------------|-----------------|
| Default | White bg, subtle border | White bg, bottom border |
| Hover | Shadow lift, image slight scale (1.02) | bg-gray-50, checkbox visible |
| Selected | bg-blue-50, border-blue-200 | bg-blue-50, checkbox checked |
| Focused | ring-2 ring-blue-500 | ring-2 ring-blue-500 |
| Loading | Skeleton pulse | Skeleton pulse |

### Image Loading States

**Loading (before image loads):**
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │  ← Pulsing gray placeholder
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │     Aspect ratio preserved
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │     if dimensions known
│ └─────────────────────────────────────┘ │
│                                         │
│  ░░░░░░░░░░░░░░░░░░░░░                  │
│  ░░░░░░░░░░░░░░░                        │
└─────────────────────────────────────────┘

**Blur-up Loading (progressive):**
1. Show low-res placeholder (blurred thumbnail)
2. Load full image in background
3. Crossfade to full image when loaded

**Error (image failed to load):**
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │         ⚠️                          │ │
│ │     Image unavailable               │ │  ← Error state
│ │     [ 🔄 Retry ]                    │ │     Gray-100 background
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  🖼️  screenshot.png                     │
│  File may be corrupted or missing       │
└─────────────────────────────────────────┘

---

## Data Structure
```typescript
interface ImageCardData {
  id: string;
  type: "image";

  // Single image or multiple
  images: ImageFile[];

  // User data
  caption?: string;
  tags: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // States
  isArchived?: boolean;
}

interface ImageFile {
  id: string;
  filename: string;
  url: string;                    // URL to display image
  thumbnailUrl?: string;          // URL to thumbnail version

  // Metadata
  size: number;                   // Bytes
  width: number;
  height: number;
  mimeType: string;               // image/png, image/jpeg, etc.

  // AI analysis
  aiTags?: string[];              // Detected objects/scenes
  aiDescription?: string;         // Generated description
  dominantColors?: string[];      // Hex color codes

  // States
  isLoading?: boolean;
  hasError?: boolean;
}
```

## Props Interface
```typescript
interface ImageCardProps {
  // Data
  data: ImageCardData;

  // Variant
  variant: "grid" | "list";

  // Selection
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;

  // Actions
  onClick: (id: string) => void;              // Opens preview panel
  onImageClick: (id: string, imageIndex: number) => void;  // Opens lightbox
  onMove: (id: string) => void;
  onTag: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;           // Downloads image(s)
}
```

## File Size Formatting
```typescript
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const size = bytes / Math.pow(k, i);

  // Show decimal for MB and above, or if less than 10
  if (i >= 2 || size < 10) {
    return `${size.toFixed(1)} ${units[i]}`;
  }

  return `${Math.round(size)} ${units[i]}`;
}
```

**Examples:**
- 512 → "512 B"
- 1536 → "1.5 KB"
- 1258291 → "1.2 MB"
- 4831838208 → "4.5 GB"

## Dimension Formatting
```typescript
function formatDimensions(width: number, height: number): string {
  return `${width.toLocaleString()} × ${height.toLocaleString()}`;
}
```

**Examples:**
- 1920, 1080 → "1,920 × 1,080"
- 800, 600 → "800 × 600"

## AI Tags Display

┌─────────────────────────────────────────┐
│                                         │
│  AI:  dashboard, chart, analytics,      │
│       dark mode, sidebar                │
│                                         │
│  ▲    ▲                                 │
│  │    │                                 │
│  │    Comma-separated tags              │
│  │    gray-500                          │
│  │    Each tag clickable                │
│  │    Hover: underline                  │
│  │                                      │
│  "AI:" label                            │
│  gray-400, font-weight: 500             │
│                                         │
└─────────────────────────────────────────┘

- Prefix: "AI:" in gray-400, slightly bolder
- Tags: Comma-separated, gray-500
- Each tag is clickable (triggers filter by AI tag)
- Hover on tag: text-decoration underline, cursor pointer
- Line-clamp: 2 (grid) or 1 (list)
- If no AI tags: Don't show this row at all

## Lightbox Trigger

Clicking the image (not action buttons) should open a lightbox/preview:

**Click targets:**
| Element | Action |
|---------|--------|
| Image area | Opens lightbox at clicked image |
| Zoom button | Opens lightbox |
| Card body (below image) | Opens preview panel |
| Thumbnail (list view) | Opens lightbox |

**Lightbox data to pass:**
```typescript
onImageClick(cardId, imageIndex)
// imageIndex = 0 for single image
// imageIndex = 0, 1, 2... for multi-image
```

## Loading Skeleton

**Grid Skeleton:**
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │  ← Image skeleton
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │     Height: 180px default
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  ░░░░  ░░░░░░░░░░░░░░░░░░               │  ← Filename skeleton
│                                         │
│  ░░░░░░░░░░░░░░░░░░░░                   │  ← Metadata skeleton
│                                         │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │  ← AI tags skeleton
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ░░░░░░░░░░               ░░░░░░░░     │  ← Tags + time skeleton
│                                         │
└─────────────────────────────────────────┘

**List Skeleton:**
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ░░  ░░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░░   ┌────────────────┐ │
│            ░░░░░░░░░░░░░░░░░                                                    │ ░░░░░░░░░░░░░░ │ │
│            ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                                        └────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘

## Accessibility Requirements

- Card container: role="article", aria-label="Image: {filename}"
- Image: alt="{aiDescription || filename}"
- Zoom button: aria-label="View {filename} full size"
- Download button: aria-label="Download {filename}"
- Multi-image: aria-label="Image gallery: {count} images"
- Thumbnail in list: role="img", aria-hidden if decorative
- AI tags: Each tag is a button with aria-label="Filter by {tag}"
- Checkbox: aria-label="Select {filename}"

## Verification Checklist

After building, verify:
☐ Grid variant displays single image correctly
☐ Grid variant displays multi-image grid correctly
☐ List variant displays with thumbnail on right
☐ Image loads with blur-up or skeleton placeholder
☐ Aspect ratio is preserved (no stretching)
☐ Very tall images are cropped appropriately
☐ Very wide images display correctly
☐ File size formats correctly (KB, MB, GB)
☐ Dimensions format with comma separators for large numbers
☐ AI tags display and are clickable
☐ Hover reveals action buttons on image
☐ Zoom button opens lightbox
☐ Download button triggers download
☐ Multi-image shows correct count (+N more)
☐ Multi-image thumbnail stack in list view works
☐ Error state shows when image fails to load
☐ Selection state shows blue styling
☐ Loading skeleton displays before image loads

## Output

Create a React component called ImageCard that accepts the props defined above. Use Tailwind CSS for styling. Include helper functions for file size formatting and dimension formatting. The component should render different layouts based on the `variant` prop and handle single vs multi-image displays.

Implementation Notes
Key Techniques Used:
TechniqueWhyAspect ratio handling tableImages vary wildly; explicit rules prevent layout breaksMulti-image grid patternsVisual spec for 2, 3, 4+ images removes ambiguityBlur-up loading mentionProgressive loading improves perceived performanceSeparate image click handlerDistinguishes lightbox open vs preview panel openFile size formatting functionEnsures consistent display across all sizes
Design Choices:

Max height cap (300px) — Prevents very tall images from dominating the masonry grid. Cover + crop shows the center, which is usually the most important part.
AI tags as clickable filters — Enables discovery. User sees "dashboard" tag, clicks it, finds all dashboard-related images. Transforms AI analysis into useful feature.
Thumbnail on right (list view) — Keeps primary content (filename, metadata) left-aligned for scanning. Thumbnail provides visual recognition without dominating.
Zoom vs Card click distinction — Zoom button on image opens lightbox for image viewing. Clicking card body (below image) opens preview panel for metadata/editing. Avoids confusion about what click does.
Stacked thumbnails for multi-image (list) — Shows batch nature at a glance. "+2" overlay indicates more without cluttering.


Expected Output Structure
jsx// Grid variant - Single image
<article className="image-card image-card--grid">
  <div className="card-image" onClick={() => onImageClick(data.id, 0)}>
    <img
      src={images[0].url}
      alt={images[0].aiDescription || images[0].filename}
      loading="lazy"
    />

    <div className="hover-overlay">
      <button className="zoom-btn" aria-label="View full size">
        <ZoomIcon />
      </button>
      <button className="more-btn">
        <MoreIcon />
      </button>
      <div className="quick-actions">
        <button onClick={onMove}><FolderIcon /></button>
        <button onClick={onTag}><TagIcon /></button>
        <button onClick={onDownload}><DownloadIcon /></button>
        <button onClick={onDelete}><TrashIcon /></button>
      </div>
    </div>
  </div>

  <div className="card-content" onClick={() => onClick(data.id)}>
    <div className="filename-row">
      <ImageIcon className="type-icon" />
      <span className="filename">{images[0].filename}</span>
    </div>

    <div className="metadata-row">
      {formatFileSize(images[0].size)} · {formatDimensions(images[0].width, images[0].height)}
    </div>

    {images[0].aiTags?.length > 0 && (
      <div className="ai-tags-row">
        <span className="ai-label">AI:</span>
        {images[0].aiTags.map(tag => (
          <button key={tag} className="ai-tag" onClick={() => onFilterByTag(tag)}>
            {tag}
          </button>
        ))}
      </div>
    )}

    {data.caption && (
      <p className="caption">{data.caption}</p>
    )}
  </div>

  <div className="card-footer">
    <div className="tags">{renderTags()}</div>
    <span className="timestamp">{formatRelativeTime(data.createdAt)}</span>
  </div>
</article>

// List variant
<article className="image-card image-card--list">
  <input type="checkbox" checked={isSelected} onChange={handleSelect} />

  <div className="type-icon-container">
    <ImageIcon />
  </div>

  <div className="content">
    <div className="row-1">
      <span className="filename">{images[0].filename}</span>
      <span className="timestamp">{formatRelativeTime(data.createdAt)}</span>
    </div>
    <div className="row-2">
      {formatFileSize(totalSize)} · {formatDimensions(images[0].width, images[0].height)}
    </div>
    {aiTags && (
      <div className="row-3">AI: {aiTags.join(', ')}</div>
    )}
  </div>

  <div className="thumbnail" onClick={() => onImageClick(data.id, 0)}>
    <img src={images[0].thumbnailUrl || images[0].url} alt="" />
  </div>
</article>

Usage Guidelines

Test aspect ratios — Use landscape, portrait, square, and panoramic images to verify display
Test multi-image — Upload 2, 3, 5 images together to verify grid layouts
Test large files — Verify file size formatting with KB, MB, GB values
Test AI tags — Pass various aiTags arrays to verify display and click handling
Test loading — Throttle network to observe skeleton/blur-up behavior
Test error — Pass invalid URL to verify error state display