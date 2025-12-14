# 03 — Type Icon & Color System

## Objective

Create a centralized system that maps each inbox item type to its icon and color. This ensures consistent visual identification across all views (compact, medium, expanded).

## Prerequisites

- **01-inbox-types.md** — `InboxItemType` must be defined

## What We're Building

A utility module that provides:
- Icon component mapping for each type
- Color tokens for each type (icon color + background tint)
- A reusable `TypeBadge` component for displaying type indicators
- Helper functions to get icon/color by type

## Placement

| What | Where |
|------|-------|
| Type config mapping | `src/renderer/src/lib/inbox-type-config.ts` (NEW) |
| TypeBadge component | `src/renderer/src/components/inbox/type-badge.tsx` (NEW) |

## Specifications

### Type → Icon Mapping

| Type | Lucide Icon | Rationale |
|------|-------------|-----------|
| `link` | `Link2` | Chain link represents URLs |
| `note` | `FileText` | Document with text |
| `image` | `Image` | Picture frame |
| `voice` | `Mic` | Microphone for audio |
| `pdf` | `FileText` | Same as note but different color |
| `webclip` | `Scissors` | Clipping/cutting action |
| `file` | `File` | Generic file |
| `video` | `Video` | Video camera/frame |

### Type → Color Mapping

Each type has two colors:
1. **Icon color** — Used for the icon itself
2. **Background tint** — Subtle bg for cards (only in medium/expanded views)

| Type | Icon Color | Background Tint |
|------|------------|-----------------|
| `link` | `text-blue-500` | `bg-blue-50` |
| `note` | `text-amber-600` | `bg-amber-50` |
| `image` | `text-emerald-500` | `bg-emerald-50` |
| `voice` | `text-violet-500` | `bg-violet-50` |
| `pdf` | `text-red-500` | `bg-red-50` |
| `webclip` | `text-cyan-500` | `bg-cyan-50` |
| `file` | `text-stone-500` | `bg-stone-50` |
| `video` | `text-pink-500` | `bg-pink-50` |

### Config Object Structure

Create a configuration object that components can import:

```
INBOX_TYPE_CONFIG = {
  link: {
    icon: Link2,
    label: 'Link',
    iconColor: 'text-blue-500',
    bgTint: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  note: { ... },
  // ... etc
}
```

### TypeBadge Component

A reusable badge component that displays the type icon with optional label.

**Variants:**
1. **Icon only** — Just the icon with color (for compact view)
2. **Icon + Label** — Icon with "LINK" text (for expanded view header)
3. **Pill style** — Icon in a colored pill background

**Props:**
- `type`: InboxItemType — required
- `variant`: 'icon' | 'label' | 'pill' — default 'icon'
- `size`: 'sm' | 'md' | 'lg' — icon size
- `showBackground`: boolean — whether to show bg tint

### Helper Functions

```
getTypeIcon(type: InboxItemType) → LucideIcon component
getTypeColor(type: InboxItemType) → { icon: string, bg: string }
getTypeLabel(type: InboxItemType) → string (capitalized)
```

### Usage Examples

**In Compact View:**
```
<TypeBadge type={item.type} variant="icon" size="sm" />
```

**In Medium View:**
```
<TypeBadge type={item.type} variant="icon" size="md" showBackground />
```

**In Expanded View Header:**
```
<TypeBadge type={item.type} variant="pill" />
→ Renders: [ 🔗 LINK ] pill with blue background
```

## Design System Alignment

- Use Tailwind color classes (not hex values)
- Colors chosen to complement the warm beige background
- Subtle `50` variants for backgrounds (don't overwhelm)
- `500-600` variants for icons (good contrast)
- Follow existing icon sizing: `size-4` (16px), `size-5` (20px)

## Acceptance Criteria

- [ ] `INBOX_TYPE_CONFIG` object with all 8 types
- [ ] Each type has icon, label, iconColor, bgTint defined
- [ ] `getTypeIcon()` function returns correct Lucide component
- [ ] `getTypeColor()` function returns color class strings
- [ ] `TypeBadge` component renders correctly
- [ ] TypeBadge supports all 3 variants (icon, label, pill)
- [ ] TypeBadge supports size prop
- [ ] Colors are visually distinct from each other
- [ ] All icons imported from lucide-react

## Next Prompt

**04-compact-view.md** — Build the compact list view using the type icons.
