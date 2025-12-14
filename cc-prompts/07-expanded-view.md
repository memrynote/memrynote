# 07 — Expanded Review View

## Objective

Build the expanded view — a full-detail card view designed for reviewing items one by one. Each item gets a large card with complete content, AI suggestions, tag input, and inline action buttons.

## Prerequisites

- **01-inbox-types.md** — Type definitions
- **03-type-icons.md** — Type badge (pill variant)
- **06-type-renderers.md** — Preview components

## What We're Building

A vertical stack of large cards where each shows:
- Type badge (pill style)
- Full title
- Complete preview content (not truncated)
- AI filing suggestion (if confident)
- Tag management
- Full action bar (File, Open, Snooze, Delete)

## Placement

| What | Where |
|------|-------|
| ExpandedView | `src/renderer/src/components/inbox/expanded-view.tsx` (NEW) |
| ExpandedCard | `src/renderer/src/components/inbox/expanded-card.tsx` (NEW) |

## Specifications

### Card Layout

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  🔗  LINK                                          2 hours ago │
│                                                                │
│  How to Build a Second Brain — Forte Labs                      │
│  fortelabs.com                                                 │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │                    [Hero Image]                          │  │
│  │                    Full Width                            │  │
│  │                    ~200px height                         │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  The PARA method helps you organize information by            │
│  actionability. Instead of organizing by topic, you           │
│  organize by how actionable each piece of information is.     │
│  This approach aligns perfectly with how our brains work...   │
│                                                                │
│  ───────────────────────────────────────────────────────────   │
│                                                                │
│  ✨ AI Suggestion: 85% confident                               │
│  📁 Research / PKM Methods                     [Accept] [✗]    │
│                                                                │
│  ───────────────────────────────────────────────────────────   │
│                                                                │
│  🏷️ Tags: [productivity] [pkm] [+ Add]                        │
│                                                                │
│  ───────────────────────────────────────────────────────────   │
│                                                                │
│  [📁 File to Folder]  [🔗 Open Original]  [🕐 Snooze]  [🗑️]    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Card Sections

**1. Header Row**
- Left: Type badge (pill style) — `[ 🔗 LINK ]`
- Right: Timestamp — "2 hours ago"

**2. Title Section**
- Title: Large, `text-xl font-semibold`
- Subtitle: Source/domain (for links)

**3. Content Area**
- Full preview content (images full-width, text not truncated)
- Uses expanded variants of type renderers
- For links: Full hero image + complete excerpt
- For notes: Full text (up to reasonable limit)
- For voice: Larger waveform + complete transcription

**4. AI Suggestion (Conditional)**
- Only shows if AI has confidence ≥50%
- Shows suggested folder path
- Accept button applies suggestion
- Dismiss (✗) hides the suggestion

**5. Tags Section**
- Current tags as pills
- Remove button on each tag
- Add tag button opens input

**6. Action Bar**
- Full-width button row
- All actions always visible (not hover-dependent)

### AI Suggestion Display

**High Confidence (≥80%):**
```
✨ AI Suggestion: 85% confident
📁 Research / PKM Methods
Similar items filed here: 3

[Accept]  [Choose Different]
```

**Medium Confidence (50-79%):**
```
💡 Possible destinations:
• 📁 Research / PKM Methods
• 📁 Work / References

[Choose a Folder]
```

**Low/No Confidence (<50%):**
Section not shown — user manually selects.

### Tags Management

```
🏷️ Tags: [productivity ✕] [pkm ✕] [learning ✕] [+ Add tag]
```

- Existing tags shown as pills with remove (✕) button
- "+ Add tag" opens inline input
- Autocomplete from existing tags
- Press Enter to add

### Action Bar

```
[📁 File to Folder]  [🔗 Open Original]  [🕐 Snooze]  [🗑️ Delete]
```

| Button | Icon | Action |
|--------|------|--------|
| File to Folder | FolderInput | Opens filing panel |
| Open Original | ExternalLink | Opens source URL (links) or file |
| Snooze | Clock | Opens snooze menu |
| Delete | Trash2 | Confirms then deletes |

- "Open Original" only for links/files with URL
- Delete has confirmation before action

### Card Styling

| Element | Style |
|---------|-------|
| Card | `rounded-xl border bg-card p-6` |
| Card shadow | `shadow-sm` |
| Between cards | `gap-6` (24px) |
| Section dividers | `border-t border-border/50 my-4 pt-4` |
| Type pill | `bg-{type}-50 text-{type}-600 px-3 py-1 rounded-full text-sm` |
| Title | `text-xl font-semibold` |
| Buttons | shadcn Button, `variant="outline"` for secondary |

### List Behavior

- Shows fewer items per screen (1-2 visible at a time)
- Smooth scroll snap (optional)
- Current/focused card slightly elevated
- Previous/next items visible at edges

## Design System Alignment

| Element | Style |
|---------|-------|
| Card bg | `bg-card` (white/cream) |
| Card radius | `rounded-xl` |
| Card padding | `p-6` |
| Type pill | Uses bgTint from type config |
| AI badge | `text-amber-600` for sparkle icon |
| Dividers | `border-border/50` |
| Action buttons | `variant="outline" size="sm"` |

## Acceptance Criteria

- [ ] ExpandedView renders cards vertically
- [ ] Cards show type pill badge
- [ ] Cards show full preview content
- [ ] AI suggestion appears when confident
- [ ] Accept button files to suggested folder
- [ ] Dismiss button hides suggestion
- [ ] Tags section shows current tags
- [ ] Can add/remove tags inline
- [ ] Action bar has all 4 buttons
- [ ] Actions trigger correct behaviors
- [ ] Cards have proper spacing and dividers
- [ ] Smooth scrolling between cards

## Next Prompt

**08-view-switcher.md** — Build the toggle component to switch between views.
