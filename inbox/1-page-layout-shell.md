 Page Layout Shell
 You are building the main page layout for a PKM (Personal Knowledge Management) app called Memry. This prompt creates the foundational page shell with 4 distinct zones.

## What You Are Building

A desktop-first inbox page layout with fixed header, fixed bottom capture bar, and scrollable content area in between. The layout uses a vertical stack structure.

## Page Structure (Top to Bottom)

┌─────────────────────────────────────────────────────────────────┐
│  ZONE 1: HEADER BAR                                             │
│  Height: 56px | Fixed at top | Full width                       │
│  Background: white | Border-bottom: 1px solid gray-200          │
├─────────────────────────────────────────────────────────────────┤
│  ZONE 2: CONTEXT BAR                                            │
│  Height: 48px | Sticky below header | Full width                │
│  Background: gray-50 | Border-bottom: 1px solid gray-200        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ZONE 3: CONTENT AREA                                           │
│  Height: Flexible (fills remaining space)                       │
│  Scrollable: Yes (vertical only)                                │
│  Padding: 24px                                                  │
│  Background: gray-50                                            │
│                                                                 │
│  [This area will contain the inbox items grid/list]             │
│                                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ZONE 4: QUICK CAPTURE BAR                                      │
│  Height: 64px | Fixed at bottom | Full width                    │
│  Background: white | Border-top: 1px solid gray-200             │
│  Box-shadow: 0 -2px 8px rgba(0,0,0,0.06)                        │
└─────────────────────────────────────────────────────────────────┘

## Zone Details

### Zone 1: Header Bar (56px)
- Position: Fixed at viewport top
- Z-index: 50 (stays above content)
- Horizontal padding: 16px
- Display: Flex row, items centered, space-between
- Contains 4 placeholder areas (left to right):
  1. Left section (menu button area) - width: 120px
  2. Center section (search area) - flex-grow: 1, max-width: 600px, centered
  3. Right section (filter + view toggle area) - width: 200px, flex-end

### Zone 2: Context Bar (48px)
- Position: Sticky, sticks below header when scrolling
- Top offset: 56px (header height)
- Z-index: 40
- Horizontal padding: 24px
- Display: Flex row, items centered, space-between
- Contains 2 placeholder areas:
  1. Left section (title + count) - flex-grow: 1
  2. Right section (process button) - width: auto

### Zone 3: Content Area (Flexible)
- Position: Relative (scrolls normally)
- Top margin: 104px (header 56px + context 48px)
- Bottom margin: 64px (capture bar height)
- Min-height: calc(100vh - 168px)
- Overflow-y: auto
- Padding: 24px
- Inner max-width: 1400px (centered for ultra-wide screens)

### Zone 4: Quick Capture Bar (64px)
- Position: Fixed at viewport bottom
- Z-index: 50
- Horizontal padding: 24px
- Display: Flex row, items centered, centered content
- Inner container: max-width: 800px, full-width on smaller screens

## Placeholder Content

For now, add these placeholder elements:

- Header Bar: Add text "Header Bar" centered
- Context Bar: Add text "Context Bar" centered
- Content Area: Add a tall div (height: 1500px) with text "Content Area - Scroll to test" to verify scrolling works correctly
- Quick Capture Bar: Add text "Quick Capture Bar" centered

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| < 768px | Reduce horizontal padding to 16px in all zones |
| 768px - 1024px | Standard padding (as specified) |
| > 1024px | Content area centers with max-width |

## Technical Requirements

1. Use CSS Grid or Flexbox for the main layout
2. Ensure the page never shows horizontal scrollbar
3. Content area scrolls independently (not the whole page)
4. All fixed elements stay in place during scroll
5. Smooth scroll behavior for content area
6. Use CSS variables for spacing values for consistency:
   - --header-height: 56px
   - --context-height: 48px
   - --capture-height: 64px
   - --page-padding: 24px

## Verification Checklist

After building, verify:
☐ Header stays fixed at top when scrolling content
☐ Context bar is sticky and stops below header
☐ Content area scrolls while header/context/capture stay fixed
☐ Quick capture bar stays fixed at bottom
☐ No content is hidden behind fixed elements
☐ Layout works at 1024px, 1440px, and 1920px widths
☐ Tall content (1500px placeholder) scrolls properly

## Output

Create a single React component called InboxPageLayout that renders this structure. Use Tailwind CSS for styling. Include comments marking each zone clearly.



Implementation Notes
Key Techniques Used:
TechniqueWhyASCII diagramVisual clarity for spatial layout - AI understands exact positioningExplicit measurementsRemoves ambiguity (56px not "medium height")Zone numberingCreates clear reference system for future promptsVerification checklistEnsures AI self-validates the outputCSS variablesEstablishes design tokens for consistency across future prompts
Design Choices:

Fixed header + sticky context — Header always visible, context bar scrolls away but sticks when reaching top. This preserves navigation while maximizing content space.
Bottom capture bar — Fixed at bottom keeps quick capture always accessible, following the pattern of chat apps and modern PKM tools (Notion, Linear).
Tall placeholder for testing — The 1500px content forces scroll testing, ensuring the layout actually works before adding real content.
Max-width constraints — Prevents ultra-wide readability issues while keeping full-width backgrounds.


Expected Output
A React component with this structure:
<div className="inbox-page">
  <!-- Zone 1: Header (fixed) -->
  <header>...</header>

  <!-- Zone 2: Context (sticky) -->
  <div className="context-bar">...</div>

  <!-- Zone 3: Content (scrollable) -->
  <main>...</main>

  <!-- Zone 4: Capture (fixed) -->
  <footer>...</footer>
</div>