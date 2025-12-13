Prompt #14: Preview — URL & Note
The Prompt
You are building the URL Preview and Note Preview components for Memry's inbox. These content-specific components render inside the PreviewPanelShell and provide detailed viewing and editing capabilities for URL/Link and Note item types.

## What You Are Building

Two preview components:
1. **UrlPreview** — Displays saved links with full metadata, AI summary, editable tags, and personal notes
2. **NotePreview** — Full inline editor for notes with formatting toolbar, auto-save, and checklist support

Both components render as children of PreviewPanelShell, filling its content area.

---

# PART 1: URL PREVIEW

## URL Preview Layout
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                       PREVIEW IMAGE                                   │  │
│  │                       (og:image)                                      │  │
│  │                                                                       │  │
│  │                       Height: 240px                                   │  │
│  │                       Width: 100%                                     │  │
│  │                       Object-fit: cover                               │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  URL FIELD                                                            │  │
│  │  ─────────                                                            │  │
│  │  https://example.com/article/design-tips-2024          [ 📋 Copy ]    │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  META DESCRIPTION                                                     │  │
│  │  ────────────────                                                     │  │
│  │  "A comprehensive guide to modern design principles and practices    │  │
│  │  that will help you create better user experiences in 2024."         │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ✨ AI SUMMARY (collapsible)                                    ▾     │  │
│  │  ────────────────────────────                                         │  │
│  │                                                                       │  │
│  │  This article covers key design principles including visual           │  │
│  │  hierarchy, color theory, and user-centered design methodologies.     │  │
│  │  The author emphasizes the importance of accessibility and            │  │
│  │  provides practical examples from leading tech companies.             │  │
│  │                                                                       │  │
│  │  Key points:                                                          │  │
│  │  • Visual hierarchy guides user attention                             │  │
│  │  • Color choices impact emotional response                            │  │
│  │  • Testing with real users is essential                               │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  TAGS                                                                 │  │
│  │  ────                                                                 │  │
│  │  ┌─────────┐ ┌─────────┐ ┌────────────┐ ┌─────────┐                  │  │
│  │  │ #design │ │ #ux     │ │ #research  │ │  + Add  │                  │  │
│  │  └─────────┘ └─────────┘ └────────────┘ └─────────┘                  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  YOUR NOTES                                                           │  │
│  │  ──────────                                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │  Great resource for the design system project.                  │  │  │
│  │  │  Especially the section on color theory.                        │  │  │
│  │  │                                                                 │  │  │
│  │  │  Placeholder: Add your personal notes...                        │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  Auto-saved · Last edited 2 hours ago                                │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  METADATA                                                             │  │
│  │  ────────                                                             │  │
│  │  Saved: Dec 13, 2024 at 2:30 PM                                       │  │
│  │  Last visited: Dec 13, 2024 at 4:15 PM                                │  │
│  │  Source: Chrome Extension                                             │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## URL Preview Sections

### Preview Image Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                    PREVIEW IMAGE                                      │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Container:                                                                 │
│  - Width: 100%                                                              │
│  - Height: 240px                                                            │
│  - Background: gray-100                                                     │
│  - Overflow: hidden                                                         │
│  - Border-radius: 0 (bleeds to edges if at top)                             │
│                                                                             │
│  Image:                                                                     │
│  - Object-fit: cover                                                        │
│  - Object-position: center                                                  │
│  - Width: 100%                                                              │
│  - Height: 100%                                                             │
│                                                                             │
│  Hover: Show zoom icon overlay for lightbox                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

**Fallback (No Image):**
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                                                                       │
│               ┌────────────────────────────┐                          │
│               │                            │                          │
│               │     🌐                     │                          │
│               │     64px favicon           │   Gradient background    │
│               │     or globe icon          │   gray-100 → gray-200    │
│               │                            │                          │
│               └────────────────────────────┘                          │
│                                                                       │
│                       example.com                                     │
│                       Domain text below                               │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

### URL Field Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  SECTION LABEL                                                              │
│  "URL"                                                                      │
│  Font-size: 11px                                                            │
│  Font-weight: 600                                                           │
│  Color: gray-500                                                            │
│  Text-transform: uppercase                                                  │
│  Letter-spacing: 0.05em                                                     │
│  Margin-bottom: 8px                                                         │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  🔗  https://example.com/article/design-tips-2024      [ 📋 Copy ]    │  │
│  │  ──  ──────────────────────────────────────────────    ───────────    │  │
│  │  icon URL text (truncatable)                           Copy button    │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Container:                                                                 │
│  - Background: gray-50                                                      │
│  - Border: 1px solid gray-200                                               │
│  - Border-radius: 8px                                                       │
│  - Padding: 12px 14px                                                       │
│  - Display: flex                                                            │
│  - Align-items: center                                                      │
│  - Gap: 10px                                                                │
│                                                                             │
│  Link icon: 16px, gray-400                                                  │
│                                                                             │
│  URL text:                                                                  │
│  - Flex: 1                                                                  │
│  - Font-size: 14px                                                          │
│  - Color: gray-700                                                          │
│  - Font-family: monospace                                                   │
│  - White-space: nowrap                                                      │
│  - Overflow: hidden                                                         │
│  - Text-overflow: ellipsis                                                  │
│                                                                             │
│  Copy button:                                                               │
│  - Height: 32px                                                             │
│  - Padding: 0 12px                                                          │
│  - Background: white                                                        │
│  - Border: 1px solid gray-200                                               │
│  - Border-radius: 6px                                                       │
│  - Font-size: 13px                                                          │
│  - Color: gray-600                                                          │
│  - Icon: 📋 clipboard, 14px                                                 │
│  - Hover: bg-gray-50                                                        │
│  - After click: Shows "Copied!" for 2s, icon changes to ✓                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Meta Description Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  DESCRIPTION                                                                │
│  ───────────                                                                │
│                                                                             │
│  "A comprehensive guide to modern design principles and practices           │
│  that will help you create better user experiences in 2024."                │
│                                                                             │
│  Container:                                                                 │
│  - Padding: 16px 0                                                          │
│  - Border-bottom: 1px solid gray-100 (optional divider)                     │
│                                                                             │
│  Text:                                                                      │
│  - Font-size: 15px                                                          │
│  - Line-height: 1.6                                                         │
│  - Color: gray-700                                                          │
│                                                                             │
│  If no description: Show "No description available" in gray-400 italic      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### AI Summary Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ✨ AI Summary                                               [ ▾ ]    │  │
│  │  ────────────                                                         │  │
│  │  Header row with collapse toggle                                      │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Header:                                                                    │
│  - Display: flex, justify-between, align-center                             │
│  - Cursor: pointer (entire header clickable)                                │
│  - Padding: 12px 16px                                                       │
│  - Background: purple-50                                                    │
│  - Border: 1px solid purple-100                                             │
│  - Border-radius: 10px 10px 0 0 (when expanded)                             │
│  - Border-radius: 10px (when collapsed)                                     │
│                                                                             │
│  Sparkle icon: 16px, purple-600                                             │
│  Label: "AI Summary", 14px, font-weight: 500, purple-700                    │
│  Toggle: Chevron, 16px, purple-400, rotates -180° when collapsed            │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  This article covers key design principles including visual           │  │
│  │  hierarchy, color theory, and user-centered design methodologies.     │  │
│  │                                                                       │  │
│  │  Key points:                                                          │  │
│  │  • Visual hierarchy guides user attention                             │  │
│  │  • Color choices impact emotional response                            │  │
│  │  • Testing with real users is essential                               │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Content (when expanded):                                                   │
│  - Padding: 16px                                                            │
│  - Background: white                                                        │
│  - Border: 1px solid purple-100                                             │
│  - Border-top: none                                                         │
│  - Border-radius: 0 0 10px 10px                                             │
│  - Font-size: 14px                                                          │
│  - Line-height: 1.6                                                         │
│  - Color: gray-700                                                          │
│                                                                             │
│  Animation: Slide down/up with opacity fade, 200ms                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

**AI Summary States:**

| State | Appearance |
|-------|------------|
| Loading | Pulsing skeleton lines in content area |
| Available | Shows summary content |
| Not available | Section hidden entirely |
| Error | "Unable to generate summary" with retry button |
| Generating | "Generating summary..." with spinner |

**Generate Button (if not auto-generated):**
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                                                                 │  │
│  │  ✨ AI Summary                                                  │  │
│  │                                                                 │  │
│  │       [ ✨ Generate Summary ]                                   │  │
│  │                                                                 │  │
│  │       Click to analyze this article with AI                     │  │
│  │                                                                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  Button: Ghost style with purple accent                               │
│  Subtext: 13px, gray-500, centered                                    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

### Tags Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  TAGS                                                                       │
│  ────                                                                       │
│                                                                             │
│  ┌─────────┐ ┌─────────┐ ┌────────────┐ ┌───────────────┐                   │
│  │ #design │ │ #ux     │ │ #research  │ │  + Add tag    │                   │
│  │    ✕    │ │    ✕    │ │     ✕      │ │               │                   │
│  └─────────┘ └─────────┘ └────────────┘ └───────────────┘                   │
│                                                                             │
│  Container:                                                                 │
│  - Display: flex                                                            │
│  - Flex-wrap: wrap                                                          │
│  - Gap: 8px                                                                 │
│  - Padding: 16px 0                                                          │
│                                                                             │
│  Tag chips:                                                                 │
│  - Height: 32px                                                             │
│  - Padding: 0 10px                                                          │
│  - Background: gray-100                                                     │
│  - Border-radius: 6px                                                       │
│  - Font-size: 13px                                                          │
│  - Color: gray-700                                                          │
│  - Display: flex, align-items: center, gap: 6px                             │
│                                                                             │
│  Remove button (✕) on each tag:                                             │
│  - Size: 14px × 14px                                                        │
│  - Color: gray-400                                                          │
│  - Hover: color gray-600                                                    │
│  - Shows on tag hover                                                       │
│                                                                             │
│  Add tag button:                                                            │
│  - Height: 32px                                                             │
│  - Padding: 0 12px                                                          │
│  - Background: white                                                        │
│  - Border: 1px dashed gray-300                                              │
│  - Border-radius: 6px                                                       │
│  - Font-size: 13px                                                          │
│  - Color: gray-500                                                          │
│  - Icon: + plus, 14px                                                       │
│  - Hover: border-color gray-400, bg gray-50                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

**Tag Input (Inline Editing):**
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ┌─────────┐ ┌─────────┐ ┌────────────────────────────────────────┐   │
│  │ #design │ │ #ux     │ │ typ█                              ✓  ✕ │   │
│  └─────────┘ └─────────┘ └────────────────────────────────────────┘   │
│                                                                       │
│  Inline input appears when "Add tag" clicked:                         │
│  - Same height as tags (32px)                                         │
│  - Min-width: 100px                                                   │
│  - Max-width: 200px                                                   │
│  - Auto-focus on appear                                               │
│  - Submit on Enter                                                    │
│  - Cancel on Escape                                                   │
│  - Show suggestions dropdown below                                    │
│                                                                       │
│  Suggestions dropdown:                                                │
│  - Shows existing tags that match input                               │
│  - Position below input                                               │
│  - Max 5 suggestions                                                  │
│  - Click or arrow+enter to select                                     │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

### Personal Notes Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  YOUR NOTES                                                                 │
│  ──────────                                                                 │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Great resource for the design system project.                        │  │
│  │  Especially the section on color theory.                              │  │
│  │                                                                       │  │
│  │  TODO:                                                                │  │
│  │  - Share with team                                                    │  │
│  │  - Extract color palette examples                                     │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ ✓ Auto-saved                                    Last edited 2h ago   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Text area:                                                                 │
│  - Background: white                                                        │
│  - Border: 1px solid gray-200                                               │
│  - Border-radius: 8px                                                       │
│  - Padding: 14px                                                            │
│  - Min-height: 120px                                                        │
│  - Resize: vertical                                                         │
│  - Font-size: 14px                                                          │
│  - Line-height: 1.6                                                         │
│  - Placeholder: "Add your personal notes..."                                │
│  - Focus: ring-2 ring-blue-500                                              │
│                                                                             │
│  Auto-save indicator:                                                       │
│  - Font-size: 12px                                                          │
│  - Color: gray-400                                                          │
│  - Shows "Saving..." while debounced save in progress                       │
│  - Shows "✓ Auto-saved" after successful save                               │
│  - Shows timestamp of last edit                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Metadata Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  DETAILS                                                                    │
│  ───────                                                                    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Saved           Dec 13, 2024 at 2:30 PM                              │  │
│  │  Last visited    Dec 13, 2024 at 4:15 PM                              │  │
│  │  Source          Chrome Extension                                     │  │
│  │  Read time       5 min (estimated)                                    │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Layout: Definition list style                                              │
│  - Label: 13px, gray-500, width: 100px                                      │
│  - Value: 13px, gray-700                                                    │
│  - Row spacing: 8px                                                         │
│                                                                             │
│  Container:                                                                 │
│  - Background: gray-50                                                      │
│  - Border-radius: 8px                                                       │
│  - Padding: 16px                                                            │
│  - Margin-top: 16px                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## URL Preview Props
```typescript
interface UrlPreviewProps {
  // Data
  data: UrlCardData;

  // AI Summary
  aiSummary?: string;
  aiSummaryStatus: "idle" | "loading" | "success" | "error";
  onGenerateSummary: () => void;

  // Tags
  availableTags: string[];            // For autocomplete
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;

  // Notes
  userNotes: string;
  onNotesChange: (notes: string) => void;
  notesSaveStatus: "idle" | "saving" | "saved" | "error";
  lastNotesEdit?: Date;

  // Actions
  onCopyUrl: () => void;
  onImageClick: () => void;           // Open in lightbox
}
```

---

# PART 2: NOTE PREVIEW

## Note Preview Layout
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  FORMATTING TOOLBAR (sticky)                                          │  │
│  │  ─────────────────────────                                            │  │
│  │  │ B │ I │ U │ S │ H1 │ H2 │ H3 │ • │ 1. │ ☐ │ </> │ 🔗 │ 📎 │       │  │
│  │  └───┴───┴───┴───┴────┴────┴────┴───┴────┴───┴─────┴────┴────┘       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  # Meeting Notes from Standup                                         │  │
│  │                                                                       │  │
│  │  Discussed the new feature roadmap and timeline for Q1 launch.        │  │
│  │                                                                       │  │
│  │  ## Key Decisions                                                     │  │
│  │                                                                       │  │
│  │  - Prioritize mobile experience                                       │  │
│  │  - Delay analytics dashboard to Q2                                    │  │
│  │  - Hire two more frontend developers                                  │  │
│  │                                                                       │  │
│  │  ## Action Items                                                      │  │
│  │                                                                       │  │
│  │  ☐ Update project timeline                                            │  │
│  │  ☐ Send hiring req to HR                                              │  │
│  │  ☑ Book meeting room for workshop                                     │  │
│  │                                                                       │  │
│  │  javascript                                                        │  │ │  │  const config = {                                                     │  │ │  │    feature: 'mobile-first',                                           │  │ │  │    deadline: 'Q1-2024'                                                │  │ │  │  };                                                                   │  │ │  │                                                                    │  │
│  │                                                                       │  │
│  │  [cursor here]█                                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ✓ Auto-saved · 847 words · Last edited 5 min ago                     │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  TAGS                                                                 │  │
│  │  ┌────────┐ ┌──────────┐ ┌───────────┐                                │  │
│  │  │ #work  │ │ #standup │ │  + Add    │                                │  │
│  │  └────────┘ └──────────┘ └───────────┘                                │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Note Preview Sections

### Formatting Toolbar
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                                             │    │
│  │  │ B │ I │ U │ S │ ─ │ H1│ H2│ H3│ ─ │ • │ 1.│ ☐ │ ─ │</>│ 🔗│ 📎│           │ ⋮ │        │    │
│  │  └───┴───┴───┴───┘   └───┴───┴───┘   └───┴───┴───┘   └───┴───┴───┘           └───┘        │    │
│  │                                                                                             │    │
│  │   Text       Headings    Lists         Insert                              More            │    │
│  │   styles                                                                   menu            │    │
│  │                                                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                     │
│  Container:                                                                                         │
│  - Position: sticky                                                                                 │
│  - Top: 0                                                                                           │
│  - Background: white                                                                                │
│  - Border-bottom: 1px solid gray-200                                                                │
│  - Padding: 8px 16px                                                                                │
│  - Z-index: 10                                                                                      │
│  - Display: flex                                                                                    │
│  - Gap: 4px                                                                                         │
│  - Flex-wrap: wrap (for responsive)                                                                 │
│                                                                                                     │
│  Dividers (─):                                                                                      │
│  - Width: 1px                                                                                       │
│  - Height: 24px                                                                                     │
│  - Background: gray-200                                                                             │
│  - Margin: 0 4px                                                                                    │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

**Toolbar Button:**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌──────────┐                                                  │
│  │          │                                                  │
│  │    B     │   Standard button                                │
│  │          │                                                  │
│  └──────────┘                                                  │
│                                                                │
│  - Size: 32px × 32px                                           │
│  - Border-radius: 6px                                          │
│  - Background: transparent                                     │
│  - Icon/Text: 14px, gray-600                                   │
│  - Hover: bg-gray-100                                          │
│  - Active (format applied): bg-gray-200, color gray-900        │
│  - Disabled: opacity 0.5, cursor not-allowed                   │
│                                                                │
│  Tooltip on hover: "Bold (⌘B)"                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘

**Toolbar Buttons Reference:**

| Button | Icon | Shortcut | Action |
|--------|------|----------|--------|
| Bold | **B** | ⌘B | Toggle bold |
| Italic | *I* | ⌘I | Toggle italic |
| Underline | U̲ | ⌘U | Toggle underline |
| Strikethrough | ~~S~~ | ⌘⇧X | Toggle strikethrough |
| Heading 1 | H1 | ⌘⌥1 | Apply H1 |
| Heading 2 | H2 | ⌘⌥2 | Apply H2 |
| Heading 3 | H3 | ⌘⌥3 | Apply H3 |
| Bullet List | • | ⌘⇧8 | Toggle bullet list |
| Numbered List | 1. | ⌘⇧7 | Toggle numbered list |
| Checkbox | ☐ | ⌘⇧9 | Toggle checkbox list |
| Code Block | </> | ⌘⇧C | Insert/toggle code block |
| Link | 🔗 | ⌘K | Insert link |
| Attachment | 📎 | — | Insert attachment |
| More | ⋮ | — | Additional options |

**More Menu Options:**
┌──────────────────────────────────┐
│                                  │
│  Horizontal rule                 │
│  Block quote                     │
│  Table                           │
│  ──────────────────────────────  │
│  Clear formatting                │
│  Word count                      │
│  ──────────────────────────────  │
│  View as Markdown                │
│                                  │
└──────────────────────────────────┘

### Editor Area
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Editor Container:                                                          │
│  - Flex: 1                                                                  │
│  - Overflow-y: auto                                                         │
│  - Padding: 24px                                                            │
│  - Min-height: 300px                                                        │
│                                                                             │
│  Editor Content:                                                            │
│  - Max-width: 680px (optimal reading width)                                 │
│  - Margin: 0 auto                                                           │
│  - Outline: none                                                            │
│  - Font-size: 16px                                                          │
│  - Line-height: 1.7                                                         │
│  - Color: gray-900                                                          │
│                                                                             │
│  Typography styles:                                                         │
│                                                                             │
│  H1:                                                                        │
│  - Font-size: 28px                                                          │
│  - Font-weight: 700                                                         │
│  - Margin: 24px 0 16px                                                      │
│  - Line-height: 1.3                                                         │
│                                                                             │
│  H2:                                                                        │
│  - Font-size: 22px                                                          │
│  - Font-weight: 600                                                         │
│  - Margin: 20px 0 12px                                                      │
│  - Line-height: 1.4                                                         │
│                                                                             │
│  H3:                                                                        │
│  - Font-size: 18px                                                          │
│  - Font-weight: 600                                                         │
│  - Margin: 16px 0 8px                                                       │
│  - Line-height: 1.4                                                         │
│                                                                             │
│  Paragraph:                                                                 │
│  - Margin-bottom: 16px                                                      │
│                                                                             │
│  Lists (ul, ol):                                                            │
│  - Margin-left: 24px                                                        │
│  - Margin-bottom: 16px                                                      │
│  - List item spacing: 8px                                                   │
│                                                                             │
│  Code (inline):                                                             │
│  - Background: gray-100                                                     │
│  - Padding: 2px 6px                                                         │
│  - Border-radius: 4px                                                       │
│  - Font-family: monospace                                                   │
│  - Font-size: 14px                                                          │
│                                                                             │
│  Code block:                                                                │
│  - Background: gray-900                                                     │
│  - Color: gray-100                                                          │
│  - Padding: 16px                                                            │
│  - Border-radius: 8px                                                       │
│  - Font-family: monospace                                                   │
│  - Font-size: 14px                                                          │
│  - Overflow-x: auto                                                         │
│  - Margin: 16px 0                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Checklist Rendering
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ## Action Items                                                            │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  ┌────┐                                                              │   │
│  │  │ ☐ │  Update project timeline                                     │   │
│  │  └────┘                                                              │   │
│  │                                                                      │   │
│  │  ┌────┐                                                              │   │
│  │  │ ☐ │  Send hiring req to HR                                       │   │
│  │  └────┘                                                              │   │
│  │                                                                      │   │
│  │  ┌────┐                                                              │   │
│  │  │ ☑ │  Book meeting room for workshop                              │   │
│  │  └────┘  ────────────────────────────                                │   │
│  │          Strikethrough text when checked                             │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Checkbox:                                                                  │
│  - Size: 18px × 18px                                                        │
│  - Border: 2px solid gray-300                                               │
│  - Border-radius: 4px                                                       │
│  - Margin-right: 10px                                                       │
│  - Cursor: pointer                                                          │
│  - Vertical-align: middle                                                   │
│                                                                             │
│  Checked state:                                                             │
│  - Background: green-600                                                    │
│  - Border-color: green-600                                                  │
│  - Checkmark: white                                                         │
│  - Text: gray-400, text-decoration line-through                             │
│                                                                             │
│  Interactive: Click checkbox to toggle, updates content                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Status Bar
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ✓ Auto-saved              847 words              Last edited 5m ago  │  │
│  │  ────────────              ─────────              ──────────────────  │  │
│  │  Save status               Word count             Last edit time      │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Container:                                                                 │
│  - Padding: 12px 24px                                                       │
│  - Background: gray-50                                                      │
│  - Border-top: 1px solid gray-200                                           │
│  - Font-size: 12px                                                          │
│  - Color: gray-500                                                          │
│  - Display: flex                                                            │
│  - Justify-content: space-between                                           │
│                                                                             │
│  Save status:                                                               │
│  - "✓ Auto-saved" (green-600 checkmark)                                     │
│  - "Saving..." (gray spinner)                                               │
│  - "⚠ Unable to save" (red-600, with retry)                                 │
│                                                                             │
│  Word count:                                                                │
│  - "{n} words"                                                              │
│  - Optional: Show characters too on hover                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Link Insertion Dialog
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    ┌─────────────────────────────────────┐                  │
│                    │                                     │                  │
│                    │  Insert Link                    ✕   │                  │
│                    │                                     │                  │
│                    │  Text                               │                  │
│                    │  ┌─────────────────────────────┐    │                  │
│                    │  │ Selected text or type here  │    │                  │
│                    │  └─────────────────────────────┘    │                  │
│                    │                                     │                  │
│                    │  URL                                │                  │
│                    │  ┌─────────────────────────────┐    │                  │
│                    │  │ https://                    │    │                  │
│                    │  └─────────────────────────────┘    │                  │
│                    │                                     │                  │
│                    │  ☐ Open in new tab                  │                  │
│                    │                                     │                  │
│                    │        [ Cancel ]  [ Insert ]       │                  │
│                    │                                     │                  │
│                    └─────────────────────────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Auto-Save Implementation
```typescript
function useAutoSave(
  content: string,
  saveFunction: (content: string) => Promise<void>,
  debounceMs: number = 1000
) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounced save
  const debouncedSave = useMemo(
    () => debounce(async (newContent: string) => {
      setSaveStatus("saving");
      try {
        await saveFunction(newContent);
        setSaveStatus("saved");
        setLastSaved(new Date());

        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        setSaveStatus("error");
      }
    }, debounceMs),
    [saveFunction, debounceMs]
  );

  // Trigger save on content change
  useEffect(() => {
    if (content) {
      debouncedSave(content);
    }

    return () => {
      debouncedSave.cancel();
    };
  }, [content, debouncedSave]);

  return { saveStatus, lastSaved };
}
```

---

## Note Preview Props
```typescript
interface NotePreviewProps {
  // Data
  data: NoteCardData;

  // Content editing
  content: string;
  onContentChange: (content: string) => void;

  // Save state
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSaved?: Date;
  onManualSave: () => void;

  // Tags
  availableTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;

  // Word count
  wordCount: number;
  characterCount: number;

  // Checklist
  checklistProgress?: {
    completed: number;
    total: number;
  };
  onChecklistItemToggle: (index: number) => void;

  // Attachments
  attachments?: Attachment[];
  onAddAttachment: (file: File) => void;
  onRemoveAttachment: (id: string) => void;
}
```

---

## Markdown Shortcuts

Support inline Markdown shortcuts that convert as user types:

| Input | Result |
|-------|--------|
| `# ` | Heading 1 |
| `## ` | Heading 2 |
| `### ` | Heading 3 |
| `- ` or `* ` | Bullet list |
| `1. ` | Numbered list |
| `[ ] ` or `- [ ] ` | Checkbox (unchecked) |
| `[x] ` or `- [x] ` | Checkbox (checked) |
| ``` ` ` ` ``` | Code block |
| `> ` | Block quote |
| `---` | Horizontal rule |
| `**text**` | Bold |
| `*text*` | Italic |
| `` `code` `` | Inline code |
| `[text](url)` | Link |

---

## Responsive Behavior

### URL Preview Responsive

| Breakpoint | Changes |
|------------|---------|
| < 640px | Image height: 180px. Sections stack tighter. |
| 640px - 1024px | Standard layout |
| > 1024px | Standard layout |

### Note Preview Responsive

| Breakpoint | Changes |
|------------|---------|
| < 640px | Toolbar wraps to 2 rows. Reduced padding. Smaller fonts. |
| 640px - 1024px | Standard layout |
| > 1024px | Standard layout |

---

## Verification Checklist

### URL Preview
☐ Preview image displays correctly (or fallback)
☐ URL field shows full URL with copy button
☐ Copy button shows "Copied!" feedback
☐ Meta description displays
☐ AI Summary section collapses/expands
☐ AI Summary shows loading/generating states
☐ Tags display with remove buttons
☐ Add tag input shows with autocomplete
☐ Personal notes auto-saves on change
☐ Save status indicator shows correct state
☐ Metadata section shows all details

### Note Preview
☐ Formatting toolbar displays all buttons
☐ Toolbar buttons toggle active state when format applied
☐ Bold, italic, underline work via toolbar and shortcuts
☐ Headings (H1, H2, H3) apply correctly
☐ Bullet, numbered, and checkbox lists work
☐ Checkboxes toggle on click
☐ Checked items show strikethrough
☐ Code blocks render with syntax highlighting
☐ Inline code renders correctly
☐ Links can be inserted via dialog
☐ Markdown shortcuts convert as typed
☐ Auto-save triggers on content change
☐ Save status shows in status bar
☐ Word count updates as user types
☐ Tags section works same as URL preview

## Output

Create two React components:

1. **UrlPreview** — The URL item preview with all sections as specified
2. **NotePreview** — The rich text editor preview with toolbar and auto-save

Use Tailwind CSS for styling. For the rich text editor, you may use a library like TipTap, Slate, or similar — or implement a simpler contentEditable-based solution. Ensure all interactive elements have proper focus states and keyboard support.

Both components render as children of PreviewPanelShell.

Implementation Notes
Key Techniques Used:
TechniqueWhyDebounced auto-savePrevents excessive API calls while user typesCollapsible AI sectionKeeps UI clean, summary can be longInline tag editingNo modal needed, faster workflowSticky toolbarAlways accessible while scrolling long notesMarkdown shortcutsPower users expect them in note editors
Design Choices:

URL Preview structured as sections — Each type of information has its own card/area. Makes scanning easy, editing targeted.
AI Summary opt-in with collapse — AI features shouldn't dominate. Collapsed by default for users who don't want AI assistance.
Rich text editor (not Markdown-only) — Most users prefer WYSIWYG. Markdown shortcuts provide power user escape hatch.
Auto-save with status indicator — Users shouldn't worry about losing work. Clear feedback builds trust.
Checklist progress tracking — Shows completion at a glance, motivates completion.


Expected Output Structure
jsx// UrlPreview.tsx
<div className="url-preview">
  {/* Image Section */}
  <div className="preview-image-section">
    {data.previewImage ? (
      <img src={data.previewImage} alt={data.title} onClick={onImageClick} />
    ) : (
      <ImageFallback domain={data.domain} favicon={data.favicon} />
    )}
  </div>

  {/* URL Field */}
  <section className="url-section">
    <label className="section-label">URL</label>
    <div className="url-field">
      <LinkIcon />
      <span className="url-text">{data.url}</span>
      <CopyButton url={data.url} onCopy={onCopyUrl} />
    </div>
  </section>

  {/* Description */}
  <section className="description-section">
    <label className="section-label">Description</label>
    <p>{data.description || "No description available"}</p>
  </section>

  {/* AI Summary */}
  <AISummarySection
    summary={aiSummary}
    status={aiSummaryStatus}
    onGenerate={onGenerateSummary}
  />

  {/* Tags */}
  <TagsSection
    tags={data.tags}
    availableTags={availableTags}
    onAdd={onAddTag}
    onRemove={onRemoveTag}
  />

  {/* Personal Notes */}
  <section className="notes-section">
    <label className="section-label">Your Notes</label>
    <textarea
      value={userNotes}
      onChange={(e) => onNotesChange(e.target.value)}
      placeholder="Add your personal notes..."
    />
    <SaveStatusIndicator status={notesSaveStatus} lastSaved={lastNotesEdit} />
  </section>

  {/* Metadata */}
  <MetadataSection data={data} />
</div>

// NotePreview.tsx
<div className="note-preview">
  {/* Formatting Toolbar */}
  <FormattingToolbar
    activeFormats={activeFormats}
    onFormat={handleFormat}
    onInsertLink={handleInsertLink}
    onInsertAttachment={handleInsertAttachment}
  />

  {/* Editor */}
  <div className="editor-container">
    <RichTextEditor
      content={content}
      onChange={onContentChange}
      onChecklistToggle={onChecklistItemToggle}
    />
  </div>

  {/* Status Bar */}
  <div className="status-bar">
    <SaveStatus status={saveStatus} />
    <span className="word-count">{wordCount} words</span>
    <span className="last-edited">Last edited {formatRelativeTime(lastSaved)}</span>
  </div>

  {/* Tags */}
  <TagsSection
    tags={data.tags}
    availableTags={availableTags}
    onAdd={onAddTag}
    onRemove={onRemoveTag}
  />
</div>

Usage Guidelines

URL Preview: Test with URLs that have/don't have og:image, long titles, no description
Note Preview: Test all formatting options, Markdown shortcuts, checklist toggling
Auto-save: Make changes, verify save indicator cycles through states
Tags: Add, remove, test autocomplete with existing tags
AI Summary: Test all states (loading, success, error, generate button)
Keyboard: Verify all shortcuts work (⌘B, ⌘I, etc.)