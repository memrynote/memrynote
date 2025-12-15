Prompt #16: Quick Preview Popup
The Prompt
You are building the Quick Preview Popup for Memry's inbox. This is a lightweight, hover-triggered preview that appears when users hover over an inbox item, providing a quick glance at content without opening the full preview panel.

## What You Are Building

A floating popup component that:
1. Appears on hover (with configurable delay) over inbox cards
2. Shows a condensed preview of the item content
3. Provides quick action buttons without opening full preview
4. Positions intelligently to stay within viewport
5. Supports keyboard activation (focus + Enter or Space)
6. Dismisses on mouse leave or Escape

## Quick Preview vs Full Preview

| Aspect | Quick Preview Popup | Full Preview Panel |
|--------|--------------------|--------------------|
| Trigger | Hover (500ms delay) | Click |
| Size | Small (320-400px wide) | Large (50% viewport) |
| Content | Condensed summary | Full detail + editing |
| Actions | Quick actions only | All actions + editing |
| Persistence | Disappears on mouse leave | Stays until closed |
| Use case | Quick scan/triage | Deep work/editing |

---

## Popup Positioning
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  INBOX GRID VIEW                                                                                    │
│                                                                                                     │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐                                   │
│  │                 │   │                 │   │                 │                                   │
│  │    Card 1       │   │    Card 2       │   │    Card 3       │                                   │
│  │                 │   │    (hovered)    │   │                 │                                   │
│  │                 │   │       ↓         │   │                 │                                   │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘                                   │
│                              │                                                                      │
│                              │                                                                      │
│                              ▼                                                                      │
│                        ┌─────────────────────────────────────┐                                     │
│                        │                                     │                                     │
│                        │      QUICK PREVIEW POPUP            │                                     │
│                        │                                     │                                     │
│                        │      Positioned below card          │                                     │
│                        │      (or above if no room)          │                                     │
│                        │                                     │                                     │
│                        │      Arrow points to source         │                                     │
│                        │                                     │                                     │
│                        └─────────────────────────────────────┘                                     │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Position Logic
```typescript
type PopupPosition = "top" | "bottom" | "left" | "right";

interface PopupPlacement {
  position: PopupPosition;
  alignment: "start" | "center" | "end";
  arrowOffset: number;  // Offset from edge for arrow pointer
}

function calculatePopupPlacement(
  triggerRect: DOMRect,
  popupSize: { width: number; height: number },
  viewportPadding: number = 16
): PopupPlacement {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Check available space in each direction
  const spaceBelow = viewport.height - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  const spaceRight = viewport.width - triggerRect.right;
  const spaceLeft = triggerRect.left;

  // Prefer below, then above, then right, then left
  let position: PopupPosition;

  if (spaceBelow >= popupSize.height + viewportPadding) {
    position = "bottom";
  } else if (spaceAbove >= popupSize.height + viewportPadding) {
    position = "top";
  } else if (spaceRight >= popupSize.width + viewportPadding) {
    position = "right";
  } else {
    position = "left";
  }

  // Calculate horizontal alignment (for top/bottom positions)
  let alignment: "start" | "center" | "end" = "center";

  if (position === "top" || position === "bottom") {
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    const popupHalfWidth = popupSize.width / 2;

    if (triggerCenter - popupHalfWidth < viewportPadding) {
      alignment = "start";
    } else if (triggerCenter + popupHalfWidth > viewport.width - viewportPadding) {
      alignment = "end";
    }
  }

  return { position, alignment, arrowOffset: calculateArrowOffset(...) };
}
```

---

## Popup Container

### Base Structure
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Quick Preview Popup Container:                                             │
│                                                                             │
│  - Position: fixed (to viewport)                                            │
│  - Width: 360px                                                             │
│  - Max-width: calc(100vw - 32px)                                            │
│  - Max-height: 400px                                                        │
│  - Background: white                                                        │
│  - Border-radius: 12px                                                      │
│  - Border: 1px solid gray-200                                               │
│  - Box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),                              │
│                0 2px 8px rgba(0, 0, 0, 0.08)                                │
│  - Z-index: 50                                                              │
│  - Overflow: hidden                                                         │
│                                                                             │
│  Arrow pointer:                                                             │
│  - Size: 12px × 12px (rotated square)                                       │
│  - Background: white                                                        │
│  - Border: 1px solid gray-200 (only visible sides)                          │
│  - Position: Attached to edge pointing at trigger                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Arrow Styles
```css
/* Arrow pointing up (popup below trigger) */
.popup-arrow-top {
  position: absolute;
  top: -6px;
  width: 12px;
  height: 12px;
  background: white;
  border-left: 1px solid rgb(229 231 235);
  border-top: 1px solid rgb(229 231 235);
  transform: rotate(45deg);
}

/* Arrow pointing down (popup above trigger) */
.popup-arrow-bottom {
  position: absolute;
  bottom: -6px;
  width: 12px;
  height: 12px;
  background: white;
  border-right: 1px solid rgb(229 231 235);
  border-bottom: 1px solid rgb(229 231 235);
  transform: rotate(45deg);
}

/* Arrow pointing left (popup to right of trigger) */
.popup-arrow-left {
  position: absolute;
  left: -6px;
  width: 12px;
  height: 12px;
  background: white;
  border-left: 1px solid rgb(229 231 235);
  border-bottom: 1px solid rgb(229 231 235);
  transform: rotate(45deg);
}

/* Arrow pointing right (popup to left of trigger) */
.popup-arrow-right {
  position: absolute;
  right: -6px;
  width: 12px;
  height: 12px;
  background: white;
  border-right: 1px solid rgb(229 231 235);
  border-top: 1px solid rgb(229 231 235);
  transform: rotate(45deg);
}
```

---

## Popup Internal Structure

### Common Layout (All Types)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  HEADER                                                               │  │
│  │  ──────                                                               │  │
│  │  Type icon + Title + Close button                                     │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  CONTENT                                                              │  │
│  │  ───────                                                              │  │
│  │  Type-specific preview content                                        │  │
│  │  (varies by item type)                                                │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  FOOTER                                                               │  │
│  │  ──────                                                               │  │
│  │  Quick actions + "Open full preview" link                             │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Header Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌────┐                                                       ┌────┐ │  │
│  │  │ 🔗 │   Article Title That Might Be...               2h     │ ✕  │ │  │
│  │  │icon│   ─────────────────────────────                       │close│ │  │
│  │  └────┘   example.com                                         └────┘ │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Container:                                                                 │
│  - Padding: 12px 12px 12px 14px                                             │
│  - Border-bottom: 1px solid gray-100                                        │
│  - Display: flex                                                            │
│  - Align-items: flex-start                                                  │
│  - Gap: 10px                                                                │
│                                                                             │
│  Type icon:                                                                 │
│  - Size: 28px × 28px                                                        │
│  - Border-radius: 6px                                                       │
│  - Background: (type color)-50                                              │
│  - Icon: 14px, (type color)-600                                             │
│  - Flex-shrink: 0                                                           │
│                                                                             │
│  Title area:                                                                │
│  - Flex: 1                                                                  │
│  - Min-width: 0                                                             │
│                                                                             │
│  Title:                                                                     │
│  - Font-size: 14px                                                          │
│  - Font-weight: 500                                                         │
│  - Color: gray-900                                                          │
│  - Line-clamp: 1                                                            │
│                                                                             │
│  Subtitle:                                                                  │
│  - Font-size: 12px                                                          │
│  - Color: gray-500                                                          │
│  - Line-clamp: 1                                                            │
│  - Margin-top: 2px                                                          │
│                                                                             │
│  Time badge:                                                                │
│  - Font-size: 11px                                                          │
│  - Color: gray-400                                                          │
│  - White-space: nowrap                                                      │
│  - Margin-left: auto                                                        │
│                                                                             │
│  Close button:                                                              │
│  - Size: 24px × 24px                                                        │
│  - Border-radius: 4px                                                       │
│  - Background: transparent                                                  │
│  - Icon: 14px, gray-400                                                     │
│  - Hover: bg-gray-100, icon gray-600                                        │
│  - Only shows on popup hover (subtle)                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Footer Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │   ┌───────┐ ┌───────┐ ┌───────┐                 Open full preview →  │  │
│  │   │ 📁    │ │ 🏷️    │ │ 🗑️    │                                       │  │
│  │   │ Move  │ │ Tag   │ │Delete │                 ─────────────────────  │  │
│  │   └───────┘ └───────┘ └───────┘                 Link to full panel    │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Container:                                                                 │
│  - Padding: 10px 12px                                                       │
│  - Border-top: 1px solid gray-100                                           │
│  - Background: gray-50                                                      │
│  - Display: flex                                                            │
│  - Justify-content: space-between                                           │
│  - Align-items: center                                                      │
│                                                                             │
│  Quick action buttons:                                                      │
│  - Display: flex                                                            │
│  - Gap: 4px                                                                 │
│                                                                             │
│  Each button:                                                               │
│  - Size: 32px × 32px                                                        │
│  - Border-radius: 6px                                                       │
│  - Background: white                                                        │
│  - Border: 1px solid gray-200                                               │
│  - Icon: 14px, gray-500                                                     │
│  - Hover: bg-gray-100, icon gray-700                                        │
│  - Delete hover: bg-red-50, border-red-200, icon red-600                    │
│                                                                             │
│  Open full preview link:                                                    │
│  - Font-size: 12px                                                          │
│  - Color: gray-500                                                          │
│  - Hover: color blue-600, underline                                         │
│  - Icon: → arrow right, 12px                                                │
│  - Cursor: pointer                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Content by Item Type

### URL/Link Quick Preview
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌────┐                                                              ┌────┐ │
│  │ 🔗 │   Design Systems: A Complete Guide                    2h     │ ✕  │ │
│  └────┘   medium.com                                                 └────┘ │
│  ───────────────────────────────────────────────────────────────────────────│
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │                    PREVIEW IMAGE                                      │  │
│  │                    (if available)                                     │  │
│  │                                                                       │  │
│  │                    Height: 140px                                      │  │
│  │                    Object-fit: cover                                  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  "A comprehensive guide to building and maintaining design systems         │
│  that scale. Learn from companies like Shopify, Atlassian, and..."        │
│  ─────────────────────────────────────────────────────────────────         │
│  Meta description (3 lines max, then fade)                                 │
│                                                                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                                 │
│  │  #design  │ │ #systems  │ │    +1     │                                 │
│  └───────────┘ └───────────┘ └───────────┘                                 │
│  Tags (max 2 visible + overflow count)                                     │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────────│
│   📁   🏷️   🗑️                                     Open full preview →     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Content section:

Padding: 12px 14px

Image:

Width: 100%
Height: 140px
Object-fit: cover
Border-radius: 6px
Margin-bottom: 10px

If no image:

Hide image section entirely
Description gets more space

Description:

Font-size: 13px
Line-height: 1.5
Color: gray-600
Line-clamp: 3
Fade effect at bottom if truncated

Tags container:

Margin-top: 10px
Display: flex
Gap: 6px
Flex-wrap: nowrap (to maintain compact layout)

Tag chips (compact):

Height: 24px
Padding: 0 8px
Font-size: 11px
Background: gray-100
Color: gray-600
Border-radius: 4px

Overflow count (+N):

Same styling as tags
Shows count of hidden tags


### Note Quick Preview
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌────┐                                                              ┌────┐ │
│  │ 📝 │   Meeting Notes - Q1 Planning                         3h     │ ✕  │ │
│  └────┘   847 words                                                  └────┘ │
│  ───────────────────────────────────────────────────────────────────────────│
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Discussed the new feature roadmap and timeline for Q1 launch.        │  │
│  │                                                                       │  │
│  │  Key Decisions:                                                       │  │
│  │  • Prioritize mobile experience                                       │  │
│  │  • Delay analytics dashboard to Q2                                    │  │
│  │  • Hire two more frontend developers                                  │  │
│  │                                                                       │  │
│  │  Action Items:                                                        │  │
│  │  ☐ Update project timeline                                            │  │
│  │  ☐ Send hiring req to HR                                              │  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  │  (fade gradient at bottom)                                            │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────┐ ┌──────────┐                                                    │
│  │ #work │ │ #standup │                                                    │
│  └───────┘ └──────────┘                                                    │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────────│
│   📁   🏷️   🗑️                                     Open full preview →     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Header subtitle: Word count
Content:

Padding: 12px 14px
Max-height: 180px
Overflow: hidden
Position: relative

Content text:

Font-size: 13px
Line-height: 1.6
Color: gray-700
White-space: pre-wrap (preserve line breaks)

Checklist rendering:

Show ☐/☑ symbols inline
Checked items: line-through, gray-400

Fade gradient:

Position: absolute
Bottom: 0
Left: 0, Right: 0
Height: 40px
Background: linear-gradient(transparent, white)

If checklist note, show progress:
┌────┐
│ ☑️ │   Shopping List                                           1h
└────┘   4/7 completed

### Note (Code) Quick Preview
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌────┐                                                              ┌────┐ │
│  │</>│   API Response Handler                                  2d     │ ✕  │ │
│  └────┘   JavaScript · 24 lines                                      └────┘ │
│  ───────────────────────────────────────────────────────────────────────────│
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│  │                                                                       │  │
│  │  const handleResponse = (data) => {                                  │  │
│  │    if (data.error) {                                                 │  │
│  │      throw new Error(data.error.message);                            │  │
│  │    }                                                                 │  │
│  │    return {                                                          │  │
│  │      success: true,                                                  │  │
│  │      payload: data.result,                                           │  │
│  │      timestamp: Date.now()                                           │  │
│  │    };                                                                │  │
│  │  };                                                                  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────┐ ┌────────────┐                                                   │
│  │ #dev │ │ #javascript│                                                   │
│  └──────┘ └────────────┘                                                   │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────────│
│   📁   🏷️   📋   🗑️                                Open full preview →     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Header subtitle: Language · Line count
Code block:

Background: gray-900
Border-radius: 6px
Padding: 12px
Font-family: monospace
Font-size: 12px
Line-height: 1.5
Color: gray-100 (light text on dark)
Max-height: 160px
Overflow: hidden
Basic syntax highlighting (keywords, strings, comments)

Extra action: 📋 Copy code button

### Image Quick Preview
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌────┐                                                              ┌────┐ │
│  │ 🖼️ │   screenshot.png                                       4h     │ ✕  │ │
│  └────┘   1920 × 1080 · 1.2 MB                                       └────┘ │
│  ───────────────────────────────────────────────────────────────────────────│
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                        IMAGE PREVIEW                                  │  │
│  │                                                                       │  │
│  │                        Height: 200px                                  │  │
│  │                        Object-fit: contain                            │  │
│  │                        Click to open full preview                     │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  AI: dashboard, chart, analytics, dark mode                                │
│  ───────────────────────────────────────────                               │
│  AI-detected tags (1 line, truncated)                                      │
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐                                           │
│  │ Screenshots │ │   Design    │                                           │
│  └─────────────┘ └─────────────┘                                           │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────────│
│   📁   🏷️   ⬇️   🗑️                                Open full preview →     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Header subtitle: Dimensions · File size
Image container:

Background: gray-100 (checkerboard for transparency)
Border-radius: 6px
Height: 200px
Display: flex
Align-items: center
Justify-content: center
Cursor: pointer (opens full preview on click)

Image:

Max-width: 100%
Max-height: 100%
Object-fit: contain

AI tags:

Font-size: 12px
Color: gray-500
Line-clamp: 1
Margin-top: 8px
Prefix: "AI: "

Extra action: ⬇️ Download button
Multi-image indicator (if applicable):
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                    1 / 5                                              │
│                    ─────                                              │
│          Position indicator overlay (bottom-right)                    │
│          Background: black/50                                         │
│          Padding: 4px 8px                                             │
│          Border-radius: 4px                                           │
│          Font-size: 11px                                              │
│          Color: white                                                 │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

### Voice Quick Preview
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌────┐                                                              ┌────┐ │
│  │ 🎤 │   Voice memo                                           5h     │ ✕  │ │
│  └────┘   1:24 · Transcribed                                         └────┘ │
│  ───────────────────────────────────────────────────────────────────────────│
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  MINI WAVEFORM + PLAYER                                               │  │
│  │  ──────────────────────                                               │  │
│  │                                                                       │  │
│  │  ┌──────┐   ▁▂▃▅▆▇█│▇▆▅▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄    0:32 / 1:24           │  │
│  │  │  ▶   │   ───────────────────────────────                           │  │
│  │  │ play │   Clickable waveform                                        │  │
│  │  └──────┘                                                             │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  "Remember to call back the client about the proposal. They           │  │
│  │  mentioned wanting to see more options for the color palette..."      │  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  Transcript preview (italic, 3 lines max)                                  │
│                                                                             │
│  ┌───────┐ ┌──────────┐                                                    │
│  │ calls │ │ clients  │                                                    │
│  └───────┘ └──────────┘                                                    │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────────│
│   📁   🏷️   ⬇️   🗑️                                Open full preview →     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Header subtitle: Duration · Transcription status
Mini player:

Background: gray-100
Border-radius: 8px
Padding: 12px
Display: flex
Align-items: center
Gap: 12px

Play button:

Size: 36px × 36px
Border-radius: full
Background: orange-500
Icon: 16px, white
Hover: bg-orange-600

Mini waveform:

Height: 32px
Flex: 1
Same bar styling as full preview (scaled down)
Clickable for seeking

Time display:

Font-size: 12px
Color: gray-500
Font-variant-numeric: tabular-nums

Transcript preview:

Margin-top: 10px
Font-size: 13px
Font-style: italic
Color: gray-600
Line-clamp: 3
Fade at bottom

If no transcript:

Show "No transcript" in gray-400 italic
Or "Transcribing..." with pulse animation

Extra action: ⬇️ Download audio

### Web Clip Quick Preview
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌────┐                                                              ┌────┐ │
│  │ 🌐 │   Web clip                                              6h     │ ✕  │ │
│  └────┘   from ux-magazine.com                                       └────┘ │
│  ───────────────────────────────────────────────────────────────────────────│
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  📄 How to Build Better UIs                                    →     │  │
│  │     ux-magazine.com                                                   │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  Source article (compact card, clickable)                                  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ ┃                                                                     │  │
│  │ ┃  "The best interfaces are almost invisible. Users                  │  │
│  │ ┃  shouldn't have to think about how to use your product             │  │
│  │ ┃  — they should just be able to accomplish their goals."            │  │
│  │ ┃                                                                     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  Clipped text (quote styling, 4 lines max)                                 │
│                                                                             │
│  ┌─────┐ ┌────────┐                                                        │
│  │ #UX │ │ design │                                                        │
│  └─────┘ └────────┘                                                        │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────────│
│   📁   🏷️   🗑️                                     Open full preview →     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
Header subtitle: "from {domain}"
Source article mini-card:

Background: gray-50
Border: 1px solid gray-200
Border-radius: 6px
Padding: 10px 12px
Display: flex
Align-items: center
Gap: 8px
Cursor: pointer
Hover: bg-gray-100

Document icon: 📄, 14px
Title: 13px, medium, gray-700, line-clamp-1
Domain: 12px, gray-400
Arrow: →, gray-300
Clipped text:

Background: blue-50
Border-left: 3px solid blue-400
Border-radius: 0 6px 6px 0
Padding: 12px 12px 12px 14px
Font-size: 13px
Font-style: italic
Color: gray-700
Line-height: 1.5
Line-clamp: 4
Margin-top: 10px

If image clip, show small thumbnail instead of text quote

---

## Interactions & Timing

### Hover Behavior
```typescript
interface QuickPreviewConfig {
  showDelay: number;      // Delay before showing (default: 500ms)
  hideDelay: number;      // Delay before hiding (default: 150ms)
  disabled: boolean;      // Disable quick preview entirely
}

function useQuickPreview(config: QuickPreviewConfig = {}) {
  const { showDelay = 500, hideDelay = 150, disabled = false } = config;

  const [isVisible, setIsVisible] = useState(false);
  const [targetItem, setTargetItem] = useState<InboxItem | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const showTimerRef = useRef<number>();
  const hideTimerRef = useRef<number>();

  const handleMouseEnter = (item: InboxItem, element: HTMLElement) => {
    if (disabled) return;

    // Clear any pending hide
    clearTimeout(hideTimerRef.current);

    // Start show timer
    showTimerRef.current = setTimeout(() => {
      setTargetItem(item);
      setTargetRect(element.getBoundingClientRect());
      setIsVisible(true);
    }, showDelay);
  };

  const handleMouseLeave = () => {
    // Clear any pending show
    clearTimeout(showTimerRef.current);

    // Start hide timer
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setTargetItem(null);
    }, hideDelay);
  };

  const handlePopupMouseEnter = () => {
    // Keep popup visible when mouse enters it
    clearTimeout(hideTimerRef.current);
  };

  const handlePopupMouseLeave = () => {
    // Start hide timer when leaving popup
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setTargetItem(null);
    }, hideDelay);
  };

  const closeImmediately = () => {
    clearTimeout(showTimerRef.current);
    clearTimeout(hideTimerRef.current);
    setIsVisible(false);
    setTargetItem(null);
  };

  return {
    isVisible,
    targetItem,
    targetRect,
    handlers: {
      onCardMouseEnter: handleMouseEnter,
      onCardMouseLeave: handleMouseLeave,
      onPopupMouseEnter: handlePopupMouseEnter,
      onPopupMouseLeave: handlePopupMouseLeave,
    },
    closeImmediately,
  };
}
```

### Animation States
```css
/* Popup entrance */
@keyframes popupEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Popup exit */
@keyframes popupExit {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
}

.quick-preview-popup {
  animation: popupEnter 150ms ease-out;
}

.quick-preview-popup.exiting {
  animation: popupExit 100ms ease-in forwards;
}
```

---

## Keyboard Support

### Keyboard Activation
```typescript
function useKeyboardQuickPreview(
  focusedIndex: number,
  items: InboxItem[],
  onShowPreview: (item: InboxItem, rect: DOMRect) => void,
  onHidePreview: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show quick preview on focused item
      if (e.key === ' ' && e.shiftKey) {
        e.preventDefault();
        const focusedElement = document.querySelector(`[data-index="${focusedIndex}"]`);
        if (focusedElement && items[focusedIndex]) {
          onShowPreview(items[focusedIndex], focusedElement.getBoundingClientRect());
        }
      }

      // Close on Escape
      if (e.key === 'Escape') {
        onHidePreview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, items]);
}
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Shift + Space` | Show quick preview for focused item |
| `Escape` | Close quick preview |
| `Enter` | Open full preview (when quick preview visible) |
| `Tab` | Move focus to popup actions |
| `m` | Move item (when popup focused) |
| `t` | Tag item (when popup focused) |

---

## Props Interface
```typescript
interface QuickPreviewPopupProps {
  // Data
  item: InboxItem;

  // Position
  triggerRect: DOMRect;
  preferredPosition?: "top" | "bottom" | "left" | "right";

  // State
  isVisible: boolean;

  // Voice playback (if voice memo)
  isPlaying?: boolean;
  currentTime?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;

  // Actions
  onClose: () => void;
  onOpenFullPreview: () => void;
  onMove: (id: string) => void;
  onTag: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload?: (id: string) => void;  // For images, voice
  onCopyCode?: (id: string) => void;  // For code notes
  onOpenSource?: (url: string) => void;  // For URLs, web clips

  // Mouse handlers (for keeping popup open)
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}
```

---

## User Preferences

### Settings for Quick Preview
```typescript
interface QuickPreviewSettings {
  enabled: boolean;           // Master toggle
  showDelay: number;          // 250-1000ms, default 500ms
  showOnTouch: boolean;       // Long-press on mobile
  showForTypes: {             // Per-type toggles
    url: boolean;
    note: boolean;
    image: boolean;
    voice: boolean;
    webclip: boolean;
  };
}
```

Users can disable quick preview entirely or adjust delay in settings.

---

## Accessibility

### ARIA Attributes
```html
<div
  role="tooltip"
  aria-hidden={!isVisible}
  aria-label="Quick preview for {item.title}"
  class="quick-preview-popup"
>
  <header>
    <h3 id="popup-title">{item.title}</h3>
    <button aria-label="Close preview">×</button>
  </header>

  <div aria-describedby="popup-title">
    {/* Content */}
  </div>

  <footer>
    <button aria-label="Move to folder">📁</button>
    <button aria-label="Add tag">🏷️</button>
    <button aria-label="Delete item">🗑️</button>
    <button aria-label="Open full preview">Open full preview</button>
  </footer>
</div>
```

### Focus Management

- When popup appears via keyboard, focus moves to first action button
- Tab cycles through popup actions
- Escape returns focus to trigger element
- When popup closes, focus returns to original trigger

---

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| < 768px | Quick preview disabled by default (use tap to open full preview instead) |
| 768px+ | Full quick preview functionality |

On mobile/touch devices:
- Long-press (500ms) can trigger quick preview if enabled
- Tap anywhere outside closes popup
- Full preview remains the primary interaction

---

## Verification Checklist

After building, verify:
☐ Popup appears after hover delay (500ms default)
☐ Popup disappears when mouse leaves card and popup
☐ Popup stays visible when mouse moves from card to popup
☐ Popup positions correctly (below, above, or side based on space)
☐ Arrow pointer shows and points to trigger
☐ All item types render with correct content
☐ URL preview shows image, description, tags
☐ Note preview shows content with proper formatting
☐ Code preview shows syntax-highlighted code
☐ Image preview shows image with dimensions
☐ Voice preview shows mini player that works
☐ Web clip preview shows source card and quote
☐ Quick action buttons work (Move, Tag, Delete, Download)
☐ "Open full preview" link works
☐ Close button works
☐ Escape key closes popup
☐ Shift+Space opens popup for focused item (keyboard)
☐ Focus management works correctly
☐ Animations are smooth (enter/exit)
☐ Multiple quick previews don't appear simultaneously
☐ Popup respects viewport boundaries

## Output

Create a React component called QuickPreviewPopup that accepts the props defined above, plus a custom hook useQuickPreview for managing the hover state and timing. Use Tailwind CSS for styling.

The component should:
1. Position intelligently based on available viewport space
2. Show arrow pointer indicating the trigger element
3. Render different content based on item type
4. Include working quick action buttons
5. Support both mouse and keyboard activation
6. Animate smoothly on enter/exit

Include sub-components for each item type's preview content (UrlQuickPreview, NoteQuickPreview, ImageQuickPreview, VoiceQuickPreview, WebClipQuickPreview).

Implementation Notes
Key Techniques Used:
TechniqueWhyShow/hide delaysPrevents flicker, gives user time to move to popupViewport-aware positioningPopup always stays visible, never clips edgeArrow pointerClear visual connection between trigger and popupType-specific contentEach item type shows most relevant preview infoFocus preservationKeyboard users maintain context
Design Choices:

500ms show delay — Long enough to avoid accidental triggers, short enough to feel responsive. Configurable for power users.
150ms hide delay — Gives users time to move mouse from card to popup without closing it.
Condensed content — Quick preview is for scanning, not reading. Show just enough to decide if you want to open full preview.
Same actions as hover state — Consistent with card hover actions, no learning curve.
"Open full preview" prominent — Clear path to more detail when quick preview isn't enough.
Disabled on mobile by default — Touch interactions are fundamentally different. Long-press is awkward; tap-to-open is cleaner.


Expected Output Structure
jsx// QuickPreviewPopup.tsx
<div
  ref={popupRef}
  className={`quick-preview-popup ${position} ${isExiting ? 'exiting' : ''}`}
  style={{
    position: 'fixed',
    top: calculatedTop,
    left: calculatedLeft,
  }}
  onMouseEnter={onMouseEnter}
  onMouseLeave={onMouseLeave}
  role="tooltip"
>
  {/* Arrow */}
  <div className={`popup-arrow popup-arrow-${arrowPosition}`} style={{ left: arrowOffset }} />

  {/* Header */}
  <header className="popup-header">
    <div className="type-icon">{getTypeIcon(item.type)}</div>
    <div className="title-area">
      <h3 className="title">{item.title}</h3>
      <p className="subtitle">{getSubtitle(item)}</p>
    </div>
    <span className="time">{formatRelativeTime(item.createdAt)}</span>
    <button className="close-btn" onClick={onClose}><XIcon /></button>
  </header>

  {/* Content (type-specific) */}
  <div className="popup-content">
    {item.type === 'url' && <UrlQuickPreview item={item} />}
    {item.type === 'note' && <NoteQuickPreview item={item} />}
    {item.type === 'image' && <ImageQuickPreview item={item} />}
    {item.type === 'voice' && (
      <VoiceQuickPreview
        item={item}
        isPlaying={isPlaying}
        currentTime={currentTime}
        onPlay={onPlay}
        onPause={onPause}
        onSeek={onSeek}
      />
    )}
    {item.type === 'webclip' && <WebClipQuickPreview item={item} onOpenSource={onOpenSource} />}
  </div>

  {/* Footer */}
  <footer className="popup-footer">
    <div className="quick-actions">
      <button onClick={() => onMove(item.id)}><FolderIcon /></button>
      <button onClick={() => onTag(item.id)}><TagIcon /></button>
      {(item.type === 'image' || item.type === 'voice') && (
        <button onClick={() => onDownload?.(item.id)}><DownloadIcon /></button>
      )}
      {item.type === 'note' && item.contentType === 'code' && (
        <button onClick={() => onCopyCode?.(item.id)}><ClipboardIcon /></button>
      )}
      <button className="delete-btn" onClick={() => onDelete(item.id)}><TrashIcon /></button>
    </div>
    <button className="open-full-btn" onClick={onOpenFullPreview}>
      Open full preview <ArrowRightIcon />
    </button>
  </footer>
</div>

// useQuickPreview.ts
export function useQuickPreview(config?: QuickPreviewConfig) {
  // ... implementation as specified
  return {
    isVisible,
    targetItem,
    targetRect,
    handlers,
    closeImmediately,
  };
}

Usage Guidelines
