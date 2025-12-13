Prompt #21: Empty States
The Prompt
You are building the Empty States for Memry's inbox. These are the screens and messages shown when there's no content to display — whether the user is new, has processed everything, has no search results, or encounters an error. Good empty states guide users toward action rather than leaving them confused.

## What You Are Building

A set of empty state components for:
1. **First-Time Empty** — New user, no items yet
2. **Inbox Zero** — All items processed/archived
3. **No Search Results** — Search query returned nothing
4. **No Filter Results** — Filters too restrictive
5. **Folder Empty** — No items in selected folder
6. **Error State** — Failed to load content
7. **Offline State** — No internet connection

Each state should:
- Communicate clearly what happened
- Guide the user toward an action
- Feel encouraging, not discouraging
- Match the overall Memry visual language

---

## Empty State Anatomy
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                                                             │
│                                                                             │
│                              ┌───────────┐                                  │
│                              │           │                                  │
│                              │   ICON    │                                  │
│                              │           │                                  │
│                              └───────────┘                                  │
│                                                                             │
│                              HEADLINE                                       │
│                              ────────────                                   │
│                              Primary message                                │
│                                                                             │
│                         Supporting description                              │
│                         ──────────────────────                              │
│                         Secondary context or guidance                       │
│                                                                             │
│                            ┌─────────────┐                                  │
│                            │   ACTION    │                                  │
│                            └─────────────┘                                  │
│                            Primary CTA button                               │
│                                                                             │
│                            Secondary action                                 │
│                            ────────────────                                 │
│                            Text link (optional)                             │
│                                                                             │
│                                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Common Styling
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Empty State Container:                                                     │
│                                                                             │
│  - Display: flex                                                            │
│  - Flex-direction: column                                                   │
│  - Align-items: center                                                      │
│  - Justify-content: center                                                  │
│  - Text-align: center                                                       │
│  - Padding: 48px 24px                                                       │
│  - Min-height: 400px (or fill available space)                              │
│  - Max-width: 400px                                                         │
│  - Margin: 0 auto                                                           │
│                                                                             │
│  Icon:                                                                      │
│  - Size: 64px × 64px (or 80px for primary states)                           │
│  - Color: gray-300 (default) or contextual color                            │
│  - Margin-bottom: 24px                                                      │
│  - Can be illustration, emoji, or icon                                      │
│                                                                             │
│  Headline:                                                                  │
│  - Font-size: 20px                                                          │
│  - Font-weight: 600                                                         │
│  - Color: gray-900                                                          │
│  - Margin-bottom: 8px                                                       │
│  - Line-height: 1.3                                                         │
│                                                                             │
│  Description:                                                               │
│  - Font-size: 15px                                                          │
│  - Color: gray-500                                                          │
│  - Line-height: 1.5                                                         │
│  - Max-width: 320px                                                         │
│  - Margin-bottom: 24px                                                      │
│                                                                             │
│  Primary Action Button:                                                     │
│  - Height: 44px                                                             │
│  - Padding: 0 24px                                                          │
│  - Background: gray-900                                                     │
│  - Color: white                                                             │
│  - Border-radius: 10px                                                      │
│  - Font-size: 15px                                                          │
│  - Font-weight: 500                                                         │
│  - Hover: background gray-800                                               │
│                                                                             │
│  Secondary Action:                                                          │
│  - Font-size: 14px                                                          │
│  - Color: gray-500                                                          │
│  - Margin-top: 12px                                                         │
│  - Hover: color blue-600, underline                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## 1. First-Time Empty (New User)

### When Shown
- User has just signed up
- Inbox has zero items
- No items have ever been added

### Design
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Header Bar                                                                                   │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Context Bar: Inbox · 0 items                                                                 │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                         ┌─────────────────┐                                         │
│                                         │                 │                                         │
│                                         │    ✨ 📥 ✨     │                                         │
│                                         │                 │                                         │
│                                         │   (Illustration │                                         │
│                                         │    or icons)    │                                         │
│                                         │                 │                                         │
│                                         └─────────────────┘                                         │
│                                                                                                     │
│                                       Welcome to your inbox                                         │
│                                       ─────────────────────                                         │
│                                                                                                     │
│                               This is where all your captured ideas,                                │
│                               links, notes, and voice memos will live.                              │
│                                                                                                     │
│                                                                                                     │
│                                      ┌──────────────────────┐                                       │
│                                      │                      │                                       │
│                                      │   Capture your first │                                       │
│                                      │        item          │                                       │
│                                      │                      │                                       │
│                                      └──────────────────────┘                                       │
│                                                                                                     │
│                                      Or try the Quick Capture                                       │
│                                      bar below ↓                                                    │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Quick Capture Bar                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Content
```typescript
const FIRST_TIME_EMPTY = {
  icon: '📥',  // or custom illustration
  headline: 'Welcome to your inbox',
  description: 'This is where all your captured ideas, links, notes, and voice memos will live.',
  primaryAction: {
    label: 'Capture your first item',
    action: 'focusQuickCapture',  // Focus the Quick Capture bar
  },
  secondaryAction: {
    label: 'Or try the Quick Capture bar below ↓',
    action: null,  // Just informational
  },
};
```

### Illustration Options
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Option A: Emoji cluster                                                    │
│  ─────────────────────────                                                  │
│                                                                             │
│            ✨                                                               │
│        📝     🔗                                                            │
│           📥                                                                │
│        🖼️     🎤                                                            │
│            ✨                                                               │
│                                                                             │
│  Multiple icons arranged around central inbox                               │
│  Size: 80px total area                                                      │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Option B: Simple icon with accent                                          │
│  ──────────────────────────────────                                         │
│                                                                             │
│          ┌──────────────┐                                                   │
│          │              │                                                   │
│          │     📥       │                                                   │
│          │              │                                                   │
│          └──────────────┘                                                   │
│                                                                             │
│  Single inbox icon (64px) with subtle                                       │
│  blue-50 circular background (96px)                                         │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Option C: Custom illustration                                              │
│  ─────────────────────────────                                              │
│                                                                             │
│  Simple line art illustration showing:                                      │
│  - Open inbox/tray                                                          │
│  - Floating cards descending into it                                        │
│  - Subtle sparkles/stars                                                    │
│  - 120px × 100px                                                            │
│  - Colors: gray-400 lines, blue-100 fills                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Quick Start Tips (Optional Enhancement)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Below the main empty state, show quick tips:                               │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Quick ways to capture:                                               │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │  │
│  │  │                 │  │                 │  │                 │        │  │
│  │  │   🔗            │  │   🎤            │  │   📝            │        │  │
│  │  │   Paste a       │  │   Record a      │  │   Type a        │        │  │
│  │  │   link          │  │   voice memo    │  │   quick note    │        │  │
│  │  │                 │  │                 │  │                 │        │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Tip cards:                                                                 │
│  - Width: 140px                                                             │
│  - Padding: 16px                                                            │
│  - Background: gray-50                                                      │
│  - Border-radius: 12px                                                      │
│  - Icon: 24px, margin-bottom: 8px                                           │
│  - Text: 13px, gray-600, center                                             │
│  - Hover: background gray-100, cursor pointer                               │
│  - Click: Focuses relevant input in Quick Capture                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## 2. Inbox Zero (All Processed)

### When Shown
- User has items but all are archived/processed
- Inbox filter shows 0 active items
- Items exist in Archive folder

### Design
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                         ┌─────────────────┐                                         │
│                                         │                 │                                         │
│                                         │       🎉        │                                         │
│                                         │                 │                                         │
│                                         └─────────────────┘                                         │
│                                                                                                     │
│                                          You're all caught up!                                      │
│                                          ─────────────────────                                      │
│                                                                                                     │
│                                    Your inbox is empty. Great job                                   │
│                                    processing all your captures!                                    │
│                                                                                                     │
│                                                                                                     │
│                                      ┌──────────────────────┐                                       │
│                                      │                      │                                       │
│                                      │   Capture something  │                                       │
│                                      │        new           │                                       │
│                                      │                      │                                       │
│                                      └──────────────────────┘                                       │
│                                                                                                     │
│                                        View archived items                                          │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Content Variations
```typescript
// Randomly show different celebratory messages
const INBOX_ZERO_VARIATIONS = [
  {
    icon: '🎉',
    headline: "You're all caught up!",
    description: 'Your inbox is empty. Great job processing all your captures!',
  },
  {
    icon: '✨',
    headline: 'Inbox zero achieved!',
    description: "You've processed everything. Time for a well-deserved break.",
  },
  {
    icon: '🌟',
    headline: 'Nothing to see here',
    description: "Your inbox is clear. You're on top of things!",
  },
  {
    icon: '🏆',
    headline: 'All done!',
    description: 'Every item has been processed. Nice work!',
  },
];

const INBOX_ZERO = {
  ...getRandomVariation(INBOX_ZERO_VARIATIONS),
  primaryAction: {
    label: 'Capture something new',
    action: 'focusQuickCapture',
  },
  secondaryAction: {
    label: 'View archived items',
    action: 'navigateToArchive',
  },
};
```

### Celebration Animation (Optional)
```css
/* Subtle confetti or sparkle animation on first view */
@keyframes celebrate {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.inbox-zero-icon {
  animation: celebrate 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Or floating particles */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
    opacity: 1;
  }
}

.sparkle {
  animation: float 2s ease-in-out infinite;
}
```

---

## 3. No Search Results

### When Shown
- User has entered a search query
- Query returned zero matches
- Items exist but none match

### Design
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│                    ┌────────────────────────────────────────────────────────────┐                   │
│                    │  🔍  quantum entanglement                              ✕   │                   │
│                    └────────────────────────────────────────────────────────────┘                   │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Context Bar: Inbox · 0 results for "quantum entanglement"                                    │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                         ┌─────────────────┐                                         │
│                                         │                 │                                         │
│                                         │       🔍        │                                         │
│                                         │                 │                                         │
│                                         └─────────────────┘                                         │
│                                                                                                     │
│                                  No results for "quantum entanglement"                              │
│                                  ─────────────────────────────────────                              │
│                                                                                                     │
│                                    We couldn't find any items matching                              │
│                                    your search. Try different keywords                              │
│                                    or check the spelling.                                           │
│                                                                                                     │
│                                                                                                     │
│                                      ┌──────────────────────┐                                       │
│                                      │                      │                                       │
│                                      │    Clear search      │                                       │
│                                      │                      │                                       │
│                                      └──────────────────────┘                                       │
│                                                                                                     │
│                                        Search in archived items                                     │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Content
```typescript
interface NoSearchResultsProps {
  query: string;
  hasArchive: boolean;  // Show "search archive" option
}

const NO_SEARCH_RESULTS = {
  icon: '🔍',
  getHeadline: (query: string) => `No results for "${truncate(query, 30)}"`,
  description: "We couldn't find any items matching your search. Try different keywords or check the spelling.",
  primaryAction: {
    label: 'Clear search',
    action: 'clearSearch',
  },
  secondaryAction: {
    label: 'Search in archived items',
    action: 'searchArchive',
    showIf: 'hasArchive',
  },
};
```

### Search Suggestions
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Below "no results" message, show helpful suggestions:                      │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Suggestions:                                                         │  │
│  │                                                                       │  │
│  │  • Try shorter or more general terms                                  │  │
│  │  • Check for typos or misspellings                                    │  │
│  │  • Search by tag with #tagname                                        │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Styling:                                                                   │
│  - Margin-top: 24px                                                         │
│  - Background: gray-50                                                      │
│  - Border-radius: 10px                                                      │
│  - Padding: 16px 20px                                                       │
│  - Text: 13px, gray-500                                                     │
│  - List-style: disc, inside, gray-400                                       │
│                                                                             │
│  Alternative: Show recent successful searches as clickable chips            │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Recent searches:                                                     │  │
│  │                                                                       │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                         │  │
│  │  │  design    │ │  #work     │ │  meeting   │                         │  │
│  │  └────────────┘ └────────────┘ └────────────┘                         │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## 4. No Filter Results

### When Shown
- User has applied filters
- Filters are too restrictive (0 matches)
- Items exist but none match filter criteria

### Design
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Context Bar: Inbox · 0 items                                                                 │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Active filters: 🖼️ Images ✕   #design ✕   Last 7 days ✕               Clear all             │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                         ┌─────────────────┐                                         │
│                                         │                 │                                         │
│                                         │       🔽        │                                         │
│                                         │                 │                                         │
│                                         └─────────────────┘                                         │
│                                                                                                     │
│                                       No items match your filters                                   │
│                                       ───────────────────────────                                   │
│                                                                                                     │
│                                    Try removing some filters or adjusting                           │
│                                    the date range to see more items.                                │
│                                                                                                     │
│                                                                                                     │
│                                      ┌──────────────────────┐                                       │
│                                      │                      │                                       │
│                                      │   Clear all filters  │                                       │
│                                      │                      │                                       │
│                                      └──────────────────────┘                                       │
│                                                                                                     │
│                                        156 items without filters                                    │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Content
```typescript
interface NoFilterResultsProps {
  activeFilterCount: number;
  totalItemCount: number;  // Items available without filters
}

const NO_FILTER_RESULTS = {
  icon: '🔽',  // Or filter funnel icon
  headline: 'No items match your filters',
  description: 'Try removing some filters or adjusting the date range to see more items.',
  primaryAction: {
    label: 'Clear all filters',
    action: 'clearAllFilters',
  },
  getSecondaryText: (total: number) =>
    `${total} item${total !== 1 ? 's' : ''} without filters`,
};
```

### Filter Breakdown (Optional)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Show which filters are too restrictive:                                    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Filter breakdown:                                                    │  │
│  │                                                                       │  │
│  │  🖼️ Images only          →  8 items match                            │  │
│  │  #design                  →  12 items match                           │  │
│  │  Last 7 days              →  3 items match                            │  │
│  │                                                                       │  │
│  │  Combined: 0 items match all filters                                  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  This helps users understand which filter to adjust                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## 5. Folder Empty

### When Shown
- User is viewing a specific folder
- Folder has zero items
- Different message for user-created vs system folders

### Design
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Context Bar: Work / Projects · 0 items                                                       │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                         ┌─────────────────┐                                         │
│                                         │                 │                                         │
│                                         │       📁        │                                         │
│                                         │                 │                                         │
│                                         └─────────────────┘                                         │
│                                                                                                     │
│                                        This folder is empty                                         │
│                                        ────────────────────                                         │
│                                                                                                     │
│                                    Move items here from your inbox                                  │
│                                    or capture something new.                                        │
│                                                                                                     │
│                                                                                                     │
│                                      ┌──────────────────────┐                                       │
│                                      │                      │                                       │
│                                      │    Move items here   │                                       │
│                                      │                      │                                       │
│                                      └──────────────────────┘                                       │
│                                                                                                     │
│                                          Go to inbox                                                │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Content by Folder Type
```typescript
const FOLDER_EMPTY_STATES = {
  // User-created folder
  userFolder: {
    icon: '📁',
    headline: 'This folder is empty',
    description: 'Move items here from your inbox or capture something new.',
    primaryAction: {
      label: 'Move items here',
      action: 'openMoveDialog',
    },
    secondaryAction: {
      label: 'Go to inbox',
      action: 'navigateToInbox',
    },
  },

  // Archive folder
  archive: {
    icon: '📥',
    headline: 'No archived items',
    description: "Items you archive will appear here. You haven't archived anything yet.",
    primaryAction: {
      label: 'Go to inbox',
      action: 'navigateToInbox',
    },
    secondaryAction: null,
  },

  // Trash/Recently Deleted
  trash: {
    icon: '🗑️',
    headline: 'Trash is empty',
    description: "Deleted items will appear here for 30 days before being permanently removed.",
    primaryAction: null,
    secondaryAction: null,
  },
};
```

---

## 6. Error State

### When Shown
- Failed to load inbox items
- API error occurred
- Server is unreachable

### Design
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                         ┌─────────────────┐                                         │
│                                         │                 │                                         │
│                                         │       ⚠️        │                                         │
│                                         │                 │                                         │
│                                         └─────────────────┘                                         │
│                                                                                                     │
│                                       Something went wrong                                          │
│                                       ────────────────────                                          │
│                                                                                                     │
│                                    We couldn't load your inbox.                                     │
│                                    Please try again in a moment.                                    │
│                                                                                                     │
│                                                                                                     │
│                                      ┌──────────────────────┐                                       │
│                                      │                      │                                       │
│                                      │     Try again        │                                       │
│                                      │                      │                                       │
│                                      └──────────────────────┘                                       │
│                                                                                                     │
│                                        Contact support                                              │
│                                                                                                     │
│                                ┌─────────────────────────────────┐                                  │
│                                │  Error: NETWORK_ERROR (500)     │                                  │
│                                └─────────────────────────────────┘                                  │
│                                Technical details (collapsed)                                        │
│                                                                                                     │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Error Types
```typescript
type ErrorType =
  | 'network'       // No internet, timeout
  | 'server'        // 500 errors
  | 'auth'          // 401, 403 errors
  | 'notFound'      // 404 errors
  | 'unknown';      // Catch-all

const ERROR_STATES: Record<ErrorType, EmptyStateContent> = {
  network: {
    icon: '📡',
    headline: 'Connection problem',
    description: "We couldn't reach the server. Check your internet connection and try again.",
    primaryAction: { label: 'Try again', action: 'retry' },
  },

  server: {
    icon: '⚠️',
    headline: 'Something went wrong',
    description: "We're having trouble loading your inbox. Our team has been notified.",
    primaryAction: { label: 'Try again', action: 'retry' },
    secondaryAction: { label: 'Contact support', action: 'openSupport' },
  },

  auth: {
    icon: '🔒',
    headline: 'Session expired',
    description: 'Please sign in again to continue.',
    primaryAction: { label: 'Sign in', action: 'signIn' },
  },

  notFound: {
    icon: '🔍',
    headline: 'Page not found',
    description: "The page you're looking for doesn't exist or has been moved.",
    primaryAction: { label: 'Go to inbox', action: 'navigateToInbox' },
  },

  unknown: {
    icon: '❓',
    headline: 'Unexpected error',
    description: 'Something unexpected happened. Please try again.',
    primaryAction: { label: 'Try again', action: 'retry' },
    secondaryAction: { label: 'Contact support', action: 'openSupport' },
  },
};
```

### Technical Details (Collapsible)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ▶ Show technical details                                             │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  When expanded:                                                             │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ▼ Hide technical details                                             │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │  Error: NETWORK_ERROR                                           │  │  │
│  │  │  Status: 500                                                    │  │  │
│  │  │  Request ID: req_abc123xyz                                      │  │  │
│  │  │  Timestamp: 2024-12-13T10:30:45Z                                │  │  │
│  │  │                                                                 │  │  │
│  │  │                                    [ Copy details ]             │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Styling:                                                                   │
│  - Toggle: 13px, gray-500, cursor pointer                                   │
│  - Details box: gray-100 background, monospace font                         │
│  - Padding: 12px                                                            │
│  - Border-radius: 6px                                                       │
│  - Font-size: 12px                                                          │
│  - Copy button: Small ghost button                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## 7. Offline State

### When Shown
- Device has no internet connection
- Detected via `navigator.onLine` or failed requests
- Overlay or inline depending on context

### Design
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                               │  │
│  │  ⚡ You're offline                                                       [ Dismiss ]          │  │
│  │                                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│  ▲ Sticky banner at top of content area                                                             │
│                                                                                                     │
│                                                                                                     │
│  ... existing content continues (cached/stale) ...                                                  │
│                                                                                                     │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Offline Banner
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Offline Banner:                                                            │
│                                                                             │
│  - Position: Sticky at top of content area                                  │
│  - Width: 100%                                                              │
│  - Height: 48px                                                             │
│  - Background: amber-50                                                     │
│  - Border-bottom: 1px solid amber-200                                       │
│  - Display: flex                                                            │
│  - Align-items: center                                                      │
│  - Padding: 0 24px                                                          │
│  - Gap: 12px                                                                │
│                                                                             │
│  Icon: ⚡ or 📡, 18px, amber-600                                            │
│                                                                             │
│  Text:                                                                      │
│  - "You're offline" - 14px, font-weight: 500, amber-800                     │
│  - "Changes will sync when you're back online" - 14px, amber-600            │
│                                                                             │
│  Dismiss button:                                                            │
│  - Ghost style, small                                                       │
│  - Or auto-dismiss when back online                                         │
│                                                                             │
│  Animation: Slide down from top                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Full Offline State (No Cached Data)
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                         ┌─────────────────┐                                         │
│                                         │                 │                                         │
│                                         │      📡         │                                         │
│                                         │                 │                                         │
│                                         └─────────────────┘                                         │
│                                                                                                     │
│                                          You're offline                                             │
│                                          ──────────────────                                         │
│                                                                                                     │
│                                    Connect to the internet to                                       │
│                                    access your inbox.                                               │
│                                                                                                     │
│                                                                                                     │
│                                      ┌──────────────────────┐                                       │
│                                      │                      │                                       │
│                                      │     Try again        │                                       │
│                                      │                      │                                       │
│                                      └──────────────────────┘                                       │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Online Detection
```typescript
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

---

## Props Interface
```typescript
type EmptyStateType =
  | 'firstTime'
  | 'inboxZero'
  | 'noSearchResults'
  | 'noFilterResults'
  | 'folderEmpty'
  | 'error'
  | 'offline';

interface EmptyStateProps {
  type: EmptyStateType;

  // Context-specific data
  searchQuery?: string;           // For noSearchResults
  activeFilters?: FilterState;    // For noFilterResults
  totalItemCount?: number;        // For noFilterResults (items without filters)
  folderName?: string;            // For folderEmpty
  folderType?: 'user' | 'archive' | 'trash';  // For folderEmpty
  error?: {                       // For error
    type: ErrorType;
    message?: string;
    code?: string;
    requestId?: string;
  };

  // Actions
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onRetry?: () => void;

  // Optional customization
  customIcon?: React.ReactNode;
  customHeadline?: string;
  customDescription?: string;
}
```

---

## Animation

### Entrance Animation
```css
@keyframes emptyStateEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-state {
  animation: emptyStateEnter 400ms ease-out;
}

/* Stagger children */
.empty-state-icon {
  animation: emptyStateEnter 400ms ease-out;
  animation-delay: 0ms;
}

.empty-state-headline {
  animation: emptyStateEnter 400ms ease-out;
  animation-delay: 100ms;
  animation-fill-mode: both;
}

.empty-state-description {
  animation: emptyStateEnter 400ms ease-out;
  animation-delay: 150ms;
  animation-fill-mode: both;
}

.empty-state-actions {
  animation: emptyStateEnter 400ms ease-out;
  animation-delay: 200ms;
  animation-fill-mode: both;
}
```

### Icon Animations
```css
/* Subtle floating for first-time empty */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.empty-state-icon.floating {
  animation: float 3s ease-in-out infinite;
}

/* Pulse for error states */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.empty-state-icon.pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

---

## Responsive Behavior

### Mobile (< 640px)
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              ┌──────────┐               │
│              │          │               │
│              │    📥    │               │
│              │          │               │
│              └──────────┘               │
│                                         │
│          Welcome to your inbox          │
│          ──────────────────────         │
│                                         │
│      This is where all your captured    │
│      ideas, links, notes, and voice     │
│      memos will live.                   │
│                                         │
│                                         │
│      ┌───────────────────────────┐      │
│      │                           │      │
│      │   Capture your first      │      │
│      │         item              │      │
│      │                           │      │
│      └───────────────────────────┘      │
│                                         │
│      Or try the Quick Capture           │
│      bar below ↓                        │
│                                         │
│                                         │
└─────────────────────────────────────────┘
Mobile changes:

Padding: 32px 20px
Icon: 56px (slightly smaller)
Headline: 18px
Description: 14px, padding: 0 16px
Button: Full width (minus padding)
Min-height: 300px


---

## Verification Checklist

After building, verify:
☐ First-time empty shows for new users with 0 items
☐ Quick start tips are clickable and focus Quick Capture
☐ Inbox zero shows celebratory message
☐ Inbox zero has variation in messages
☐ No search results shows the query
☐ Clear search button works
☐ Search suggestions/recent searches appear
☐ No filter results shows active filter count
☐ Clear filters button works
☐ Total item count without filters is shown
☐ Folder empty shows correct message per folder type
☐ Error state shows appropriate error message
☐ Technical details are collapsible
☐ Retry button works
☐ Offline banner appears when offline
☐ Offline banner auto-dismisses when online
☐ All primary action buttons work
☐ All secondary action links work
☐ Entrance animations are smooth
☐ Icon animations add personality (not annoying)
☐ Responsive layouts work on mobile
☐ Empty states are keyboard accessible
☐ Screen readers announce empty state content

## Output

Create a React component called EmptyState that accepts the props defined above, plus specific sub-components:

1. **EmptyState** — Generic wrapper that renders correct content based on `type`
2. **FirstTimeEmpty** — New user welcome
3. **InboxZero** — All caught up celebration
4. **NoSearchResults** — Search returned nothing
5. **NoFilterResults** — Filters too restrictive
6. **FolderEmpty** — Empty folder message
7. **ErrorState** — Error display with retry
8. **OfflineBanner** — Sticky offline indicator

Use Tailwind CSS for styling. Components should:
1. Display appropriate icon, headline, description, and actions
2. Handle action callbacks
3. Animate smoothly on entrance
4. Be fully responsive
5. Support customization where needed

Implementation Notes
Key Principles:
PrincipleApplicationGuide, don't just informEvery empty state has an actionBe encouragingPositive language, celebratory for inbox zeroProvide contextShow what filters/search caused empty stateEnable recoveryClear filters, retry, go to inbox optionsMatch the brandConsistent icons, colors, animations
Design Choices:
