# Memry Inbox UI — Prompt Engineering Sequence

A comprehensive prompt engineering guide for building the Memry PKM (Personal Knowledge Management) Inbox interface. This document outlines 23 detailed prompts organized into 6 phases, designed to guide an AI assistant in creating a complete, production-ready inbox UI.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Phase Summary](#phase-summary)
- [Complete Prompt Sequence](#complete-prompt-sequence)
- [Dependency Graph](#dependency-graph)
- [Getting Started](#getting-started)
- [Suggested File Structure](#suggested-file-structure)
- [Design Tokens](#design-tokens)

---

## Overview

**Memry** is a PKM (Personal Knowledge Management) tool that helps users capture, organize, and retrieve information. The **Inbox** is the central hub where all captured items land before being processed, tagged, and organized.

### Key Features
- Multi-type content support (URLs, Notes, Images, Voice Memos, Web Clips)
- Grid and List view layouts
- Quick capture bar for fast input
- Preview panel for detailed viewing
- Bulk actions and organization tools
- Full keyboard navigation
- Responsive design (desktop, tablet, mobile)

### Design Philosophy
- Clean, minimal interface
- Content-first approach
- Keyboard-friendly for power users
- Accessible (WCAG 2.1 AA compliant)
- Smooth animations and transitions

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18+ |
| Styling | Tailwind CSS |
| State Management | Zustand or React Context |
| Animations | CSS Keyframes / Framer Motion |
| Icons | Lucide React |
| TypeScript | Recommended |

---

## Phase Summary

| Phase | Name | Prompts | Description |
|-------|------|---------|-------------|
| 1 | **Foundation & Layout** | #1–4 | Core page structure and persistent UI elements |
| 2 | **Content Cards** | #5–9 | Individual card components for each content type |
| 3 | **Views & Layout** | #10–12 | Grid/List views and view switching |
| 4 | **Preview System** | #13–16 | Detail preview panel and quick preview popup |
| 5 | **Selection & Actions** | #17–18 | Bulk operations and organization dialogs |
| 6 | **Filtering & Search** | #19–20 | Filter dropdown and search functionality |
| 7 | **Feedback & Polish** | #21–23 | Empty states, keyboard nav, notifications |

---

## Complete Prompt Sequence

### Phase 1: Foundation & Layout

| # | Prompt Name | What It Builds | Dependencies |
|---|-------------|----------------|--------------|
| 1 | **Page Layout Shell** | Main page structure with 4 zones (header, context, content, capture) | None |
| 2 | **Header Bar** | Menu button, search input, filter button, view toggle | #1 |
| 3 | **Context Bar** | Inbox title, item count badge, process dropdown | #1 |
| 4 | **Quick Capture Bar** | Fixed bottom bar with input, voice, attach, link buttons | #1 |

**Phase 1 Deliverables:**
- Responsive page shell
- Navigation header with search
- Contextual breadcrumb/info bar
- Quick capture input system

---

### Phase 2: Content Cards

| # | Prompt Name | What It Builds | Dependencies |
|---|-------------|----------------|--------------|
| 5 | **Card: URL/Link** | URL card with preview image, title, domain, tags | None (component) |
| 6 | **Card: Note** | Note card with title, content preview, tag variants | None (component) |
| 7 | **Card: Image** | Image card with thumbnail, filename, AI tags | None (component) |
| 8 | **Card: Voice** | Voice card with waveform, duration, transcript preview | None (component) |
| 9 | **Card: Web Clip** | Web clip card with quote styling, source link | None (component) |

**Phase 2 Deliverables:**
- 5 distinct card components
- Consistent card anatomy (hover states, actions, tags)
- Type-specific visual treatments
- Shared card utilities/hooks

---

### Phase 3: Views & Layout

| # | Prompt Name | What It Builds | Dependencies |
|---|-------------|----------------|--------------|
| 10 | **Grid View (Masonry)** | Masonry layout with date groupings, responsive columns | #1, #5–9 |
| 11 | **List View (Timeline)** | Vertical list with date groups, hover actions | #1, #5–9 |
| 12 | **View Switcher** | Toggle between grid/list, persist preference | #10, #11 |

**Phase 3 Deliverables:**
- Masonry grid layout system
- Timeline list layout
- View preference persistence
- Smooth view transitions

---

### Phase 4: Preview System

| # | Prompt Name | What It Builds | Dependencies |
|---|-------------|----------------|--------------|
| 13 | **Preview Panel Shell** | Slide-over panel with header, content area, action bar | #1 |
| 14 | **Preview: URL & Note** | URL preview with AI summary, Note preview with editor | #13 |
| 15 | **Preview: Image, Voice, Clip** | Image lightbox, voice player, clip quote view | #13 |
| 16 | **Quick Preview Popup** | Spacebar-triggered floating preview card | #5–9 |

**Phase 4 Deliverables:**
- Slide-over preview panel
- Type-specific preview content
- Media players (audio, image viewer)
- Quick preview on hover/keyboard

---

### Phase 5: Selection & Actions

| # | Prompt Name | What It Builds | Dependencies |
|---|-------------|----------------|--------------|
| 17 | **Selection & Bulk Actions** | Multi-select mode, bulk action bar | #10, #11 |
| 18 | **Move/Tag Dialogs** | Folder picker with search, tag manager with creation | #13, #17 |

**Phase 5 Deliverables:**
- Multi-select with shift+click
- Floating bulk actions bar
- Move to folder dialog
- Tag management dialog

---

### Phase 6: Filtering & Search

| # | Prompt Name | What It Builds | Dependencies |
|---|-------------|----------------|--------------|
| 19 | **Filter Dropdown** | Content type filters, tag filters, date range, status | #2 |
| 20 | **Search Input** | Full-text search with autocomplete, recent searches | #2 |

**Phase 6 Deliverables:**
- Multi-faceted filter system
- Active filter pills
- Search with suggestions
- Filter + search combination

---

### Phase 7: Feedback & Polish

| # | Prompt Name | What It Builds | Dependencies |
|---|-------------|----------------|--------------|
| 21 | **Empty States** | First-time empty, inbox-zero, no results, error states | #10, #11 |
| 22 | **Keyboard Navigation** | J/K navigation, shortcuts, focus management | #10–16 |
| 23 | **Toast Notifications** | Success/error feedback, undo actions, progress | None |

**Phase 7 Deliverables:**
- 7 empty state variations
- Complete keyboard shortcut system
- Toast notification system
- Screen reader announcements

---

## Dependency Graph

```
Phase 1: Foundation
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   #1 Page Layout Shell                                      │
│        │                                                    │
│        ├──→ #2 Header Bar                                   │
│        │         │                                          │
│        │         ├──→ #19 Filter Dropdown                   │
│        │         └──→ #20 Search Input                      │
│        │                                                    │
│        ├──→ #3 Context Bar                                  │
│        │                                                    │
│        └──→ #4 Quick Capture Bar                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Phase 2: Cards (Independent Components)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   #5 URL Card    #6 Note Card    #7 Image Card              │
│        │              │               │                     │
│        └──────────────┼───────────────┘                     │
│                       │                                     │
│   #8 Voice Card  #9 Web Clip Card                           │
│        │              │                                     │
│        └──────────────┘                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Phase 3: Views
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   #1 + #5-9                                                 │
│        │                                                    │
│        ├──→ #10 Grid View (Masonry)                         │
│        │         │                                          │
│        │         └──→ #12 View Switcher                     │
│        │                    │                               │
│        └──→ #11 List View ──┘                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Phase 4: Preview
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   #1 ──→ #13 Preview Panel Shell                            │
│               │                                             │
│               ├──→ #14 URL & Note Preview                   │
│               │                                             │
│               └──→ #15 Image, Voice, Clip Preview           │
│                                                             │
│   #5-9 ──→ #16 Quick Preview Popup                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Phase 5: Actions
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   #10, #11 ──→ #17 Selection & Bulk Actions                 │
│                     │                                       │
│                     └──→ #18 Move/Tag Dialogs               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Phase 6-7: Polish
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   #10, #11 ──→ #21 Empty States                             │
│                                                             │
│   #10-16 ──→ #22 Keyboard Navigation                        │
│                                                             │
│   (Independent) ──→ #23 Toast Notifications                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites
```bash
# Create a new React project (if starting fresh)
npx create-react-app memry-inbox --template typescript
# or
npx create-next-app@latest memry-inbox --typescript --tailwind

# Install dependencies
npm install lucide-react zustand
```

### Recommended Build Order

**Week 1: Foundation**
1. Start with Prompt #1 (Page Layout Shell)
2. Add Prompt #2 (Header Bar)
3. Add Prompt #3 (Context Bar)
4. Add Prompt #4 (Quick Capture Bar)

**Week 2: Cards**
5. Build Prompt #5-9 (All Card Types)
6. Create shared card utilities

**Week 3: Views**
7. Implement Prompt #10 (Grid View)
8. Implement Prompt #11 (List View)
9. Add Prompt #12 (View Switcher)

**Week 4: Preview**
10. Build Prompt #13 (Preview Panel Shell)
11. Add Prompt #14-15 (Type-specific Previews)
12. Add Prompt #16 (Quick Preview Popup)

**Week 5: Actions**
13. Implement Prompt #17 (Bulk Actions)
14. Build Prompt #18 (Move/Tag Dialogs)

**Week 6: Search & Filter**
15. Add Prompt #19 (Filter Dropdown)
16. Add Prompt #20 (Search Input)

**Week 7: Polish**
17. Implement Prompt #21 (Empty States)
18. Add Prompt #22 (Keyboard Navigation)
19. Build Prompt #23 (Toast Notifications)

---

## Suggested File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── PageLayout.tsx           # Prompt #1
│   │   ├── HeaderBar.tsx            # Prompt #2
│   │   ├── ContextBar.tsx           # Prompt #3
│   │   └── QuickCaptureBar.tsx      # Prompt #4
│   │
│   ├── cards/
│   │   ├── BaseCard.tsx             # Shared card wrapper
│   │   ├── URLCard.tsx              # Prompt #5
│   │   ├── NoteCard.tsx             # Prompt #6
│   │   ├── ImageCard.tsx            # Prompt #7
│   │   ├── VoiceCard.tsx            # Prompt #8
│   │   ├── WebClipCard.tsx          # Prompt #9
│   │   └── index.ts                 # Card exports
│   │
│   ├── views/
│   │   ├── GridView.tsx             # Prompt #10
│   │   ├── ListView.tsx             # Prompt #11
│   │   ├── ViewSwitcher.tsx         # Prompt #12
│   │   └── DateGroup.tsx            # Shared date grouping
│   │
│   ├── preview/
│   │   ├── PreviewPanel.tsx         # Prompt #13
│   │   ├── URLPreview.tsx           # Prompt #14
│   │   ├── NotePreview.tsx          # Prompt #14
│   │   ├── ImagePreview.tsx         # Prompt #15
│   │   ├── VoicePreview.tsx         # Prompt #15
│   │   ├── WebClipPreview.tsx       # Prompt #15
│   │   └── QuickPreviewPopup.tsx    # Prompt #16
│   │
│   ├── actions/
│   │   ├── BulkActionsBar.tsx       # Prompt #17
│   │   ├── MoveDialog.tsx           # Prompt #18
│   │   ├── TagDialog.tsx            # Prompt #18
│   │   └── SelectionProvider.tsx    # Selection context
│   │
│   ├── filters/
│   │   ├── FilterDropdown.tsx       # Prompt #19
│   │   ├── FilterPills.tsx          # Active filter display
│   │   ├── SearchInput.tsx          # Prompt #20
│   │   └── SearchDropdown.tsx       # Search suggestions
│   │
│   ├── feedback/
│   │   ├── EmptyState.tsx           # Prompt #21
│   │   ├── ToastProvider.tsx        # Prompt #23
│   │   ├── Toast.tsx                # Prompt #23
│   │   └── ToastContainer.tsx       # Prompt #23
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Checkbox.tsx
│       ├── Dialog.tsx
│       ├── Dropdown.tsx
│       └── Tooltip.tsx
│
├── hooks/
│   ├── useItemNavigation.ts         # Prompt #22
│   ├── useKeySequences.ts           # Prompt #22
│   ├── useFocusTrap.ts              # Prompt #22
│   ├── useSelection.ts              # Prompt #17
│   ├── useToast.ts                  # Prompt #23
│   ├── useSearch.ts                 # Prompt #20
│   ├── useFilters.ts                # Prompt #19
│   └── useViewPreference.ts         # Prompt #12
│
├── stores/
│   ├── inboxStore.ts                # Main inbox state
│   ├── selectionStore.ts            # Selection state
│   ├── filterStore.ts               # Filter state
│   └── toastStore.ts                # Toast state
│
├── types/
│   ├── inbox.ts                     # InboxItem, ItemType, etc.
│   ├── filters.ts                   # FilterState, DatePreset, etc.
│   └── toast.ts                     # Toast, ToastType, etc.
│
├── utils/
│   ├── formatters.ts                # Date, duration formatters
│   ├── validators.ts                # Tag name, URL validators
│   └── constants.ts                 # Keyboard shortcuts, durations
│
├── styles/
│   ├── globals.css                  # Tailwind imports
│   └── animations.css               # Keyframe animations
│
└── pages/
    └── inbox/
        └── index.tsx                # Main inbox page
```

---

## Design Tokens

### Colors

```css
/* Primary (Gray scale) */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Accent (Blue) */
--blue-50: #eff6ff;
--blue-100: #dbeafe;
--blue-200: #bfdbfe;
--blue-400: #60a5fa;
--blue-500: #3b82f6;
--blue-600: #2563eb;
--blue-700: #1d4ed8;

/* Status Colors */
--green-500: #22c55e;
--green-600: #16a34a;
--red-500: #ef4444;
--red-600: #dc2626;
--amber-500: #f59e0b;
--amber-600: #d97706;

/* Type Colors */
--type-url: #3b82f6;      /* Blue */
--type-note: #22c55e;     /* Green */
--type-image: #a855f7;    /* Purple */
--type-voice: #f97316;    /* Orange */
--type-clip: #06b6d4;     /* Cyan */
```

### Spacing

```css
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
```

### Typography

```css
/* Font Sizes */
--text-xs: 11px;
--text-sm: 13px;
--text-base: 14px;
--text-lg: 15px;
--text-xl: 18px;
--text-2xl: 20px;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.16);
```

### Border Radius

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### Z-Index Scale

```css
--z-dropdown: 30;
--z-sticky: 35;
--z-bulk-actions: 40;
--z-overlay: 50;
--z-modal: 60;
--z-toast: 100;
```

### Breakpoints

```css
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
```

### Animation Durations

```css
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 400ms;
```

---

## Quick Reference: All Prompts

| # | Name | One-Line Description |
|---|------|---------------------|
| 1 | Page Layout Shell | Main 4-zone page structure |
| 2 | Header Bar | Search, filter, view toggle |
| 3 | Context Bar | Title, count, process dropdown |
| 4 | Quick Capture Bar | Bottom input bar |
| 5 | Card: URL/Link | Link preview card |
| 6 | Card: Note | Text note card |
| 7 | Card: Image | Image thumbnail card |
| 8 | Card: Voice | Audio memo card |
| 9 | Card: Web Clip | Highlighted quote card |
| 10 | Grid View | Masonry layout |
| 11 | List View | Timeline layout |
| 12 | View Switcher | Grid/list toggle |
| 13 | Preview Panel Shell | Slide-over panel |
| 14 | Preview: URL & Note | Link & note previews |
| 15 | Preview: Image/Voice/Clip | Media previews |
| 16 | Quick Preview Popup | Hover/keyboard preview |
| 17 | Selection & Bulk Actions | Multi-select + action bar |
| 18 | Move/Tag Dialogs | Organization modals |
| 19 | Filter Dropdown | Type/tag/date filters |
| 20 | Search Input | Autocomplete search |
| 21 | Empty States | Zero-content screens |
| 22 | Keyboard Navigation | J/K nav + shortcuts |
| 23 | Toast Notifications | Feedback messages |

---

## License

This prompt engineering guide is provided for building the Memry Inbox UI. Adapt and modify as needed for your implementation.

---

