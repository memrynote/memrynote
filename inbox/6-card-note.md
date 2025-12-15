Prompt #6: Card — Note
The Prompt
You are building the Note Card component for Memry's inbox. This is a reusable card that displays text notes with automatic detection of special content types (checklists, code blocks). The card will be used in both Grid View (masonry) and List View (timeline).

## What You Are Building

A content card that displays a user's text note with title (if present), content preview, detected content type indicator, and tags. The card automatically adapts its layout based on the view context (grid vs list) and content type.

## Card Variants

This component has TWO layout variants controlled by a `variant` prop:

1. **Grid Variant** — Vertical card for masonry layout (variable height)
2. **List Variant** — Horizontal row for timeline layout

Additionally, notes have THREE content sub-types that affect rendering:

1. **Plain Text** — Default note with paragraphs
2. **Checklist** — Note containing checkbox items
3. **Code** — Note containing code blocks

---

## VARIANT 1: Grid Card (Masonry)

### Plain Text Note

┌─────────────────────────────────────────┐
│                                         │
│  Meeting notes from standup             │  ← Title (if first line is short)
│  ═══════════════════════════            │     Or first line of content
│                                         │
│  Discussed the new feature roadmap      │
│  and timeline for Q1 launch.            │
│                                         │  ← Content preview
│  Key decisions were made about          │     Auto-height based on content
│  prioritization and resource            │     Max ~6 lines before fade
│  allocation for the next sprint...      │
│                                         │
│  ───────────────────────────────────    │  ← Divider
│                                         │
│  ┌────────┐ ┌──────────┐                │
│  │ #work  │ │ #standup │       3h ago   │  ← Tags + Timestamp
│  └────────┘ └──────────┘                │
│                                         │
└─────────────────────────────────────────┘

### Checklist Note

┌─────────────────────────────────────────┐
│                                         │
│  ☑️  Shopping list                       │  ← Checkbox icon indicates type
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ☐  Milk                         │    │
│  │ ☐  Eggs                         │    │  ← Checklist preview
│  │ ☐  Bread                        │    │     Shows first 4-5 items
│  │ ☑  Butter                       │    │     Checked items styled
│  │                                 │    │
│  │ +3 more items                   │    │  ← Overflow indicator
│  └─────────────────────────────────┘    │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ┌───────────┐                          │
│  │ #personal │              1d ago      │
│  └───────────┘                          │
│                                         │
└─────────────────────────────────────────┘

### Code Note

┌─────────────────────────────────────────┐
│                                         │
│  </>  API response handler              │  ← Code icon indicates type
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │ const handleResponse = (data)   │    │  ← Code block preview
│  │   => {                          │    │     Monospace font
│  │   if (data.error) {             │    │     Syntax highlighting (optional)
│  │     throw new Error(data.msg);  │    │     Dark or light theme
│  │   }                             │    │
│  │   ...                           │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ┌───────┐ ┌──────────────┐             │
│  │ #dev  │ │ #javascript  │    2d ago   │
│  └───────┘ └──────────────┘             │
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
- Min-height: 120px
- Max-height: 320px (content fades at bottom if exceeded)

### Header Section (Title Row)

┌─────────────────────────────────────────┐
│                                         │
│  [icon]  Title or First Line            │
│                                         │
│  ▲       ▲                              │
│  │       │                              │
│  Type    Title text                     │
│  icon    16px, semibold, gray-900       │
│  (opt)                                  │
│                                         │
└─────────────────────────────────────────┘

**Type Indicator Icons:**

| Content Type | Icon | Color |
|--------------|------|-------|
| Plain text | 📝 (document) | gray-500 |
| Checklist | ☑️ (checkbox-checked) | green-600 |
| Code | </> (code brackets) | purple-600 |

**Icon Placement:**
- Size: 16px × 16px
- Position: Inline before title
- Gap: 8px from title text
- Only shown for Checklist and Code types
- Plain text notes: No icon (cleaner look)

**Title Text:**
- Font-size: 16px
- Font-weight: 600 (semibold)
- Color: gray-900
- Line-height: 1.4
- Max lines: 2 (line-clamp-2)
- Margin-bottom: 12px

**Title Detection Logic:**
If first line of content:

Is ≤ 60 characters AND
Doesn't end with punctuation (. , ; :) AND
Is followed by a blank line or more content
Then:
Use first line as title
Show remaining content as body
Else:
No separate title
Show all content as body


### Content Section

**Plain Text Content:**
┌─────────────────────────────────────────┐
│                                         │
│  Content text that flows naturally      │
│  across multiple lines. The text        │
│  should feel readable and not cramped.  │
│                                         │
│  Font-size: 14px                        │
│  Line-height: 1.6                       │
│  Color: gray-700                        │
│  Max lines: 6 (with fade gradient)      │
│                                         │
└─────────────────────────────────────────┘

- Font-size: 14px
- Line-height: 1.6 (comfortable reading)
- Color: gray-700
- Max visible: ~6 lines
- Overflow: Fade gradient at bottom (white to transparent)

**Checklist Content:**
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  ☐  Unchecked item              │    │  ← Unchecked: gray-700 text
│  │  ☐  Another unchecked           │    │
│  │  ☑  Checked item                │    │  ← Checked: line-through, gray-400
│  │  ☐  Third item                  │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  +3 more items                          │  ← Overflow count
│                                         │
└─────────────────────────────────────────┘

- Container: bg-gray-50, rounded-lg, padding: 12px
- Each item: flex row, items-start, gap: 8px
- Checkbox icon: 16px × 16px
  - Unchecked: ☐ border-gray-300, bg-white
  - Checked: ☑ bg-green-600, white checkmark
- Item text: 14px
  - Unchecked: color gray-700
  - Checked: color gray-400, text-decoration: line-through
- Max visible items: 5
- Overflow text: "+" + remaining count + " more items"
  - Font-size: 13px, color: gray-500
  - Margin-top: 8px

**Code Content:**
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ // filename.js            ───── │    │  ← Optional language badge
│  │                                 │    │
│  │ const data = fetch(url);        │    │  ← Monospace code
│  │ const json = await data.json(); │    │     Horizontal scroll if long
│  │                                 │    │
│  │ if (json.error) {               │    │
│  │   console.error(json);          │    │
│  │ }                               │    │
│  │ ...                             │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘

- Container:
  - Background: gray-900 (dark theme) OR gray-50 (light theme)
  - Border-radius: 8px
  - Padding: 12px
  - Overflow-x: auto (horizontal scroll for long lines)
- Code text:
  - Font-family: monospace (SF Mono, Menlo, Monaco, Consolas)
  - Font-size: 13px
  - Line-height: 1.5
  - Color: gray-100 (dark) OR gray-800 (light)
- Language badge (optional):
  - Position: top-right inside container
  - Font-size: 11px
  - Color: gray-500
  - Text: detected language (js, py, etc.)
- Max visible lines: 8
- Overflow indicator: "..." on last visible line

### Footer Section

┌─────────────────────────────────────────┐
│                                         │
│  ───────────────────────────────────    │  ← Divider: 1px gray-100
│                                         │     Margin: 12px 0
│  TAGS                        TIMESTAMP  │
│  ────                        ─────────  │
│  ┌────────┐ ┌────────┐                  │
│  │ #work  │ │ +2     │       3h ago     │
│  └────────┘ └────────┘                  │
│                                         │
│  Flex, space-between, items-center      │
│                                         │
└─────────────────────────────────────────┘

- Divider: 1px solid gray-100, margin: 12px 0
- Container: flex, justify-between, items-center
- Tags: Same style as URL card (max 2 + overflow)
- Timestamp: 12px, gray-400

---

## VARIANT 2: List Card (Timeline)

### Plain Text Note (List)

┌────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                    │
│  ┌────┐  ┌────┐                                                                    │
│  │    │  │ 📝 │  Meeting notes from standup                          3 hours ago  │
│  │ ☐  │  │icon│  #work · #standup                                                  │
│  │    │  │    │  "Discussed the new feature roadmap and timeline..."              │
│  └────┘  └────┘                                                                    │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘

### Checklist Note (List)

┌────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                    │
│  ┌────┐  ┌────┐                                                                    │
│  │    │  │ ☑️ │  Shopping list                                      1 day ago     │
│  │ ☐  │  │icon│  #personal · 4/7 completed                                         │
│  │    │  │    │  ☐ Milk, ☐ Eggs, ☑ Butter...                                      │
│  └────┘  └────┘                                                                    │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘

### Code Note (List)

┌────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                    │
│  ┌────┐  ┌────┐                                                                    │
│  │    │  │</>│  API response handler                                2 days ago    │
│  │ ☐  │  │icon│  #dev · #javascript                                                │
│  │    │  │    │  const handleResponse = (data) => { if (data.error)...            │
│  └────┘  └────┘                                                                    │
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
- Opacity: 0 by default, 1 on hover or when selected
- Checkbox: 18px × 18px

**Type Icon Column:**
- Width: 32px, Height: 32px
- Border-radius: 8px
- Display: flex, items-center, justify-center
- Icon: 16px

| Content Type | Background | Icon Color |
|--------------|------------|------------|
| Plain text | gray-100 | gray-600 |
| Checklist | green-50 | green-600 |
| Code | purple-50 | purple-600 |

**Content Column:**

*Row 1 — Title + Time:*
- Title: 14px, font-weight: 500, gray-900, line-clamp-1
- Time: 12px, gray-400, nowrap

*Row 2 — Tags + Meta:*
- Font-size: 13px, gray-500
- Tags inline (max 2)
- For checklists: Show progress "4/7 completed"
- For code: Show language if detected

*Row 3 — Content Preview:*
- Font-size: 13px, gray-400
- Line-clamp: 1
- For code: Use monospace font
- For checklists: Inline preview "☐ Item, ☐ Item, ☑ Item..."

---

## Content Type Detection

Implement automatic detection of note content type:
```typescript
function detectContentType(content: string): "text" | "checklist" | "code" {
  // Check for checklist patterns
  const checklistPatterns = [
    /^[\s]*[-*]\s*\[[ x]\]/gm,     // - [ ] or - [x] or * [ ]
    /^[\s]*☐|☑|✓|✗/gm,             // Unicode checkboxes
    /^[\s]*\d+\.\s*\[[ x]\]/gm     // 1. [ ] numbered lists
  ];

  for (const pattern of checklistPatterns) {
    if (pattern.test(content)) {
      return "checklist";
    }
  }

  // Check for code patterns
  const codePatterns = [
    /```[\s\S]*```/,                    // Fenced code blocks
    /^(const|let|var|function|import|export|class|def|public|private)/m,
    /[{};]\s*$/m,                        // Lines ending with { } ;
    /^\s{2,}(if|for|while|return)/m     // Indented control structures
  ];

  for (const pattern of codePatterns) {
    if (pattern.test(content)) {
      return "code";
    }
  }

  return "text";
}
```

---

## Card States

### Interaction States

| State | Grid Appearance | List Appearance |
|-------|-----------------|-----------------|
| Default | White bg, subtle border | White bg, bottom border |
| Hover | Shadow increase, translateY(-2px) | bg-gray-50, checkbox visible |
| Selected | bg-blue-50, border-blue-200 | bg-blue-50, checkbox checked |
| Focused | ring-2 ring-blue-500 | ring-2 ring-blue-500 |

### Hover Actions (Grid)

Same pattern as URL card — overlay with quick actions:

┌─────────────────────────────────────────┐
│                                         │
│  Meeting notes from standup    ┌───┐    │
│                                │ ⋮ │    │  ← More button (top-right)
│  Discussed the new feature     └───┘    │
│  roadmap and timeline for Q1...         │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  📁 Move  │  🏷️ Tag  │  🗑️ Del  │   │  ← Action bar (bottom)
│  └──────────────────────────────────┘   │
│                                         │
│  ───────────────────────────────────    │
│  #work  #standup            3h ago      │
└─────────────────────────────────────────┘

**Hover Overlay:**
- No dark gradient (unlike URL card with image)
- Action bar: position absolute, bottom: 52px (above footer)
- Background: white, border: 1px solid gray-200, rounded-lg
- Shadow: 0 2px 8px rgba(0,0,0,0.1)

### Hover Actions (List)

Same as URL card — actions appear on right side before timestamp.

---

## Data Structure
```typescript
interface NoteCardData {
  id: string;
  type: "note";

  // Content
  content: string;              // Raw content (may include markdown)
  contentType: "text" | "checklist" | "code";  // Auto-detected or user-set

  // Parsed content (computed)
  title?: string;               // Extracted first line if applicable
  body: string;                 // Remaining content after title

  // For checklists
  checklistItems?: {
    text: string;
    checked: boolean;
  }[];
  checklistProgress?: {
    completed: number;
    total: number;
  };

  // For code
  codeLanguage?: string;        // Detected or specified language

  // User data
  tags: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // States
  isArchived?: boolean;
}
```

## Props Interface
```typescript
interface NoteCardProps {
  // Data
  data: NoteCardData;

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
}
```

## Checklist Rendering

Parse and render checklist items:
```typescript
function parseChecklist(content: string): ChecklistItem[] {
  const lines = content.split('\n');
  const items: ChecklistItem[] = [];

  for (const line of lines) {
    // Match various checkbox formats
    const uncheckedMatch = line.match(/^[\s]*[-*]\s*\[[ ]\]\s*(.+)$/);
    const checkedMatch = line.match(/^[\s]*[-*]\s*\[[xX]\]\s*(.+)$/);
    const unicodeUnchecked = line.match(/^[\s]*☐\s*(.+)$/);
    const unicodeChecked = line.match(/^[\s]*(☑|✓)\s*(.+)$/);

    if (uncheckedMatch) {
      items.push({ text: uncheckedMatch[1], checked: false });
    } else if (checkedMatch) {
      items.push({ text: checkedMatch[1], checked: true });
    } else if (unicodeUnchecked) {
      items.push({ text: unicodeUnchecked[1], checked: false });
    } else if (unicodeChecked) {
      items.push({ text: unicodeChecked[2], checked: true });
    }
  }

  return items;
}
```

## Code Language Detection (Simple)
```typescript
function detectCodeLanguage(content: string): string | undefined {
  // Check for fenced code block with language
  const fencedMatch = content.match(/```(\w+)/);
  if (fencedMatch) return fencedMatch[1];

  // Simple keyword-based detection
  if (/\b(const|let|=>|async|await)\b/.test(content)) return 'javascript';
  if (/\b(def|import|from|self)\b/.test(content)) return 'python';
  if (/\b(func|package|import)\b/.test(content)) return 'go';
  if (/\b(<\?php|\$[a-zA-Z]|->)\b/.test(content)) return 'php';
  if (/<[a-z]+[^>]*>/i.test(content)) return 'html';

  return undefined;
}
```

## Loading State (Skeleton)

**Grid Skeleton:**
┌─────────────────────────────────────────┐
│                                         │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░           │  ← Title skeleton
│                                         │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      │  ← Content skeleton
│  ░░░░░░░░░░░░░░░░░░░░░░░░             │     3-4 lines
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ░░░░░░  ░░░░░░             ░░░░░░░░   │  ← Tags + time skeleton
│                                         │
└─────────────────────────────────────────┘

**List Skeleton:**
┌────────────────────────────────────────────────────────────────────────────────────┐
│  ░░  ░░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░░░░░  │
│            ░░░░░░░  ░░░░░░░                                                       │
│            ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                                      │
└────────────────────────────────────────────────────────────────────────────────────┘

## Empty Note State

When note has no content (edge case):

┌─────────────────────────────────────────┐
│                                         │
│  📝  Empty note                         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │   This note has no content.    │    │  ← Placeholder message
│  │   Click to add something.       │    │     Gray, italic
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ───────────────────────────────────    │
│  No tags                    Just now    │
└─────────────────────────────────────────┘

- Message: "This note has no content."
- Subtext: "Click to add something."
- Font-style: italic
- Color: gray-400
- Background: gray-50, dashed border

## Accessibility Requirements

- Card container: role="article", aria-labelledby pointing to title
- Checkbox (selection): aria-label="Select note: {title or first line}"
- Content type icon: aria-hidden="true" (decorative)
- Checklist items: role="list" with role="listitem" children
- Code block: Include language in aria-label if detected
- All interactive elements: Visible focus states

## Verification Checklist

After building, verify:
☐ Grid variant displays correctly for all 3 content types
☐ List variant displays correctly for all 3 content types
☐ Content type is auto-detected correctly
☐ Checklist items render with checkboxes (checked/unchecked styling)
☐ Checklist shows overflow count when > 5 items
☐ Checklist progress shows in list variant ("4/7 completed")
☐ Code blocks use monospace font
☐ Code blocks show language badge when detected
☐ Title extraction logic works correctly
☐ Long content fades at bottom (grid) or truncates (list)
☐ Hover states work correctly
☐ Selection state shows blue styling
☐ Quick actions appear on hover
☐ Empty note state displays correctly
☐ Loading skeleton animates

## Output

Create a React component called NoteCard that accepts the props defined above. Use Tailwind CSS for styling. Include helper functions for content type detection, checklist parsing, and code language detection. The component should render different layouts based on the `variant` prop and different content presentations based on detected content type.

Implementation Notes
Key Techniques Used:
TechniqueWhyContent type detection logicProvides concrete implementation, not vague descriptionThree sub-variantsNotes are diverse; handling each type provides good UXChecklist parsing regexMultiple formats exist; supporting all prevents frustrationCode language detectionSmall detail that adds polish and professionalismVariable height guidanceNotes vary in length; grid needs to handle gracefully
Design Choices:

No type icon for plain text — Most notes are plain text; icon would be noise. Only show icons for special types (checklist, code) where they add value.
Checklist container with background — Visual grouping makes checkbox items feel organized. Gray-50 background separates checklist from surrounding content.
Code dark theme option — Many developers prefer dark code blocks. Offering both themes supports different preferences (can be user setting later).
Inline checklist preview (list view) — Space is tight in list view; showing "☐ Item, ☐ Item, ☑ Item..." gives quick glance at checklist without expanding.
Progress indicator for checklists — "4/7 completed" tells user list status at a glance. Useful for shopping lists, task lists, etc.


Expected Output Structure
jsx// Grid variant - Plain text
<article className="note-card note-card--grid note-card--text">
  <div className="card-header">
    <h3 className="title">{title}</h3>
  </div>

  <div className="card-content">
    <p className="body-text">{body}</p>
    <div className="fade-overlay" />
  </div>

  <div className="card-footer">
    <div className="tags">{renderTags()}</div>
    <span className="timestamp">{formatRelativeTime(createdAt)}</span>
  </div>

  <div className="hover-actions">...</div>
</article>

// Grid variant - Checklist
<article className="note-card note-card--grid note-card--checklist">
  <div className="card-header">
    <CheckboxCheckedIcon className="type-icon" />
    <h3 className="title">{title}</h3>
  </div>

  <div className="card-content">
    <ul className="checklist">
      {visibleItems.map(item => (
        <li className={item.checked ? 'checked' : ''}>
          {item.checked ? <CheckedIcon /> : <UncheckedIcon />}
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
    {overflowCount > 0 && (
      <span className="overflow">+{overflowCount} more items</span>
    )}
  </div>

  <div className="card-footer">...</div>
</article>

// Grid variant - Code
<article className="note-card note-card--grid note-card--code">
  <div className="card-header">
    <CodeIcon className="type-icon" />
    <h3 className="title">{title}</h3>
  </div>

  <div className="card-content">
    <div className="code-block">
      {codeLanguage && <span className="language-badge">{codeLanguage}</span>}
      <pre><code>{codeContent}</code></pre>
    </div>
  </div>

  <div className="card-footer">...</div>
</article>

Usage Guidelines

Test all content types — Create notes with plain text, markdown checklists, and code to verify detection
Test checklist formats — Try - [ ], - [x], ☐, ☑ to verify all are parsed
Test code detection — Paste JavaScript, Python, HTML to verify language detection
Test title extraction — Notes with short first lines should show title; long first lines should not
Test overflow — Create checklists with 10+ items to verify overflow count