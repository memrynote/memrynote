Prompt #18: Search Input
The Prompt
You are building the Search Input component for Memry's inbox. This component provides full-text search across all inbox items with autocomplete suggestions, recent searches, and keyboard-driven navigation. It is located in the center of the Header Bar.

## What You Are Building

A search input that:
1. Searches across all item types (titles, content, tags, URLs, transcripts)
2. Shows autocomplete suggestions as user types
3. Displays recent searches for quick access
4. Supports keyboard navigation throughout
5. Integrates with filters for refined search
6. Highlights matching terms in results

## Search Input in Header Bar

The search input was introduced in Prompt #2. Here's a detailed breakdown:
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  HEADER BAR                                                                                         │
│  ──────────                                                                                         │
│                                                                                                     │
│  ┌──────────┐   ┌────────────────────────────────────────────────────────────────┐   ┌───────────┐ │
│  │          │   │                                                                │   │           │ │
│  │  ☰ Memry │   │  🔍  Search your inbox...                                      │   │ Filter ▼  │ │
│  │          │   │                                                                │   │           │ │
│  └──────────┘   └────────────────────────────────────────────────────────────────┘   └───────────┘ │
│                                                                                                     │
│  Left section   Center section (SEARCH)                                          Right section     │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

---

## Search Input States

### Default (Empty) State
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  🔍  Search your inbox...                                      ⌘K    │  │
│  │  ──  ─────────────────────                                     ────   │  │
│  │  icon Placeholder text                                        Shortcut│  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Container:                                                                 │
│  - Width: 100%                                                              │
│  - Max-width: 560px                                                         │
│  - Height: 40px                                                             │
│  - Background: gray-100                                                     │
│  - Border: 1px solid transparent                                            │
│  - Border-radius: 10px                                                      │
│  - Padding: 0 14px                                                          │
│  - Display: flex                                                            │
│  - Align-items: center                                                      │
│  - Gap: 10px                                                                │
│  - Cursor: text                                                             │
│                                                                             │
│  Search icon:                                                               │
│  - Size: 18px                                                               │
│  - Color: gray-400                                                          │
│  - Flex-shrink: 0                                                           │
│                                                                             │
│  Placeholder:                                                               │
│  - Font-size: 14px                                                          │
│  - Color: gray-500                                                          │
│                                                                             │
│  Keyboard shortcut badge:                                                   │
│  - Background: white                                                        │
│  - Border: 1px solid gray-200                                               │
│  - Border-radius: 4px                                                       │
│  - Padding: 2px 6px                                                         │
│  - Font-size: 11px                                                          │
│  - Font-family: system mono or sans                                         │
│  - Color: gray-400                                                          │
│  - Flex-shrink: 0                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Focused (Empty) State
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  🔍  █                                                           ✕    │  │
│  │      ▲                                                           ▲    │  │
│  │      │                                                           │    │  │
│  │   Cursor                                                    Clear btn │  │
│  │   (blinking)                                              (if content)│  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Focused container changes:                                                 │
│  - Background: white                                                        │
│  - Border: 1px solid gray-300                                               │
│  - Box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15)  (blue focus ring)       │
│                                                                             │
│  Keyboard shortcut badge:                                                   │
│  - Hidden when focused                                                      │
│                                                                             │
│  Input:                                                                     │
│  - Flex: 1                                                                  │
│  - Background: transparent                                                  │
│  - Border: none                                                             │
│  - Outline: none                                                            │
│  - Font-size: 14px                                                          │
│  - Color: gray-900                                                          │
│  - Caret-color: blue-500                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Typing State
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  🔍  design system█                                              ✕    │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Clear button (✕):                                                          │
│  - Size: 18px × 18px                                                        │
│  - Border-radius: full                                                      │
│  - Background: gray-200                                                     │
│  - Icon: 10px, gray-500                                                     │
│  - Hover: bg-gray-300, icon gray-700                                        │
│  - Only visible when input has content                                      │
│  - Click clears input and keeps focus                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Active Search State (With Query)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  🔍  design system                                               ✕    │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  When search is active (query submitted/applied):                           │
│  - Background: blue-50                                                      │
│  - Border: 1px solid blue-200                                               │
│  - Search icon: blue-500                                                    │
│  - Text: blue-700                                                           │
│                                                                             │
│  This indicates the view is filtered by search query                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Search Dropdown

When the search input is focused, a dropdown appears below with suggestions:
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│                    ┌────────────────────────────────────────────────────────────┐                   │
│                    │  🔍  design█                                           ✕   │                   │
│                    └────────────────────────────────────────────────────────────┘                   │
│                                           │                                                         │
│                                           ▼                                                         │
│                    ┌────────────────────────────────────────────────────────────────────────────┐   │
│                    │                                                                            │   │
│                    │  SUGGESTIONS                                                               │   │
│                    │  ───────────                                                               │   │
│                    │                                                                            │   │
│                    │  ┌──────────────────────────────────────────────────────────────────────┐  │   │
│                    │  │  🔍  design                              Search for "design"        │  │   │
│                    │  └──────────────────────────────────────────────────────────────────────┘  │   │
│                    │                                                                            │   │
│                    │  ┌──────────────────────────────────────────────────────────────────────┐  │   │
│                    │  │  🔍  design system                       Search for "design system" │  │   │
│                    │  └──────────────────────────────────────────────────────────────────────┘  │   │
│                    │                                                                            │   │
│                    │  ┌──────────────────────────────────────────────────────────────────────┐  │   │
│                    │  │  🏷️  #design                             Search tag                  │  │   │
│                    │  └──────────────────────────────────────────────────────────────────────┘  │   │
│                    │                                                                            │   │
│                    │  ─────────────────────────────────────────────────────────────────────────  │   │
│                    │                                                                            │   │
│                    │  ITEMS                                                                     │   │
│                    │  ─────                                                                     │   │
│                    │                                                                            │   │
│                    │  ┌──────────────────────────────────────────────────────────────────────┐  │   │
│                    │  │  🔗  Design Systems: A Complete Guide                    2h ago      │  │   │
│                    │  │      medium.com · "...building <mark>design</mark> systems..."      │  │   │
│                    │  └──────────────────────────────────────────────────────────────────────┘  │   │
│                    │                                                                            │   │
│                    │  ┌──────────────────────────────────────────────────────────────────────┐  │   │
│                    │  │  📝  Design Review Notes                                   1d ago    │  │   │
│                    │  │      "...discussed the new <mark>design</mark> direction..."        │  │   │
│                    │  └──────────────────────────────────────────────────────────────────────┘  │   │
│                    │                                                                            │   │
│                    │  ┌──────────────────────────────────────────────────────────────────────┐  │   │
│                    │  │  🖼️  design-mockup-v2.png                                  3d ago    │  │   │
│                    │  │      AI: dashboard, <mark>design</mark>, mockup                     │  │   │
│                    │  └──────────────────────────────────────────────────────────────────────┘  │   │
│                    │                                                                            │   │
│                    │  ─────────────────────────────────────────────────────────────────────────  │   │
│                    │                                                                            │   │
│                    │  ↵ to search  ·  ↑↓ to navigate  ·  esc to close                          │   │
│                    │                                                                            │   │
│                    └────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

---

## Dropdown Structure

### Dropdown Container
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Dropdown Container:                                                        │
│                                                                             │
│  - Position: absolute                                                       │
│  - Top: 100% + 8px                                                          │
│  - Left: 50%                                                                │
│  - Transform: translateX(-50%)  (centered below input)                      │
│  - Width: 100%                                                              │
│  - Max-width: 600px                                                         │
│  - Max-height: 480px                                                        │
│  - Background: white                                                        │
│  - Border: 1px solid gray-200                                               │
│  - Border-radius: 12px                                                      │
│  - Box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12),                              │
│                0 2px 8px rgba(0, 0, 0, 0.08)                                │
│  - Z-index: 50                                                              │
│  - Overflow: hidden                                                         │
│  - Display: flex                                                            │
│  - Flex-direction: column                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Dropdown Content Sections
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  1. SUGGESTIONS SECTION (when typing)                                       │
│  ────────────────────────────────────                                       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  SUGGESTIONS                                                          │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  🔍  design                           Search for "design"       │  │  │
│  │  │      ──────                           ──────────────────        │  │  │
│  │  │      Query text                       Action description        │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  🏷️  #design                          Search tag                │  │  │
│  │  │      ────────                         ──────────                │  │  │
│  │  │      Tag match                        Tag search action         │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Section header:                                                            │
│  - Padding: 10px 16px 6px                                                   │
│  - Font-size: 11px                                                          │
│  - Font-weight: 600                                                         │
│  - Color: gray-500                                                          │
│  - Text-transform: uppercase                                                │
│  - Letter-spacing: 0.05em                                                   │
│                                                                             │
│  Suggestion row:                                                            │
│  - Padding: 10px 16px                                                       │
│  - Display: flex                                                            │
│  - Align-items: center                                                      │
│  - Gap: 12px                                                                │
│  - Cursor: pointer                                                          │
│  - Transition: background 100ms                                             │
│                                                                             │
│  Suggestion icon:                                                           │
│  - 🔍 for text search                                                       │
│  - 🏷️ for tag search                                                       │
│  - Size: 16px, color: gray-400                                              │
│                                                                             │
│  Suggestion text:                                                           │
│  - Flex: 1                                                                  │
│  - Font-size: 14px                                                          │
│  - Color: gray-900                                                          │
│  - Font-weight: 500                                                         │
│                                                                             │
│  Action text:                                                               │
│  - Font-size: 13px                                                          │
│  - Color: gray-400                                                          │
│  - Flex-shrink: 0                                                           │
│                                                                             │
│  Hover / Selected state:                                                    │
│  - Background: gray-50                                                      │
│  - Arrow icon appears on right: →, gray-400                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Items Preview Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  2. ITEMS SECTION (matching items preview)                                  │
│  ────────────────────────────────────────                                   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ITEMS                                                   5 results    │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │  ┌────┐                                                         │  │  │
│  │  │  │ 🔗 │  Design Systems: A Complete Guide              2h ago   │  │  │
│  │  │  └────┘  medium.com · "...building <mark>design</mark>..."      │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │  ┌────┐                                                         │  │  │
│  │  │  │ 📝 │  Design Review Notes                           1d ago   │  │  │
│  │  │  └────┘  "...the new <mark>design</mark> direction..."          │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ... (max 5 items shown)                                              │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │      See all 24 results →                                       │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Item row:                                                                  │
│  - Padding: 12px 16px                                                       │
│  - Display: flex                                                            │
│  - Gap: 12px                                                                │
│  - Cursor: pointer                                                          │
│  - Border-radius: 8px (with margin: 0 8px for inset)                        │
│                                                                             │
│  Type icon:                                                                 │
│  - Size: 28px × 28px container                                              │
│  - Border-radius: 6px                                                       │
│  - Background: (type color)-50                                              │
│  - Icon: 14px, (type color)-600                                             │
│                                                                             │
│  Content:                                                                   │
│  - Flex: 1                                                                  │
│  - Min-width: 0                                                             │
│                                                                             │
│  Title:                                                                     │
│  - Font-size: 14px                                                          │
│  - Font-weight: 500                                                         │
│  - Color: gray-900                                                          │
│  - Line-clamp: 1                                                            │
│                                                                             │
│  Snippet:                                                                   │
│  - Font-size: 13px                                                          │
│  - Color: gray-500                                                          │
│  - Line-clamp: 1                                                            │
│  - Contains highlighted matches                                             │
│                                                                             │
│  Match highlighting (<mark>):                                               │
│  - Background: yellow-200                                                   │
│  - Color: inherit                                                           │
│  - Padding: 0 2px                                                           │
│  - Border-radius: 2px                                                       │
│                                                                             │
│  Time:                                                                      │
│  - Font-size: 12px                                                          │
│  - Color: gray-400                                                          │
│  - Flex-shrink: 0                                                           │
│                                                                             │
│  "See all X results" link:                                                  │
│  - Text-align: center                                                       │
│  - Font-size: 13px                                                          │
│  - Color: blue-600                                                          │
│  - Font-weight: 500                                                         │
│  - Hover: underline                                                         │
│  - Click submits search and closes dropdown                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Recent Searches Section (When Empty)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  3. RECENT SEARCHES (shown when input is empty and focused)                 │
│  ──────────────────────────────────────────────────────────                 │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  RECENT SEARCHES                                        [ Clear ]     │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  🕒  design system                                              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  🕒  meeting notes                                              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  🕒  #research                                                  │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  🕒  api documentation                                          │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Recent search row:                                                         │
│  - Same structure as suggestion row                                         │
│  - Icon: 🕒 clock, gray-400                                                 │
│  - Hover shows ✕ remove button on right                                     │
│                                                                             │
│  Clear button:                                                              │
│  - Font-size: 12px                                                          │
│  - Color: gray-400                                                          │
│  - Hover: color gray-600                                                    │
│  - Clears all recent searches                                               │
│                                                                             │
│  Storage:                                                                   │
│  - Store last 10 searches in localStorage                                   │
│  - Key: "memry-recent-searches"                                             │
│  - Include query and timestamp                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Dropdown Footer

### Keyboard Hints
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ↵ to search  ·  ↑↓ to navigate  ·  esc to close                     │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Container:                                                                 │
│  - Padding: 10px 16px                                                       │
│  - Border-top: 1px solid gray-100                                           │
│  - Background: gray-50                                                      │
│  - Font-size: 12px                                                          │
│  - Color: gray-400                                                          │
│  - Text-align: center                                                       │
│                                                                             │
│  Keyboard icons:                                                            │
│  - ↵ (Enter), ↑↓ (arrows), esc                                             │
│  - Font-family: system or monospace                                         │
│  - Background: white                                                        │
│  - Border: 1px solid gray-200                                               │
│  - Border-radius: 3px                                                       │
│  - Padding: 1px 4px                                                         │
│  - Margin: 0 2px                                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Search Logic

### Searchable Fields by Type
```typescript
interface SearchableFields {
  url: ['title', 'description', 'url', 'domain', 'tags', 'userNotes'];
  note: ['title', 'content', 'tags'];
  image: ['filename', 'caption', 'aiTags', 'tags'];
  voice: ['title', 'transcription', 'tags'];
  webclip: ['clippedText', 'sourceTitle', 'sourceUrl', 'userNote', 'tags'];
}
```

### Search Implementation
```typescript
interface SearchResult {
  item: InboxItem;
  score: number;           // Relevance score
  matches: SearchMatch[];  // Where the query matched
}

interface SearchMatch {
  field: string;           // Which field matched
  indices: [number, number][]; // Start/end positions of matches
  snippet: string;         // Text snippet with match
}

function searchItems(
  items: InboxItem[],
  query: string,
  options?: SearchOptions
): SearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return [];

  // Check if searching for a tag
  const isTagSearch = normalizedQuery.startsWith('#');
  const searchTerm = isTagSearch
    ? normalizedQuery.slice(1)
    : normalizedQuery;

  const results: SearchResult[] = [];

  for (const item of items) {
    const matches: SearchMatch[] = [];
    let score = 0;

    if (isTagSearch) {
      // Tag-only search
      const tagMatch = item.tags.find(tag =>
        tag.toLowerCase().includes(searchTerm)
      );
      if (tagMatch) {
        matches.push({
          field: 'tags',
          indices: [[0, searchTerm.length]],
          snippet: `#${tagMatch}`,
        });
        score = tagMatch.toLowerCase() === searchTerm ? 100 : 50;
      }
    } else {
      // Full-text search
      const searchableContent = getSearchableContent(item);

      for (const [field, content] of Object.entries(searchableContent)) {
        if (!content) continue;

        const lowerContent = content.toLowerCase();
        const index = lowerContent.indexOf(searchTerm);

        if (index !== -1) {
          // Calculate score based on field importance
          const fieldScore = getFieldScore(field, item.type);
          score += fieldScore;

          // Extract snippet with context
          const snippet = extractSnippet(content, index, searchTerm.length);

          matches.push({
            field,
            indices: [[index, index + searchTerm.length]],
            snippet,
          });
        }
      }
    }

    if (matches.length > 0) {
      results.push({ item, score, matches });
    }
  }

  // Sort by score (highest first), then by date (newest first)
  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime();
  });
}

function getFieldScore(field: string, itemType: ItemType): number {
  const scores: Record<string, number> = {
    title: 100,
    content: 80,
    tags: 70,
    clippedText: 80,
    transcription: 75,
    description: 60,
    filename: 50,
    caption: 50,
    aiTags: 40,
    url: 30,
    domain: 20,
    userNotes: 60,
  };
  return scores[field] || 10;
}

function extractSnippet(
  content: string,
  matchIndex: number,
  matchLength: number,
  contextLength: number = 50
): string {
  const start = Math.max(0, matchIndex - contextLength);
  const end = Math.min(content.length, matchIndex + matchLength + contextLength);

  let snippet = content.slice(start, end);

  // Add ellipsis if truncated
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  return snippet;
}
```

### Autocomplete Suggestions
```typescript
interface SearchSuggestion {
  type: 'query' | 'tag' | 'recent';
  text: string;
  action: string;  // Description like "Search for..." or "Search tag"
}

function getSearchSuggestions(
  query: string,
  recentSearches: string[],
  availableTags: string[]
): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = [];
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    // Show recent searches
    return recentSearches.slice(0, 5).map(search => ({
      type: 'recent',
      text: search,
      action: 'Recent search',
    }));
  }

  // Add exact query suggestion
  suggestions.push({
    type: 'query',
    text: query,
    action: `Search for "${query}"`,
  });

  // Add tag suggestions if query could be a tag
  const matchingTags = availableTags
    .filter(tag => tag.toLowerCase().includes(normalizedQuery))
    .slice(0, 3);

  for (const tag of matchingTags) {
    suggestions.push({
      type: 'tag',
      text: `#${tag}`,
      action: 'Search tag',
    });
  }

  // Add query completion suggestions based on popular/recent
  // (could be enhanced with ML-based suggestions)

  return suggestions.slice(0, 5);
}
```

---

## Keyboard Navigation

### Navigation Flow
```typescript
interface SearchDropdownState {
  isOpen: boolean;
  selectedIndex: number;      // -1 = none, 0+ = index in combined list
  suggestions: SearchSuggestion[];
  results: SearchResult[];
}

function useSearchKeyboardNav(
  inputRef: RefObject<HTMLInputElement>,
  dropdownState: SearchDropdownState,
  onSelect: (index: number) => void,
  onSubmit: () => void,
  onClose: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dropdownState.isOpen) return;

      const totalItems = dropdownState.suggestions.length +
                         dropdownState.results.length +
                         1; // +1 for "See all results"

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          onSelect(Math.min(dropdownState.selectedIndex + 1, totalItems - 1));
          break;

        case 'ArrowUp':
          e.preventDefault();
          onSelect(Math.max(dropdownState.selectedIndex - 1, -1));
          break;

        case 'Enter':
          e.preventDefault();
          if (dropdownState.selectedIndex >= 0) {
            // Select the highlighted item
            handleItemSelect(dropdownState.selectedIndex);
          } else {
            // Submit the search query
            onSubmit();
          }
          break;

        case 'Escape':
          e.preventDefault();
          if (dropdownState.selectedIndex >= 0) {
            // First Escape: clear selection
            onSelect(-1);
          } else {
            // Second Escape: close dropdown
            onClose();
            inputRef.current?.blur();
          }
          break;

        case 'Tab':
          // Close dropdown on Tab (move to next element)
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dropdownState, onSelect, onSubmit, onClose]);
}
```

### Global Keyboard Shortcut
```typescript
// ⌘K or Ctrl+K to focus search
function useSearchHotkey(inputRef: RefObject<HTMLInputElement>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }

      // Also support "/" when not in an input
      if (e.key === '/' &&
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [inputRef]);
}
```

---

## Loading & Empty States

### Loading State (Searching)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ITEMS                                                                │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │  ░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░  │  │  │
│  │  │      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                        │  │  │
│  │  │                                                                 │  │  │
│  │  ├─────────────────────────────────────────────────────────────────┤  │  │
│  │  │                                                                 │  │  │
│  │  │  ░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░  │  │  │
│  │  │      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░                              │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Show skeleton items while searching                                        │
│  Animate with pulse                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### No Results State
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                           🔍                                          │  │
│  │                                                                       │  │
│  │                   No results for "xyzabc"                             │  │
│  │                                                                       │  │
│  │              Try different keywords or check spelling                 │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Icon: Search icon, 32px, gray-300                                          │
│  Title: Font-size 15px, font-weight 500, gray-700                           │
│  Subtitle: Font-size 13px, gray-500                                         │
│  Padding: 32px                                                              │
│  Text-align: center                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### First-Time Empty State
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                           🔍                                          │  │
│  │                                                                       │  │
│  │                   Search your inbox                                   │  │
│  │                                                                       │  │
│  │         Find notes, links, images, voice memos, and clips             │  │
│  │                                                                       │  │
│  │                  Try: "meeting notes" or "#design"                    │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Shown when:                                                                │
│  - Input is focused                                                         │
│  - Input is empty                                                           │
│  - No recent searches                                                       │
│                                                                             │
│  "Try:" suggestions are clickable, insert into input                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Search Debouncing

### Debounce Implementation
```typescript
function useSearch(
  query: string,
  items: InboxItem[],
  debounceMs: number = 200
) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(() => {
      const searchResults = searchItems(items, query);
      setResults(searchResults);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, items, debounceMs]);

  return { results, isSearching };
}
```

### Minimum Query Length
```typescript
const MIN_QUERY_LENGTH = 2;

// Don't search until user types at least 2 characters
// (unless searching for a tag with #)
function shouldSearch(query: string): boolean {
  const trimmed = query.trim();
  if (trimmed.startsWith('#')) {
    return trimmed.length >= 2; // # + at least 1 char
  }
  return trimmed.length >= MIN_QUERY_LENGTH;
}
```

---

## Props Interface
```typescript
interface SearchInputProps {
  // State
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;  // Called when search is submitted
  onClear: () => void;

  // Data for suggestions
  availableTags: string[];
  recentSearches: string[];
  onClearRecentSearches: () => void;
  onRemoveRecentSearch: (search: string) => void;

  // Search results (for dropdown preview)
  searchResults: SearchResult[];
  isSearching: boolean;
  totalResultCount: number;

  // Navigation
  onResultClick: (itemId: string) => void;  // Open item in preview
  onSeeAllResults: () => void;              // Submit search

  // State management
  isActive: boolean;  // Whether a search filter is currently applied
}
```

---

## Recent Searches Management

### Storage Hook
```typescript
const STORAGE_KEY = 'memry-recent-searches';
const MAX_RECENT_SEARCHES = 10;

interface RecentSearch {
  query: string;
  timestamp: number;
  type: 'text' | 'tag';
}

function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const addSearch = useCallback((query: string, type: 'text' | 'tag') => {
    setSearches(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(s => s.query.toLowerCase() !== query.toLowerCase());

      // Add to front
      const updated = [
        { query, timestamp: Date.now(), type },
        ...filtered,
      ].slice(0, MAX_RECENT_SEARCHES);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeSearch = useCallback((query: string) => {
    setSearches(prev => {
      const updated = prev.filter(s => s.query !== query);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    searches,
    addSearch,
    removeSearch,
    clearAll,
  };
}
```

---

## Integration with Filters

### Search + Filter Combination
```typescript
// Search and filters work together (AND logic)
function getVisibleItems(
  items: InboxItem[],
  searchQuery: string,
  filters: FilterState
): InboxItem[] {
  let results = items;

  // Apply filters first
  if (hasActiveFilters(filters)) {
    results = applyFilters(results, filters);
  }

  // Then apply search
  if (searchQuery.trim()) {
    const searchResults = searchItems(results, searchQuery);
    results = searchResults.map(r => r.item);
  }

  return results;
}
```

### Search Within Filtered Results

When filters are active, search only searches within filtered results:
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Context Bar shows:                                                         │
│                                                                             │
│  Inbox · 24 items · Searching "design" in filtered results                  │
│                                                                             │
│  Or:                                                                        │
│                                                                             │
│  Inbox · 24 of 156 items · "design"                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Animation

### Dropdown Animation
```css
@keyframes dropdownEnter {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes dropdownExit {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px) scale(0.98);
  }
}

.search-dropdown {
  animation: dropdownEnter 150ms ease-out;
  transform-origin: top center;
}

.search-dropdown.closing {
  animation: dropdownExit 100ms ease-in forwards;
}
```

### Selection Animation
```css
/* Highlight selected item smoothly */
.search-result-item {
  transition: background-color 100ms ease;
}

.search-result-item.selected {
  background-color: rgb(249 250 251); /* gray-50 */
}

.search-result-item.selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: rgb(59 130 246); /* blue-500 */
}
```

---

## Accessibility

### ARIA Attributes
```html
<div class="search-container">
  <label for="search-input" class="sr-only">Search your inbox</label>

  <div class="search-input-wrapper" role="combobox" aria-expanded={isOpen} aria-haspopup="listbox">
    <input
      id="search-input"
      type="search"
      role="searchbox"
      aria-autocomplete="list"
      aria-controls="search-dropdown"
      aria-activedescendant={selectedIndex >= 0 ? `search-item-${selectedIndex}` : undefined}
      placeholder="Search your inbox..."
    />
  </div>

  <div
    id="search-dropdown"
    role="listbox"
    aria-label="Search suggestions and results"
  >
    <div role="group" aria-label="Suggestions">
      {suggestions.map((suggestion, index) => (
        <div
          id={`search-item-${index}`}
          role="option"
          aria-selected={selectedIndex === index}
        >
          {suggestion.text}
        </div>
      ))}
    </div>

    <div role="group" aria-label="Matching items">
      {results.map((result, index) => (
        <div
          id={`search-item-${suggestions.length + index}`}
          role="option"
          aria-selected={selectedIndex === suggestions.length + index}
        >
          {result.item.title}
        </div>
      ))}
    </div>
  </div>
</div>
```

### Screen Reader Announcements
```typescript
// Announce result count when search completes
function useSearchAnnouncement(
  results: SearchResult[],
  isSearching: boolean,
  query: string
) {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!isSearching && query) {
      const count = results.length;
      setAnnouncement(
        count === 0
          ? `No results found for "${query}"`
          : `${count} result${count === 1 ? '' : 's'} found for "${query}"`
      );
    }
  }, [results, isSearching, query]);

  return (
    <div role="status" aria-live="polite" className="sr-only">
      {announcement}
    </div>
  );
}
```

---

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| < 640px | Search icon only (expands to full input on click). Dropdown is full-width. |
| 640px - 1024px | Standard input (max-width: 400px). Standard dropdown. |
| > 1024px | Full width input (max-width: 560px). Standard dropdown (max-width: 600px). |

### Mobile Search Expansion
┌─────────────────────────────────────────┐
│                                         │
│  DEFAULT (collapsed):                   │
│                                         │
│  ┌──────────┐           ┌──────┐ ┌────┐ │
│  │  ☰ Memry │           │  🔍  │ │ ▼ │ │
│  └──────────┘           └──────┘ └────┘ │
│                             ▲           │
│                             │           │
│                       Search icon       │
│                       button only       │
│                                         │
│  EXPANDED (on click):                   │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  ←  🔍  Search...           ✕  │    │
│  │  ▲                           ▲ │    │
│  │  │                           │ │    │
│  │ Back                      Clear│    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │     Full-width dropdown         │    │
│  │     (Same content)              │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
Mobile expansion:

Search icon is a button that expands
Expanded state: Full-width overlay
Back arrow returns to normal header
Input auto-focuses when expanded
Dropdown appears below input


---

## Verification Checklist

After building, verify:
☐ Search input displays in Header Bar
☐ Placeholder shows "Search your inbox..."
☐ ⌘K badge visible when not focused
☐ ⌘K (or Ctrl+K) focuses the input
☐ "/" key focuses the input (when not in another input)
☐ Input focus shows focus ring
☐ Clear button appears when input has content
☐ Clear button clears input and keeps focus
☐ Dropdown appears on focus
☐ Recent searches show when input is empty
☐ Recent searches can be removed individually
☐ "Clear" removes all recent searches
☐ Typing shows autocomplete suggestions
☐ Tag suggestions appear when query matches tags
☐ Item results appear with highlighted matches
☐ "See all X results" link appears when more results exist
☐ Arrow keys navigate dropdown items
☐ Enter on suggestion applies it
☐ Enter on item opens preview
☐ Enter with no selection submits search
☐ Escape clears selection, then closes dropdown
☐ Clicking outside closes dropdown
☐ Search is debounced (no flicker)
☐ Loading state shows while searching
☐ "No results" state shows when nothing matches
☐ Active search state shows blue styling
☐ Search works with active filters
☐ Recent searches save to localStorage
☐ Mobile expansion works
☐ Screen reader announcements work

## Output

Create a React component called SearchInput that accepts the props defined above, plus supporting hooks for search logic (useSearch), recent searches (useRecentSearches), and keyboard navigation (useSearchKeyboardNav). Use Tailwind CSS for styling.

The component should:
1. Render the search input with all states
2. Display the dropdown with suggestions and results
3. Handle keyboard navigation throughout
4. Support the ⌘K global shortcut
5. Highlight matching terms in results
6. Manage recent searches in localStorage
7. Integrate with the filter system

Also create a SearchDropdown sub-component and SearchResultItem sub-component for modularity.

Implementation Notes
Key Techniques Used:
TechniqueWhyDebounced searchPrevents excessive computation while typingKeyboard navigationPower users expect full keyboard supportRecent searchesUsers often repeat searches; speeds up workflowMatch highlightingShows users why results matchedGlobal shortcut (⌘K)Standard pattern in modern apps
Design Choices:

Search + filter combination — Filters narrow down first, then search within filtered results. More intuitive than trying to search everything then filter.
Dropdown preview of results — Shows top matches immediately without full-page search. Users can click directly into items.
Tag-aware search — #design searches tags specifically. Power users appreciate this precision.
Recent searches visible immediately — When focused with empty input, show recent searches. Quick access to repeat searches.
Highlighted matches — Yellow highlight shows exactly what matched. Helps users evaluate relevance quickly.
⌘K global shortcut — Standard in Notion, Linear, Slack, etc. Users expect it.


Expected Output Structure
jsx// SearchInput.tsx
<div className="search-container" ref={containerRef}>
  <div className={`search-input-wrapper ${isActive ? 'active' : ''} ${isFocused ? 'focused' : ''}`}>
    <SearchIcon className="search-icon" />

    <input
      ref={inputRef}
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onKeyDown={handleKeyDown}
      placeholder="Search your inbox..."
    />

    {!isFocused && !value && (
      <kbd className="shortcut-badge">⌘K</kbd>
    )}

    {value && (
      <button className="clear-btn" onClick={handleClear}>
        <XIcon />
      </button>
    )}
  </div>

  {isFocused && (
    <SearchDropdown
      query={value}
      suggestions={suggestions}
      results={searchResults}
      recentSearches={recentSearches}
      isSearching={isSearching}
      selectedIndex={selectedIndex}
      onSuggestionClick={handleSuggestionClick}
      onResultClick={onResultClick}
      onRecentSearchClick={handleRecentSearchClick}
      onRemoveRecentSearch={onRemoveRecentSearch}
      onClearRecentSearches={onClearRecentSearches}
      onSeeAllResults={handleSeeAllResults}
    />
  )}
</div>

// SearchDropdown.tsx
<div className="search-dropdown">
  {/* Suggestions Section */}
  {suggestions.length > 0 && (
    <section className="dropdown-section">
      <h3 className="section-header">Suggestions</h3>
      {suggestions.map((suggestion, index) => (
        <SearchSuggestionItem
          key={suggestion.text}
          {...suggestion}
          isSelected={selectedIndex === index}
          onClick={() => onSuggestionClick(suggestion)}
        />
      ))}
    </section>
  )}

  {/* Recent Searches Section */}
  {!query && recentSearches.length > 0 && (
    <section className="dropdown-section">
      <div className="section-header">
        <h3>Recent Searches</h3>
        <button onClick={onClearRecentSearches}>Clear</button>
      </div>
      {recentSearches.map((search, index) => (
        <RecentSearchItem
          key={search.query}
          {...search}
          isSelected={selectedIndex === index}
          onClick={() => onRecentSearchClick(search.query)}
          onRemove={() => onRemoveRecentSearch(search.query)}
        />
      ))}
    </section>
  )}

  {/* Results Section */}
  {query && (
    <section className="dropdown-section">
      <div className="section-header">
        <h3>Items</h3>
        {results.length > 0 && <span>{results.length} results</span>}
      </div>

      {isSearching ? (
        <SearchResultsSkeleton />
      ) : results.length === 0 ? (
        <NoResultsState query={query} />
      ) : (
        <>
          {results.slice(0, 5).map((result, index) => (
            <SearchResultItem
              key={result.item.id}
              result={result}
              isSelected={selectedIndex === suggestions.length + index}
              onClick={() => onResultClick(result.item.id)}
            />
          ))}
          {results.length > 5 && (
            <button className="see-all-btn" onClick={onSeeAllResults}>
              See all {results.length} results →
            </button>
          )}
        </>
      )}
    </section>
  )}

  {/* Keyboard Hints */}
  <footer className="dropdown-footer">
    <span><kbd>↵</kbd> to search</span>
    <span><kbd>↑↓</kbd> to navigate</span>
    <span><kbd>esc</kbd> to close</span>
  </footer>
</div>

Usage Guidelines

Test keyboard shortcuts — ⌘K, /, arrows, Enter, Escape
Test suggestions — Type partial tag names, verify suggestions appear
Test result highlighting — Verify matching text is highlighted yellow
Test recent searches — Search, then focus empty input, verify recent shows
Test with filters — Apply filters, then search, verify search is within filtered results
Test debouncing — Type quickly, verify no flicker or excessive updates
Test empty/no results states — Search for gibberish, verify "no results" message
Test mobile expansion — On narrow viewport, verify icon expands to full input