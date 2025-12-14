# 05 — Medium View (Default)

## Objective

Build the medium density view — the default view that balances information density with rich preview content. Users can scan items while seeing meaningful previews (first lines of text, image thumbnails, voice waveforms).

## Prerequisites

- **01-inbox-types.md** — Item types
- **02-page-shell.md** — Page structure
- **03-type-icons.md** — TypeBadge component
- **04-compact-view.md** — Compact view pattern (for consistency)

## What We're Building

A card-based list where each item is 80-120px tall (varies by type) with:
- Checkbox for selection
- Type icon with color
- Title and metadata line
- Type-specific preview content
- Hover actions

## Placement

| What | Where |
|------|-------|
| MediumView component | `src/renderer/src/components/inbox/medium-view.tsx` (NEW) |
| MediumCard component | `src/renderer/src/components/inbox/medium-card.tsx` (NEW) |

## Specifications

### Card Layout (80-120px height)

```
┌──────────────────────────────────────────────────────────────────────┐
│  □                                                                   │
│     🔗  How to Build a Second Brain — Forte Labs                     │
│         fortelabs.com · 2 hours ago                                  │
│         "The PARA method helps you organize information..."          │
│                                                        [File] [👁] ⋮ │
└──────────────────────────────────────────────────────────────────────┘
```

### Card Structure

| Element | Placement | Description |
|---------|-----------|-------------|
| Checkbox | Top-left | Selection control |
| Type Icon | After checkbox | Colored by type, 20px |
| Title | Main heading | `font-medium`, may wrap to 2 lines |
| Meta Line | Below title | Source/domain + timestamp + type-specific stats |
| Preview | Below meta | Type-specific content (see next prompt) |
| Actions | Bottom-right | Visible on hover |

### Card Height by Type

| Type | Height | Reason |
|------|--------|--------|
| link | ~100px | Hero image + excerpt |
| note | ~90px | Text preview (2-3 lines) |
| image | ~120px | Thumbnail needs space |
| voice | ~100px | Waveform + transcription |
| pdf | ~100px | Page thumbnail + text |
| webclip | ~100px | Quote excerpt |
| file | ~80px | Minimal, just metadata |
| video | ~100px | Thumbnail + duration |

### Meta Line Format

Each type shows different metadata:

| Type | Meta Line |
|------|-----------|
| link | `fortelabs.com · 2 hours ago` |
| note | `2 hours ago · 847 words` |
| image | `2 hours ago · 1920×1080 · 2.4 MB` |
| voice | `2 hours ago · 2:34 duration` |
| pdf | `Yesterday · 12 pages · 3.2 MB` |
| webclip | `medium.com · 3 hours ago · 2 highlights` |
| file | `2 hours ago · .docx · 156 KB` |
| video | `1 hour ago · 5:23 · YouTube` |

### Card States

**Default:**
- Background: `bg-card` (white/cream)
- Border: `border border-border/50`
- Shadow: none

**Hover:**
- Background: `bg-accent/30`
- Actions visible
- Slight shadow: `shadow-sm`

**Selected:**
- Background: `bg-accent`
- Border-left: `border-l-4 border-primary`
- Checkbox checked

**Focused:**
- Ring: `ring-2 ring-primary`

### Hover Actions

```
                                                        [File] [👁] ⋮
```

- **File** (FolderInput icon) — Opens filing panel
- **Preview** (Eye icon) — Opens preview panel
- **Menu** (MoreVertical) — Dropdown: Open, Snooze, Delete

### List Container

MediumView component:
- Renders items as vertical stack
- Gap between cards: `gap-3` (12px)
- Handles scroll and selection state
- Passes item to type-specific renderer (next prompt)

### Preview Content Placeholder

For this prompt, show a generic preview placeholder. The next prompt (06-type-renderers) will implement type-specific previews.

```
┌──────────────────────────────────────────────────────────────────────┐
│  □  🔗  Article Title Here                                           │
│         domain.com · timestamp                                       │
│         [Preview content rendered by TypeRenderer]                   │
│                                                        [File] [👁] ⋮ │
└──────────────────────────────────────────────────────────────────────┘
```

## Design System Alignment

| Element | Style |
|---------|-------|
| Card | `rounded-lg border border-border/50 bg-card` |
| Card padding | `p-4` |
| Card gap | Between cards: `gap-3` |
| Title | `text-base font-medium text-foreground` |
| Meta | `text-sm text-muted-foreground` |
| Preview | `text-sm text-secondary-foreground` |
| Icon size | `size-5` (20px) |
| Actions | `size-4` icons, `gap-1` between |

### Responsive Behavior

- Cards are full-width within the content area
- Content padding ensures cards don't touch edges
- On narrow widths, meta line may wrap

## Acceptance Criteria

- [ ] MediumView renders list of cards
- [ ] Cards have proper border and padding
- [ ] Type icon shows with correct color
- [ ] Title displays prominently
- [ ] Meta line shows type-appropriate info
- [ ] Placeholder area ready for type-specific preview
- [ ] Hover reveals actions smoothly
- [ ] Selected state visually distinct
- [ ] Cards have consistent spacing
- [ ] Actions work (File, Preview, Menu)

## Next Prompt

**06-type-renderers.md** — Implement type-specific preview renderers for each content type.
