# 14 — Filing Panel UI

## Objective

Build the slide-over panel that lets users file items to folders, apply tags, and see AI suggestions. This panel uses the data model from the previous prompt.

## Prerequisites

- **13-filing-data-model.md** — Folder/tag data structures
- **11-item-selection.md** — Selection state (for bulk filing)

## What We're Building

A slide-over panel with:
1. Item preview (what's being filed)
2. AI suggestion (if confident)
3. Folder tree navigation
4. Tag input
5. File action button

## Placement

| What | Where |
|------|-------|
| FilingPanel | `src/renderer/src/components/inbox/filing-panel.tsx` (NEW) |
| FolderTree | `src/renderer/src/components/inbox/folder-tree.tsx` (NEW) |
| TagInput | `src/renderer/src/components/inbox/tag-input.tsx` (NEW) |

## Specifications

### Panel Layout

```
╔═══════════════════════════════════════╗
║           FILE ITEM                    ║
║                                        ║
║  ─────────────────────────────────     ║
║                                        ║
║  🔗 How to Build a Second Brain        ║
║     fortelabs.com                      ║
║                                        ║
║  ─────────────────────────────────     ║
║                                        ║
║  ✨ AI Suggestion: 85%                 ║
║  📁 Research / PKM                     ║
║  Similar: 3 items here                 ║
║                    [Accept] [Choose]   ║
║                                        ║
║  ─────────────────────────────────     ║
║                                        ║
║  📁 Choose Folder                      ║
║                                        ║
║  ┌─────────────────────────────────┐   ║
║  │ 🔍 Search folders...            │   ║
║  └─────────────────────────────────┘   ║
║                                        ║
║  SUGGESTED                             ║
║  ├─ 📁 Research / PKM                  ║
║  └─ 📁 Work / References               ║
║                                        ║
║  RECENT                                ║
║  ├─ 📁 Work / Projects                 ║
║  └─ 📁 Personal                        ║
║                                        ║
║  ALL FOLDERS                           ║
║  ▸ Work                                ║
║  ▸ Personal                            ║
║  ▸ Research                            ║
║  ▸ Archive                             ║
║                                        ║
║  ─────────────────────────────────     ║
║                                        ║
║  🏷️ Tags                               ║
║  [productivity ✕] [pkm ✕] [+ Add]      ║
║                                        ║
║  ─────────────────────────────────     ║
║                                        ║
║         [Cancel]      [File]           ║
║                                        ║
╚═══════════════════════════════════════╝
```

### Panel Behavior

**Opening:**
- Slides in from right
- Width: `w-80` (320px) or `w-96` (384px)
- Overlay dims content behind

**Closing:**
- Click Cancel
- Click outside (on overlay)
- Press Escape
- After successful file action

---

### Section 1: Item Preview

Shows what's being filed:

```
║  🔗 How to Build a Second Brain        ║
║     fortelabs.com                      ║
```

- Type icon with color
- Title (truncated if long)
- Source/domain (for links)

**Bulk Filing:**
```
║  📁 Filing 5 items                     ║
║     3 links, 1 note, 1 image          ║
```

---

### Section 2: AI Suggestion

**High Confidence (≥80%):**

```
║  ✨ AI Suggestion                 85%  ║
║                                        ║
║  📁 Research / PKM                     ║
║                                        ║
║  Similar items here:                   ║
║  • Building a Zettelkasten             ║
║  • The BASB Method                     ║
║                                        ║
║         [Accept]  [Choose Different]   ║
```

**Medium Confidence (50-79%):**

```
║  💡 Possible destinations              ║
║                                        ║
║  • 📁 Research / PKM                   ║
║  • 📁 Work / References                ║
║                                        ║
║              [Choose a Folder]         ║
```

**Low/No Confidence:** Section hidden

---

### Section 3: Folder Selection

**Folder Search:**
```
┌─────────────────────────────────┐
│ 🔍 Search folders...            │
└─────────────────────────────────┘
```
- Filters folder list as user types
- Highlights matching text

**Folder Sections:**

1. **Suggested** — AI-suggested folders (top 2-3)
2. **Recent** — Last 5 used folders
3. **All Folders** — Full tree, expandable

**Folder Tree:**
```
▸ Work                    ← Click to expand
  ├─ 📁 Projects          ← Click to select
  │   ├─ 📁 Alpha
  │   └─ 📁 Beta
  └─ 📁 References
▸ Personal
```

- ▸/▾ toggles expand/collapse
- Click folder row to select it
- Selected folder highlighted
- Show full path on hover (tooltip)

---

### Section 4: Tag Input

```
║  🏷️ Tags                               ║
║  [productivity ✕] [pkm ✕] [+ Add tag]  ║
```

**Tag Pill:**
- Background: tag's color (light variant)
- Text: tag name
- ✕ button removes tag

**Add Tag Flow:**
1. Click "+ Add tag"
2. Input appears with autocomplete
3. Type to filter existing tags
4. Enter to add (creates if new)
5. Escape to cancel

**Autocomplete:**
```
[prod|                              ]
├─ productivity
├─ product-design
└─ + Create "prod"
```

---

### Section 5: Action Buttons

```
║         [Cancel]      [File]           ║
```

- **Cancel:** Closes panel, no changes
- **File:** Files item(s) to selected folder, applies tags

**File Button States:**
- Disabled if no folder selected
- Shows destination: "File to Research"
- Loading state during action

---

### Drag & Drop Support

Items can be dragged from inbox to sidebar folders:

**Drag Start:**
- Item shows drag preview
- Opacity reduced on original

**Valid Drop:**
- Folder highlights
- Border/scale change

**Drop:**
- Item filed to folder
- Toast: "Filed to Research" with Undo

---

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑/↓` | Navigate folder list |
| `Enter` | Select highlighted folder |
| `→` | Expand folder |
| `←` | Collapse folder |
| `Tab` | Move to next section |
| `Escape` | Close panel |

---

### Component Props

```
interface FilingPanelProps {
  isOpen: boolean
  onClose: () => void
  items: InboxItem[]           // Items to file (1 or more)
  folders: Folder[]
  tags: Tag[]
  recentFolders: string[]
  aiSuggestion?: FolderSuggestion
  onFile: (folderId: string, tagIds: string[]) => void
}
```

## Design System Alignment

| Element | Style |
|---------|-------|
| Panel | `bg-background border-l shadow-xl` |
| Panel width | `w-80` or `w-96` |
| Section headers | `text-xs font-medium text-muted-foreground uppercase` |
| Folder row | `py-2 px-3 rounded-md hover:bg-accent cursor-pointer` |
| Selected folder | `bg-accent` |
| Tag pill | Uses tag's color config |
| Dividers | `border-t border-border my-4` |

### Using shadcn Components

- `Sheet` for the slide-over panel
- `Input` for search and tag input
- `Button` for actions
- `Badge` for tags
- `Command` for folder tree (optional)

## Acceptance Criteria

- [ ] Panel slides in from right
- [ ] Shows item being filed
- [ ] Shows AI suggestion when confident
- [ ] Accept button files to suggested folder
- [ ] Folder search filters results
- [ ] Suggested folders section shows AI picks
- [ ] Recent folders section shows history
- [ ] Folder tree expands/collapses
- [ ] Click selects folder
- [ ] Tag pills display with colors
- [ ] Can add tags with autocomplete
- [ ] Can remove tags
- [ ] File button disabled without selection
- [ ] File action closes panel
- [ ] Toast shows after filing
- [ ] Escape closes panel

## Next Prompt

**15-snooze-feature.md** — Build the snooze system for deferring items.
