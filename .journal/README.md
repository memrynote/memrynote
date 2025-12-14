# Inbox Feature Development Journal

This directory contains a series of AI prompts designed to guide the step-by-step implementation of the Inbox feature for Memry, a Personal Knowledge Management (PKM) desktop application.

---

## Overview

The Inbox is a core feature that allows users to capture ideas, links, files, and other content quickly, then organize them later. This implementation follows the specifications defined in `/cc-prompts/inbox-layouts.md`.

---

## Specification Summary

### Design Principles
1. Capture instantly, organize later
2. Visual differentiation by type
3. Clear "processed" destination
4. Transparent AI assistance
5. Progressive disclosure
6. Dual triage modes

### Content Types (8 total)
- `link` - URLs with rich preview
- `note` - Text notes
- `image` - Image files with thumbnails
- `voice` - Voice memos with waveform
- `pdf` - PDF documents
- `webclip` - Highlighted web content
- `file` - Generic files
- `video` - Video files

### Density Views (3 modes)
- **Compact** - Power user list (44px rows)
- **Medium** - Default balanced view (80-120px)
- **Expanded** - Full detail cards

### Key Features
- Search and filtering with progressive disclosure
- Snooze functionality (defer items)
- Bulk actions with AI clustering
- Stale items detection (7+ days)
- Keyboard shortcuts
- Drag-and-drop filing
- AI-powered folder suggestions

---

## Prompt Sequence

The prompts are organized in build order, with dependencies flowing from foundation to features:

| # | Prompt | Description | Dependencies |
|---|--------|-------------|--------------|
| 01 | Foundation Types | TypeScript types for inbox items, content types, and state | None |
| 02 | Header Bar | Page title, item count, search input, view toggle | 01 |
| 03 | Type Icon System | Icon and color mapping for 8 content types | 01 |
| 04 | Compact View | List-based power user view with hover states | 01, 03 |
| 05 | Medium View Base | Default view structure with type-specific layouts | 01, 03 |
| 06 | Medium View Types | Type-specific preview renderers (link, note, image, etc.) | 05 |
| 07 | Expanded View | Full-detail card layout with all metadata | 01, 03, 05 |
| 08 | View Switcher | Toggle between Compact/Medium/Expanded views | 04, 05, 07 |
| 09 | Empty States | Three variants: first-time, inbox zero, returning empty | 01 |
| 10 | Search Component | Expandable search with recent queries | 02 |
| 11 | Filter System | Type filters, time filters, sort options | 02, 10 |
| 12 | Item Selection | Checkbox logic, keyboard selection, bulk mode | 04, 05, 07 |
| 13 | Bulk Action Bar | Floating bar with File/Tag/Snooze/Delete actions | 12 |
| 14 | Snooze Feature | Snooze menu, snoozed items indicator, return animation | 12, 13 |
| 15 | Filing Panel | Slide-over panel with folder tree, AI suggestions | 12, 13 |
| 16 | Stale Items Section | Warning section for 7+ day old items | 04, 05, 12 |
| 17 | Keyboard Shortcuts | Full keyboard navigation and shortcut system | 04, 05, 07, 12 |
| 18 | Page Integration | Final assembly, responsive layout, state management | All |

---

## File Structure (Target)

```
src/renderer/src/
├── types/
│   └── inbox.ts                    # Inbox-specific types
├── pages/
│   └── inbox.tsx                   # Main page component
├── components/
│   └── inbox/
│       ├── header-bar.tsx          # Header with title, search, filters
│       ├── search-input.tsx        # Expandable search
│       ├── filter-bar.tsx          # Filter pills and dropdowns
│       ├── view-switcher.tsx       # View mode toggle
│       ├── type-icon.tsx           # Content type icon component
│       ├── compact-view.tsx        # List view
│       ├── compact-item.tsx        # Single list row
│       ├── medium-view.tsx         # Default card view
│       ├── medium-item.tsx         # Single medium card
│       ├── medium-item-link.tsx    # Link-specific layout
│       ├── medium-item-note.tsx    # Note-specific layout
│       ├── medium-item-image.tsx   # Image-specific layout
│       ├── medium-item-voice.tsx   # Voice-specific layout
│       ├── medium-item-pdf.tsx     # PDF-specific layout
│       ├── medium-item-webclip.tsx # Webclip-specific layout
│       ├── expanded-view.tsx       # Expanded card view
│       ├── expanded-item.tsx       # Single expanded card
│       ├── empty-state.tsx         # Empty state variants
│       ├── bulk-action-bar.tsx     # Selection action bar
│       ├── snooze-menu.tsx         # Snooze dropdown
│       ├── snoozed-indicator.tsx   # Snoozed items popover
│       ├── filing-panel.tsx        # Filing slide-over
│       ├── stale-section.tsx       # Stale items warning
│       └── keyboard-help.tsx       # Shortcut modal
└── lib/
    ├── hooks/
    │   ├── use-inbox-items.ts      # Item data management
    │   ├── use-inbox-selection.ts  # Selection state
    │   ├── use-inbox-filters.ts    # Filter state
    │   └── use-keyboard-nav.ts     # Keyboard navigation
    └── inbox-utils.ts              # Utility functions
```

---

## How to Use These Prompts

1. **Read the prompt file** in order (01, 02, 03, etc.)
2. **Execute the implementation** as described in each prompt
3. **Test the component** before moving to the next prompt
4. **Reference earlier prompts** when building on dependencies

Each prompt includes:
- **Objective** - What we are building
- **Context** - Relevant background and dependencies
- **Specifications** - Detailed requirements from the layout spec
- **Implementation Guide** - File locations, component structure
- **Code Examples** - Starter code or patterns to follow
- **Acceptance Criteria** - How to verify completion

---

## Design System Reference

The inbox uses the existing Memry design system:
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **shadcn/ui** New York style
- **Lucide icons** for all iconography
- **CSS variables** for theming

Key design tokens for inbox:
```css
--inbox-item-compact-height: 44px
--inbox-item-medium-height: 80-120px (type-dependent)
--inbox-card-expanded-gap: 24px
--inbox-transition-duration: 200ms
--inbox-stale-days: 7
```

---

## Notes

- All file paths are relative to `/Users/h4yfans/sideproject/memry/`
- Use `pnpm` for package management
- Run `pnpm typecheck` after each implementation
- Run `pnpm lint` to ensure code quality

---

## Prompt Files

All 18 prompt files have been created:

```
.journal/
├── README.md                    # This file
├── 01-foundation-types.md       # TypeScript types
├── 02-header-bar.md             # Header component
├── 03-type-icon-system.md       # Icon/color system
├── 04-compact-view.md           # List view
├── 05-medium-view-base.md       # Card view base
├── 06-medium-view-types.md      # Type-specific cards
├── 07-expanded-view.md          # Full detail view
├── 08-view-switcher.md          # View toggle
├── 09-empty-states.md           # Empty state variants
├── 10-search-component.md       # Search input
├── 11-filter-system.md          # Filters
├── 12-item-selection.md         # Selection logic
├── 13-bulk-action-bar.md        # Bulk actions
├── 14-snooze-feature.md         # Snooze system
├── 15-filing-panel.md           # Filing slide-over
├── 16-stale-items-section.md    # Stale items warning
├── 17-keyboard-shortcuts.md     # Keyboard navigation
└── 18-page-integration.md       # Final assembly
```

---

## Estimated Effort

| Phase | Prompts | Estimated Time |
|-------|---------|----------------|
| Foundation | 01-03 | 2-3 hours |
| Core Views | 04-08 | 4-6 hours |
| Features | 09-16 | 6-8 hours |
| Integration | 17-18 | 3-4 hours |
| **Total** | **18** | **15-21 hours** |

---

## Dependencies to Install

Before starting, ensure these packages are available:

```bash
# Already in project (verify)
pnpm add lucide-react
pnpm add @radix-ui/react-checkbox
pnpm add @radix-ui/react-dropdown-menu
pnpm add @radix-ui/react-popover
pnpm add @radix-ui/react-dialog
pnpm add @radix-ui/react-collapsible
pnpm add @radix-ui/react-select

# May need to add
pnpm add react-hotkeys-hook
pnpm add framer-motion  # Optional, for animations
```

---

## Quick Start

1. Start with `01-foundation-types.md`
2. Follow the prompts in numerical order
3. Each prompt is self-contained with all needed context
4. Test after each prompt before continuing
5. Reference the specification in `/cc-prompts/inbox-layouts.md` for visual details
