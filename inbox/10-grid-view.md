Prompt #10: Grid View (Masonry)
The Prompt
You are building the Grid View (Masonry) component for Memry's inbox. This component assembles all card types (URL, Note, Image, Voice, Web Clip) into a masonry-style grid layout with date-based groupings. This is the default view for new users.

## What You Are Building

A responsive masonry grid that displays inbox items organized by date groups (Today, Yesterday, This Week, etc.). Cards have variable heights based on their content type, and the masonry layout fills gaps efficiently while maintaining chronological order within each group.

## Grid View Placement

This component renders inside Zone 3 (Content Area) of the page layout:

┌─────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (Zone 1)                                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│  CONTEXT BAR (Zone 2)                                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CONTENT AREA (Zone 3) — GRID VIEW RENDERS HERE                                 │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                           │  │
│  │   TODAY                                                                   │  │
│  │   ─────                                                                   │  │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                       │  │
│  │   │   Card 1    │  │   Card 2    │  │   Card 3    │                       │  │
│  │   │             │  │             │  └─────────────┘                       │  │
│  │   │             │  └─────────────┘                                        │  │
│  │   └─────────────┘                   ┌─────────────┐                       │  │
│  │                   ┌─────────────┐   │   Card 5    │                       │  │
│  │   ┌─────────────┐ │   Card 4    │   │             │                       │  │
│  │   │   Card 6    │ │             │   │             │                       │  │
│  │   └─────────────┘ └─────────────┘   └─────────────┘                       │  │
│  │                                                                           │  │
│  │   YESTERDAY                                                               │  │
│  │   ─────────                                                               │  │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                       │  │
│  │   │   ...       │  │   ...       │  │   ...       │                       │  │
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
│  Grid View Container                                                            │
│  ───────────────────                                                            │
│  - Padding: 24px                                                                │
│  - Max-width: 1400px                                                            │
│  - Margin: 0 auto (centered)                                                    │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                           │  │
│  │  DATE GROUP: TODAY                                                        │  │
│  │  ─────────────────                                                        │  │
│  │                                                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                     │  │  │
│  │  │  MASONRY GRID                                                       │  │  │
│  │  │  (Cards arranged in columns)                                        │  │  │
│  │  │                                                                     │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                           │  │
│  │  DATE GROUP: YESTERDAY                                                    │  │
│  │  ─────────────────────                                                    │  │
│  │                                                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                     │  │  │
│  │  │  MASONRY GRID                                                       │  │  │
│  │  │                                                                     │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ... more date groups ...                                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

---

## Date Group Component

### Date Group Header

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  TODAY                                                           6 items  ▾     │
│  ═════                                                           ──────  ───    │
│  Group title                                                     Count   Toggle │
│                                                                                 │
│  Font-size: 13px                                                                │
│  Font-weight: 600                                                               │
│  Color: gray-500                                                                │
│  Text-transform: uppercase                                                      │
│  Letter-spacing: 0.05em                                                         │
│                                                                                 │
│  Underline: 2px solid gray-200                                                  │
│  Padding-bottom: 8px                                                            │
│  Margin-bottom: 16px                                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

**Header Layout:**
- Display: flex
- Justify-content: space-between
- Align-items: center
- Padding-bottom: 8px
- Border-bottom: 2px solid gray-200
- Margin-bottom: 16px

**Title (Left):**
- Font-size: 13px
- Font-weight: 600 (semibold)
- Color: gray-500
- Text-transform: uppercase
- Letter-spacing: 0.05em (wider tracking)

**Count + Toggle (Right):**
- Display: flex
- Align-items: center
- Gap: 8px

**Item Count:**
- Font-size: 13px
- Font-weight: 400
- Color: gray-400
- Format: "{n} items" or "{n} item" (singular)

**Collapse Toggle:**
- Icon: Chevron down (▾), 16px
- Color: gray-400
- Cursor: pointer
- Rotation: 0° (expanded), -90° (collapsed)
- Transition: transform 200ms ease

### Date Group Content (Collapsed)

When collapsed, hide the masonry grid:
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  YESTERDAY                                                       8 items  ▸     │
│  ═════════                                                                      │
│                                                                                 │
│  (Content hidden - just header visible)                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

**Collapsed State:**
- Chevron rotates to point right (▸)
- Grid content: display: none or height: 0 with overflow: hidden
- Margin-bottom: 8px (reduced from 16px)

### Date Group Spacing

| Element | Spacing |
|---------|---------|
| Between header and grid | 16px (margin-bottom on header) |
| Between groups | 32px (margin-bottom on group container) |
| Last group | No bottom margin |

---

## Date Grouping Logic
```typescript
type DateGroup =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "older";

interface GroupedItems {
  group: DateGroup;
  label: string;
  items: InboxItem[];
}

function groupItemsByDate(items: InboxItem[]): GroupedItems[] {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = subDays(today, 1);
  const thisWeekStart = startOfWeek(today);
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  const thisMonthStart = startOfMonth(today);
  const lastMonthStart = subMonths(thisMonthStart, 1);

  const groups: Map<DateGroup, InboxItem[]> = new Map([
    ["today", []],
    ["yesterday", []],
    ["thisWeek", []],
    ["lastWeek", []],
    ["thisMonth", []],
    ["lastMonth", []],
    ["older", []],
  ]);

  for (const item of items) {
    const itemDate = new Date(item.createdAt);

    if (itemDate >= today) {
      groups.get("today")!.push(item);
    } else if (itemDate >= yesterday) {
      groups.get("yesterday")!.push(item);
    } else if (itemDate >= thisWeekStart) {
      groups.get("thisWeek")!.push(item);
    } else if (itemDate >= lastWeekStart) {
      groups.get("lastWeek")!.push(item);
    } else if (itemDate >= thisMonthStart) {
      groups.get("thisMonth")!.push(item);
    } else if (itemDate >= lastMonthStart) {
      groups.get("lastMonth")!.push(item);
    } else {
      groups.get("older")!.push(item);
    }
  }

  // Return only non-empty groups
  const result: GroupedItems[] = [];

  const labels: Record<DateGroup, string> = {
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    lastWeek: "Last Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    older: "Older",
  };

  for (const [group, groupItems] of groups) {
    if (groupItems.length > 0) {
      // Sort items within group by createdAt (newest first)
      groupItems.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      result.push({
        group,
        label: labels[group],
        items: groupItems,
      });
    }
  }

  return result;
}
```

---

## Masonry Grid Layout

### Column Configuration

| Viewport Width | Columns | Column Gap | Row Gap |
|----------------|---------|------------|---------|
| < 640px | 1 | 16px | 16px |
| 640px - 1024px | 2 | 16px | 16px |
| 1024px - 1440px | 3 | 16px | 16px |
| > 1440px | 4 | 20px | 20px |

### Masonry Behavior
3-Column Masonry Example:
Column 1          Column 2          Column 3
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│             │   │             │   │             │
│   Card A    │   │   Card B    │   │   Card C    │
│   (tall)    │   │   (short)   │   │   (medium)  │
│             │   │             │   │             │
│             │   └─────────────┘   │             │
│             │                     └─────────────┘
│             │   ┌─────────────┐
└─────────────┘   │   Card D    │   ┌─────────────┐
│   (medium)  │   │   Card E    │
┌─────────────┐   │             │   │   (tall)    │
│   Card F    │   └─────────────┘   │             │
│   (short)   │                     │             │
└─────────────┘   ┌─────────────┐   │             │
│   Card G    │   │             │
┌─────────────┐   │   (short)   │   └─────────────┘
│   Card H    │   └─────────────┘
│   (medium)  │                     ┌─────────────┐
│             │                     │   Card I    │
└─────────────┘                     └─────────────┘
Cards fill shortest column first, maintaining visual balance.

### CSS Masonry Implementation Options

**Option A: CSS Columns (Recommended for simplicity)**
```css
.masonry-grid {
  column-count: 3;
  column-gap: 16px;
}

.masonry-grid > * {
  break-inside: avoid;
  margin-bottom: 16px;
}
```

**Option B: CSS Grid with Masonry (Future)**
```css
/* When browser support improves */
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: masonry;
  gap: 16px;
}
```

**Option C: JavaScript Masonry Library**
```typescript
// Use a library like react-masonry-css or masonic
// for more control and better performance with many items
```

**Recommendation:** Use CSS Columns for initial implementation. It works well, has good browser support, and requires no JavaScript. Consider a JS library if performance issues arise with hundreds of items.

### Card Width in Grid

All cards fill their column width:
- Card width: 100% of column
- Card min-width: (none, fills column)
- Card max-width: (none, fills column)

The grid columns control width; cards just fill their container.

---

## Card Rendering

### Item Type Detection
```typescript
type InboxItem =
  | UrlCardData
  | NoteCardData
  | ImageCardData
  | VoiceCardData
  | WebClipCardData;

function renderCard(item: InboxItem, props: CardCommonProps) {
  switch (item.type) {
    case "url":
      return <UrlCard data={item} variant="grid" {...props} />;
    case "note":
      return <NoteCard data={item} variant="grid" {...props} />;
    case "image":
      return <ImageCard data={item} variant="grid" {...props} />;
    case "voice":
      return <VoiceCard data={item} variant="grid" {...props} />;
    case "webclip":
      return <WebClipCard data={item} variant="grid" {...props} />;
    default:
      return null;
  }
}
```

### Common Card Props
```typescript
interface CardCommonProps {
  // Selection
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;

  // Actions
  onClick: (id: string) => void;
  onMove: (id: string) => void;
  onTag: (id: string) => void;
  onDelete: (id: string) => void;
}
```

---

## Selection Management

### Multi-Select Behavior

**Enabling Selection:**
- Click checkbox on any card
- Shift+Click to select range
- Cmd/Ctrl+Click to toggle individual selection
- Cmd/Ctrl+A to select all visible items

**Selection State Visual:**
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  TODAY                                                           6 items  ▾     │
│                                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                           │
│  │ ☑           │   │             │   │ ☑           │                           │
│  │ ┌─────────┐ │   │   Card 2    │   │ ┌─────────┐ │                           │
│  │ │ Card 1  │ │   │             │   │ │ Card 3  │ │                           │
│  │ │         │ │   │             │   │ │         │ │                           │
│  │ │SELECTED │ │   │             │   │ │SELECTED │ │                           │
│  │ └─────────┘ │   │             │   │ └─────────┘ │                           │
│  │             │   │             │   │             │                           │
│  │ Blue bg     │   │             │   │ Blue bg     │                           │
│  │ Blue border │   │             │   │ Blue border │                           │
│  └─────────────┘   └─────────────┘   └─────────────┘                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
Selected cards:

Background: blue-50
Border: 2px solid blue-200
Checkbox: Visible and checked


### Selection Props for Grid View
```typescript
interface GridViewProps {
  // Data
  items: InboxItem[];
  isLoading: boolean;

  // Selection
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;

  // Group collapse state
  collapsedGroups: Set<DateGroup>;
  onToggleGroup: (group: DateGroup) => void;

  // Card actions
  onCardClick: (id: string) => void;
  onCardMove: (id: string) => void;
  onCardTag: (id: string) => void;
  onCardDelete: (id: string) => void;

  // Voice playback (passed to VoiceCards)
  playingVoiceId: string | null;
  voiceCurrentTime: number;
  onVoicePlay: (id: string) => void;
  onVoicePause: (id: string) => void;
  onVoiceSeek: (id: string, time: number) => void;
}
```

---

## Loading States

### Initial Loading (Skeleton Grid)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ░░░░░░░░                                                                       │
│  ═════════                                                                      │
│                                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                           │
│  │ ░░░░░░░░░░░ │   │ ░░░░░░░░░░░ │   │ ░░░░░░░░░░░ │                           │
│  │ ░░░░░░░░░░░ │   │ ░░░░░░░░░░░ │   │ ░░░░░░░░░░░ │                           │
│  │ ░░░░░░░░░░░ │   │ ░░░░░░░░░░░ │   │ ░░░░░░░░░░░ │                           │
│  │ ░░░░░░░░░░░ │   │             │   │ ░░░░░░░░░░░ │                           │
│  │ ░░░░░░░░░░░ │   │ ░░░░░░░░░░░ │   │             │                           │
│  │             │   │ ░░░░░░░░░░░ │   │ ░░░░░░░░░░░ │                           │
│  │ ░░░░░░░░░░░ │   │             │   │ ░░░░░░░░░░░ │                           │
│  └─────────────┘   └─────────────┘   └─────────────┘                           │
│                                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                           │
│  │ ░░░░░░░░░░░ │   │ ░░░░░░░░░░░ │   │ ░░░░░░░░░░░ │                           │
│  │ ░░░░░░░░░░░ │   │ ░░░░░░░░░░░ │   │ ░░░░░░░░░░░ │                           │
│  │             │   │ ░░░░░░░░░░░ │   │             │                           │
│  └─────────────┘   │             │   └─────────────┘                           │
│                    └─────────────┘                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

**Skeleton Implementation:**
- Show 6-9 skeleton cards
- Vary heights randomly (but consistently) to simulate real content
- Use CSS animation: pulse
- Show one skeleton group header
```typescript
function GridSkeleton({ columnCount = 3 }: { columnCount?: number }) {
  // Generate skeleton cards with varied heights
  const skeletonHeights = [200, 280, 180, 320, 240, 200, 260, 180, 300];

  return (
    <div className="grid-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title" />
      </div>
      <div className="skeleton-grid">
        {skeletonHeights.map((height, i) => (
          <div
            key={i}
            className="skeleton-card animate-pulse"
            style={{ height }}
          />
        ))}
      </div>
    </div>
  );
}
```

### Loading More (Infinite Scroll)

When loading more items at the bottom:
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ... existing cards ...                                                         │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                         │    │
│  │                    ◌  Loading more items...                             │    │
│  │                    ───────────────────────                              │    │
│  │                    Spinner + text                                       │    │
│  │                                                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

**Loading More Indicator:**
- Centered horizontally
- Padding: 32px 0
- Spinner: 20px, gray-400, spinning animation
- Text: "Loading more items...", 14px, gray-500
- Gap between spinner and text: 8px

---

## Empty State

When inbox has no items:
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                                                                                 │
│                                                                                 │
│                              ┌─────────────────┐                                │
│                              │                 │                                │
│                              │   📥            │                                │
│                              │   Inbox icon    │                                │
│                              │   48px          │                                │
│                              │                 │                                │
│                              └─────────────────┘                                │
│                                                                                 │
│                        Your inbox is ready for action                           │
│                        ─────────────────────────────                            │
│                        24px, semibold, gray-900                                 │
│                                                                                 │
│                  Capture anything — notes, links, images,                       │
│                  voice memos. We'll keep them safe until                        │
│                  you're ready to organize.                                      │
│                  ──────────────────────────────────────                         │
│                  16px, gray-500, max-width: 400px, centered                     │
│                                                                                 │
│                                                                                 │
│                 ┌───────────────────────────────────────┐                       │
│                 │                                       │                       │
│                 │   Try these ways to capture:          │                       │
│                 │                                       │                       │
│                 │   📝  Type a quick note below         │                       │
│                 │   🔗  Paste any URL                   │                       │
│                 │   🎤  Record a voice memo             │                       │
│                 │   📎  Drag and drop files             │                       │
│                 │   🌐  Use browser extension           │                       │
│                 │                                       │                       │
│                 └───────────────────────────────────────┘                       │
│                                                                                 │
│                                                                                 │
│                      [ Install Browser Extension ]                              │
│                      ─────────────────────────────                              │
│                      Primary button                                             │
│                                                                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

**Empty State Structure:**
- Container: flex, flex-col, items-center, justify-center
- Min-height: 400px
- Text-align: center
- Max-width: 480px
- Margin: 0 auto

**Icon:**
- Inbox icon, 48px × 48px
- Color: gray-300
- Background: gray-100
- Padding: 16px
- Border-radius: full
- Margin-bottom: 24px

**Title:**
- Font-size: 24px
- Font-weight: 600
- Color: gray-900
- Margin-bottom: 8px

**Description:**
- Font-size: 16px
- Color: gray-500
- Max-width: 400px
- Line-height: 1.5
- Margin-bottom: 32px

**Tips Card:**
- Background: gray-50
- Border: 1px solid gray-200
- Border-radius: 12px
- Padding: 20px 24px
- Text-align: left
- Margin-bottom: 24px

**Tip Items:**
- Display: flex, items-center, gap: 12px
- Icon: 20px, color varies by type
- Text: 14px, gray-700
- Spacing: 12px between items

**CTA Button:**
- Primary button style
- Background: gray-900
- Color: white
- Padding: 12px 24px
- Border-radius: 8px
- Font-weight: 500

---

## Filtered Empty State

When filters are active but no items match:
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                                                                                 │
│                              ┌─────────────────┐                                │
│                              │                 │                                │
│                              │   🔍            │                                │
│                              │   Search icon   │                                │
│                              │                 │                                │
│                              └─────────────────┘                                │
│                                                                                 │
│                           No items match your filters                           │
│                                                                                 │
│                   Try adjusting your filters or search terms                    │
│                                                                                 │
│                                                                                 │
│                            [ Clear all filters ]                                │
│                                                                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

**Filtered Empty:**
- Icon: Search or filter icon
- Title: "No items match your filters"
- Subtitle: "Try adjusting your filters or search terms"
- Button: "Clear all filters" (ghost style)

---

## Scroll Behavior

### Scroll Container

The Grid View scrolls within Zone 3:
```typescript
// Scroll container is Zone 3 (Content Area)
// Grid View fills this container

// Optional: Infinite scroll implementation
function useInfiniteScroll(
  containerRef: RefObject<HTMLElement>,
  onLoadMore: () => void,
  hasMore: boolean
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 200;

      if (scrolledToBottom && hasMore) {
        onLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, onLoadMore]);
}
```

### Scroll Position Preservation

When returning from preview panel:
```typescript
// Save scroll position before opening preview
const scrollPosition = containerRef.current?.scrollTop;

// Restore after closing preview
containerRef.current?.scrollTo(0, scrollPosition);
```

---

## Keyboard Navigation

### Focus Management
```typescript
// Grid items should be focusable
// Arrow keys navigate between cards
// Enter opens card
// Space toggles selection

function useGridKeyboardNav(items: InboxItem[], selectedIds: Set<string>) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        setFocusedIndex(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowLeft':
        setFocusedIndex(i => Math.max(i - 1, 0));
        break;
      case 'ArrowDown':
        // Move to next row (approximate based on column count)
        setFocusedIndex(i => Math.min(i + columnCount, items.length - 1));
        break;
      case 'ArrowUp':
        setFocusedIndex(i => Math.max(i - columnCount, 0));
        break;
      case 'Enter':
        if (focusedIndex >= 0) {
          onCardClick(items[focusedIndex].id);
        }
        break;
      case ' ':
        if (focusedIndex >= 0) {
          toggleSelection(items[focusedIndex].id);
        }
        e.preventDefault();
        break;
    }
  };

  return { focusedIndex, handleKeyDown };
}
```

### Focus Indicator

When card is focused via keyboard:
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │         Card Content            │    │
│  │                                 │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Ring: 2px solid blue-500               │
│  Ring-offset: 2px                       │
│                                         │
└─────────────────────────────────────────┘

---

## Animation & Transitions

### Card Appearance (on load/filter)
```css
.card-enter {
  opacity: 0;
  transform: translateY(10px);
}

.card-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 200ms ease, transform 200ms ease;
}
```

### Group Collapse/Expand
```css
.group-content {
  overflow: hidden;
  transition: max-height 300ms ease;
}

.group-content.collapsed {
  max-height: 0;
}

.group-content.expanded {
  max-height: none; /* Or calculated value */
}
```

### Card Removal (delete/archive)
```css
.card-exit {
  opacity: 1;
  transform: scale(1);
}

.card-exit-active {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 150ms ease, transform 150ms ease;
}
```

---

## Responsive Behavior Summary

| Breakpoint | Columns | Container Padding | Gap |
|------------|---------|-------------------|-----|
| < 640px | 1 | 16px | 16px |
| 640px - 1024px | 2 | 20px | 16px |
| 1024px - 1440px | 3 | 24px | 16px |
| > 1440px | 4 | 24px | 20px |

---

## Component Structure
```typescript
interface GridViewProps {
  items: InboxItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;

  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;

  collapsedGroups: Set<DateGroup>;
  onToggleGroup: (group: DateGroup) => void;

  searchQuery: string;
  activeFilters: FilterState;

  onCardClick: (id: string) => void;
  onCardMove: (id: string) => void;
  onCardTag: (id: string) => void;
  onCardDelete: (id: string) => void;

  // Voice playback state
  playingVoiceId: string | null;
  voiceCurrentTime: number;
  onVoicePlay: (id: string) => void;
  onVoicePause: (id: string) => void;
  onVoiceSeek: (id: string, time: number) => void;
}
```

---

## Verification Checklist

After building, verify:
☐ Masonry layout displays cards in columns
☐ Card heights vary correctly (no forced equal heights)
☐ Columns adjust on viewport resize (1/2/3/4 columns)
☐ Date groups display in correct order (Today first)
☐ Date grouping logic correctly categorizes items
☐ Empty groups are not shown
☐ Group headers show correct item count
☐ Group collapse/expand works
☐ Collapsed groups show chevron rotated
☐ All card types render correctly (URL, Note, Image, Voice, Web Clip)
☐ Card selection works (checkbox click)
☐ Multi-select works (Shift+click, Cmd+click)
☐ Selected cards show blue styling
☐ Loading skeleton displays on initial load
☐ "Loading more" indicator shows during infinite scroll
☐ Empty state displays when no items
☐ Filtered empty state displays when filters return no results
☐ Scroll position preserves when returning from preview
☐ Keyboard navigation works (arrows, Enter, Space)
☐ Focus indicator visible on keyboard navigation
☐ Card animations work (appear, remove)
☐ Responsive layout works at all breakpoints

## Output

Create a React component called GridView that accepts the props defined above. Use Tailwind CSS for styling. Use CSS Columns for masonry layout (or a masonry library if preferred). The component should render the date-grouped masonry grid with all card types, handle selection, support infinite scroll, and display appropriate loading/empty states.

Import and use the card components (UrlCard, NoteCard, ImageCard, VoiceCard, WebClipCard) created in previous prompts.

Implementation Notes
Key Techniques Used:
TechniqueWhyCSS Columns for masonrySimple, performant, no JS requiredDate grouping functionExplicit logic prevents edge casesCollapsible groupsUsers can hide old content to focus on recentSkeleton with varied heightsMimics real content, feels authenticInfinite scroll hookLoad more content seamlessly
Design Choices:

CSS Columns over JS masonry — Simpler implementation, good browser support, adequate for most use cases. Can upgrade to JS library later if needed.
Date groups collapsible — Inbox can grow large. Collapsing old groups keeps focus on recent items while preserving access to everything.
Group headers uppercase + subtle — Headers shouldn't compete with card content. Small, uppercase, muted styling provides structure without distraction.
Empty state with tips — First-time users need guidance. Tips show multiple capture paths, encouraging exploration.
Selection via Set<string> — Efficient lookups, easy to add/remove/check membership. Passed from parent for centralized state management.


Expected Output Structure
jsx<div className="grid-view">
  {isLoading ? (
    <GridSkeleton columnCount={columnCount} />
  ) : items.length === 0 ? (
    activeFilters.hasAny ? (
      <FilteredEmptyState onClearFilters={onClearFilters} />
    ) : (
      <EmptyState />
    )
  ) : (
    <>
      {groupedItems.map(({ group, label, items }) => (
        <div key={group} className="date-group">
          <div className="group-header">
            <h2 className="group-title">{label}</h2>
            <div className="group-meta">
              <span className="item-count">{items.length} items</span>
              <button
                className="collapse-toggle"
                onClick={() => onToggleGroup(group)}
                aria-expanded={!collapsedGroups.has(group)}
              >
                <ChevronIcon
                  className={collapsedGroups.has(group) ? 'rotate-[-90deg]' : ''}
                />
              </button>
            </div>
          </div>

          {!collapsedGroups.has(group) && (
            <div className="masonry-grid">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="card-wrapper"
                  tabIndex={0}
                  onFocus={() => setFocusedIndex(index)}
                >
                  {renderCard(item, {
                    isSelected: selectedIds.has(item.id),
                    onSelect: handleSelect,
                    onClick: onCardClick,
                    onMove: onCardMove,
                    onTag: onCardTag,
                    onDelete: onCardDelete,
                    // Voice-specific props
                    ...(item.type === 'voice' && {
                      isPlaying: playingVoiceId === item.id,
                      currentTime: voiceCurrentTime,
                      onPlay: onVoicePlay,
                      onPause: onVoicePause,
                      onSeek: onVoiceSeek,
                    }),
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {isLoadingMore && (
        <div className="loading-more">
          <Spinner />
          <span>Loading more items...</span>
        </div>
      )}
    </>
  )}
</div>

Usage Guidelines

Test column counts — Resize viewport to verify 1/2/3/4 column transitions
Test date grouping — Add items with various dates to verify correct grouping
Test collapse/expand — Toggle groups and verify content hides/shows with animation
Test all card types — Add URL, Note, Image, Voice, Web Clip items to verify all render
Test selection — Click checkboxes, Shift+click ranges, verify selection state
Test empty states — Clear all items, then apply filters to no-match state
Test infinite scroll — Add many items and scroll to trigger load more
Test keyboard nav — Tab to grid, use arrows, Enter, Space to navigate