Prompt #2: Header Bar
Prompt #2: Header Bar
The Prompt
You are building the Header Bar component for Memry's inbox page. This component lives inside Zone 1 of the page layout shell (the fixed 56px header at the top).

## What You Are Building

A horizontal header bar with three sections: menu button on the left, search input in the center, and filter/view controls on the right.

## Header Bar Layout

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ┌──────────────┐      ┌─────────────────────────────────────┐      ┌──────────────────┐ │
│ │              │      │                                     │      │                  │ │
│ │  LEFT        │      │           CENTER                    │      │      RIGHT       │ │
│ │  Menu Button │      │         Search Input                │      │  Filter + View   │ │
│ │              │      │                                     │      │                  │ │
│ └──────────────┘      └─────────────────────────────────────┘      └──────────────────┘ │
│                                                                                         │
│ ◄─── 16px ───► ◄───────────────────── flex-grow ──────────────────► ◄─── 16px ───►     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
  Height: 56px | Background: white | Border-bottom: 1px solid gray-200

## Section Details

### Left Section — Menu Button
┌────────────────────────────────────────────┐
│                                            │
│   ┌────────────────────┐                   │
│   │ ☰  │   Memry       │                   │
│   │icon│   brand       │                   │
│   └────────────────────┘                   │
│   ▲         ▲                              │
│   │         │                              │
│   20px      Brand text                     │
│   icon      16px, font-semibold            │
│                                            │
└────────────────────────────────────────────┘

- Container: flex row, items-center, gap: 12px
- Menu icon: 20px × 20px, hamburger icon (three horizontal lines)
- Menu button: 40px × 40px hit area, rounded-lg, hover: bg-gray-100
- Brand text: "Memry", font-size: 16px, font-weight: 600, color: gray-900
- Total width: auto (content-based)

### Center Section — Search Input
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│   ┌────────────────────────────────────────────────────────────┐   │
│   │  🔍  │  Search inbox...                                    │   │
│   │ icon │  placeholder text                                   │   │
│   └────────────────────────────────────────────────────────────┘   │
│   ▲                                                                │
│   │                                                                │
│   16px icon, gray-400                                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

- Container: flex-grow, max-width: 560px, margin: 0 auto (centers itself)
- Input wrapper: flex row, items-center, width: 100%
- Background: gray-100, rounded-lg
- Height: 40px
- Padding: 0 16px
- Search icon: 16px × 16px, color: gray-400, margin-right: 10px
- Input field:
  - flex-grow
  - No border, no outline (styled wrapper handles it)
  - Background: transparent
  - Font-size: 14px
  - Placeholder: "Search inbox...", color: gray-400
  - Text color: gray-900
- Focus state: ring-2 ring-blue-500 ring-offset-2 on wrapper
- Hover state: bg-gray-200 on wrapper

### Right Section — Filter & View Controls
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ┌─────────────────────┐    ┌───────────────────────────┐   │
│   │  ▼  │   Filter      │    │   ⊞   │   ≡   │           │   │
│   │ icon│   text        │    │  grid │  list │           │   │
│   └─────────────────────┘    └───────────────────────────┘   │
│          ▲                           ▲                       │
│          │                           │                       │
│     Dropdown button            Toggle button group           │
│                                                              │
└──────────────────────────────────────────────────────────────┘

- Container: flex row, items-center, gap: 12px
- Filter button:
  - Flex row, items-center, gap: 6px
  - Height: 36px, padding: 0 12px
  - Border: 1px solid gray-200, rounded-lg
  - Background: white
  - Chevron down icon: 16px, gray-500
  - Text: "Filter", font-size: 14px, color: gray-700
  - Hover: bg-gray-50, border-color: gray-300
  - Active state (when filters applied): bg-blue-50, border-color: blue-200, text: blue-700

- View toggle (button group):
  - Flex row, no gap (buttons touch)
  - Container: border: 1px solid gray-200, rounded-lg, overflow: hidden
  - Each button: 36px × 36px
  - Icons: 18px × 18px
  - Grid icon: ⊞ (2×2 grid pattern)
  - List icon: ≡ (horizontal lines)
  - Default state: bg-white, icon color: gray-500
  - Active state: bg-gray-100, icon color: gray-900
  - Hover (inactive): bg-gray-50
  - First button: rounded-l-lg, border-right: 1px solid gray-200
  - Second button: rounded-r-lg

## Component States

### Search Input States
| State | Appearance |
|-------|------------|
| Default | bg-gray-100, placeholder visible |
| Hover | bg-gray-200 |
| Focused | bg-white, ring-2 ring-blue-500 |
| With text | Show clear button (✕) on right |

### Filter Button States
| State | Appearance |
|-------|------------|
| Default | White bg, gray border |
| Hover | gray-50 bg |
| Filters active | blue-50 bg, blue border, blue text, show dot indicator |

### View Toggle States
| State | Appearance |
|-------|------------|
| Grid active | Grid button: gray-100 bg, gray-900 icon |
| List active | List button: gray-100 bg, gray-900 icon |

## Interactive Behaviors

### Menu Button
- onClick: Triggers callback (will open sidebar drawer in future)
- For now: console.log("Menu clicked")

### Search Input
- onChange: Triggers callback with search value
- onFocus: Apply focus styles
- onBlur: Remove focus styles
- Clear button (when text present): onClick clears input
- For now: console.log("Search:", value)

### Filter Button
- onClick: Triggers callback (will open filter dropdown in future)
- For now: console.log("Filter clicked")
- Accept prop: hasActiveFilters (boolean) to show active state

### View Toggle
- onClick each button: Triggers callback with view type ("grid" | "list")
- Accept prop: activeView ("grid" | "list")
- For now: console.log("View changed:", viewType)

## Props Interface
```typescript
interface HeaderBarProps {
  onMenuClick: () => void;
  onSearch: (query: string) => void;
  searchValue: string;
  onFilterClick: () => void;
  hasActiveFilters: boolean;
  activeView: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
}
```

## Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| < 768px | Hide brand text, show only menu icon. Search max-width: 100%. Hide "Filter" text, show only icon. |
| 768px - 1024px | Show all elements, search max-width: 400px |
| > 1024px | Full layout as specified, search max-width: 560px |

## Accessibility Requirements

- Menu button: aria-label="Open menu"
- Search input: aria-label="Search inbox", role="searchbox"
- Clear button: aria-label="Clear search"
- Filter button: aria-label="Filter items", aria-expanded (for future dropdown)
- View toggle: role="tablist" on container, role="tab" + aria-selected on buttons
- All interactive elements: visible focus states

## Verification Checklist

After building, verify:
☐ Menu button has hover state and click handler
☐ Search input shows placeholder, accepts text, shows clear button when filled
☐ Search focus state has visible ring
☐ Filter button shows default and active (hasActiveFilters) states
☐ View toggle highlights the active view
☐ Clicking view buttons switches the active state
☐ All elements vertically centered in the 56px bar
☐ Responsive layout works at 640px, 768px, and 1200px widths
☐ Tab order is logical: Menu → Search → Filter → Grid → List

## Output

Create a React component called HeaderBar that accepts the props defined above. Use Tailwind CSS for styling. Replace the "Header Bar" placeholder text in Zone 1 of InboxPageLayout with this component.

Implementation Notes
Key Techniques Used:
TechniqueWhySeparate ASCII diagrams per sectionComplex component broken into digestible partsState tablesClearly defines all visual states without ambiguityProps interfaceTypeScript-style contract ensures proper integrationSpecific pixel values36px buttons, 40px hit areas — no guessingAccessibility sectionPrompts AI to include a11y from the start
Design Choices:

Button group for view toggle — Visually connected buttons communicate "pick one" better than separated icons. Common pattern in Figma, Linear, Notion.
Search centered with max-width — Prevents search from becoming too wide on large screens while staying prominent. Follows Gmail/Slack pattern.
Active filter indicator — Blue styling + potential dot badge makes it obvious when filters are applied (easy to forget and wonder "where did my items go?").
40px hit areas — Minimum touch target size for accessibility, even on desktop (helps trackpad users).


Expected Output Structure
jsx<header className="header-bar">
  {/* Left: Menu + Brand */}
  <div className="header-left">
    <button className="menu-button">☰</button>
    <span className="brand">Memry</span>
  </div>

  {/* Center: Search */}
  <div className="header-center">
    <div className="search-wrapper">
      <SearchIcon />
      <input type="text" placeholder="Search inbox..." />
      {searchValue && <ClearButton />}
    </div>
  </div>

  {/* Right: Filter + View Toggle */}
  <div className="header-right">
    <button className="filter-button">
      <ChevronDownIcon />
      <span>Filter</span>
    </button>
    <div className="view-toggle">
      <button className={activeView === 'grid' ? 'active' : ''}>⊞</button>
      <button className={activeView === 'list' ? 'active' : ''}>≡</button>
    </div>
  </div>
</header>

Usage Guidelines

Wire up to parent state — Search value and active view should be controlled by InboxPageLayout
Test all states — Toggle hasActiveFilters prop to verify filter button styling
Check responsive — Resize to verify text hiding and width changes
Tab through — Verify keyboard navigation order

