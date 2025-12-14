# 03 - Type Icon System

## Objective

Create a centralized icon and color mapping system for the 8 inbox content types. This component provides visual consistency across all views (compact, medium, expanded) and enables instant visual recognition of content types.

---

## Context

Each content type has a designated:
- **Lucide icon** for identification
- **Icon color** for the icon itself
- **Background tint** for card/expanded views

This system must be reusable across:
- Compact view (icon only)
- Medium view (icon with optional background)
- Expanded view (icon badge with label)

**Dependencies:** 01-foundation-types (for InboxContentType)

**Blocks:** 04-compact-view, 05-medium-view, 07-expanded-view

---

## Specifications

From inbox-layouts.md:

```
+-------------------------------------------------------------+
|  TYPE        |  ICON          |  ICON COLOR       |  BG TINT    |
+-------------------------------------------------------------+
|  link        |  Link2         |  blue-500         |  blue-50    |
|  note        |  FileText      |  amber-600        |  amber-50   |
|  image       |  Image         |  emerald-500      |  emerald-50 |
|  voice       |  Mic           |  violet-500       |  violet-50  |
|  pdf         |  FileText      |  red-500          |  red-50     |
|  webclip     |  Scissors      |  cyan-500         |  cyan-50    |
|  file        |  File          |  stone-500        |  stone-50   |
|  video       |  Video         |  pink-500         |  pink-50    |
+-------------------------------------------------------------+

Note: Background tints are subtle (#50 variants) and only used in
Card/Expanded views. List view uses icon color only.
```

---

## Implementation Guide

### File Locations

1. **Config file:** `src/renderer/src/lib/inbox-type-config.ts`
2. **Component file:** `src/renderer/src/components/inbox/type-icon.tsx`

### Type Configuration

```typescript
// src/renderer/src/lib/inbox-type-config.ts

import {
  Link2,
  FileText,
  Image,
  Mic,
  Scissors,
  File,
  Video,
  type LucideIcon
} from 'lucide-react'
import type { InboxContentType } from '@/types/inbox'

export interface TypeConfig {
  icon: LucideIcon
  label: string
  iconColor: string      // Tailwind text color class
  bgColor: string        // Tailwind background color class (for cards)
  borderColor: string    // Tailwind border color class (for badges)
}

export const INBOX_TYPE_CONFIG: Record<InboxContentType, TypeConfig> = {
  link: {
    icon: Link2,
    label: 'Link',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  note: {
    icon: FileText,
    label: 'Note',
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  image: {
    icon: Image,
    label: 'Image',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  voice: {
    icon: Mic,
    label: 'Voice',
    iconColor: 'text-violet-500',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
  pdf: {
    icon: FileText,
    label: 'PDF',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  webclip: {
    icon: Scissors,
    label: 'Webclip',
    iconColor: 'text-cyan-500',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
  },
  file: {
    icon: File,
    label: 'File',
    iconColor: 'text-stone-500',
    bgColor: 'bg-stone-50 dark:bg-stone-950/30',
    borderColor: 'border-stone-200 dark:border-stone-800',
  },
  video: {
    icon: Video,
    label: 'Video',
    iconColor: 'text-pink-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    borderColor: 'border-pink-200 dark:border-pink-800',
  },
}

// Helper to get config for a type
export function getTypeConfig(type: InboxContentType): TypeConfig {
  return INBOX_TYPE_CONFIG[type]
}
```

### TypeIcon Component

```tsx
// src/renderer/src/components/inbox/type-icon.tsx

import { cn } from '@/lib/utils'
import type { InboxContentType } from '@/types/inbox'
import { getTypeConfig } from '@/lib/inbox-type-config'

type IconSize = 'sm' | 'md' | 'lg'
type IconVariant = 'icon-only' | 'with-bg' | 'badge'

interface TypeIconProps {
  type: InboxContentType
  size?: IconSize
  variant?: IconVariant
  className?: string
}

const SIZE_MAP: Record<IconSize, { icon: number; container: string }> = {
  sm: { icon: 14, container: 'h-5 w-5' },
  md: { icon: 16, container: 'h-6 w-6' },
  lg: { icon: 20, container: 'h-8 w-8' },
}

export function TypeIcon({
  type,
  size = 'md',
  variant = 'icon-only',
  className,
}: TypeIconProps): React.JSX.Element {
  const config = getTypeConfig(type)
  const Icon = config.icon
  const sizeConfig = SIZE_MAP[size]

  // Variant: icon-only (for compact list view)
  if (variant === 'icon-only') {
    return (
      <Icon
        size={sizeConfig.icon}
        className={cn(config.iconColor, className)}
      />
    )
  }

  // Variant: with-bg (for medium card view)
  if (variant === 'with-bg') {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-md',
          sizeConfig.container,
          config.bgColor,
          className
        )}
      >
        <Icon size={sizeConfig.icon} className={config.iconColor} />
      </div>
    )
  }

  // Variant: badge (for expanded view - icon + label)
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon size={12} className={config.iconColor} />
      <span className={config.iconColor}>{config.label}</span>
    </div>
  )
}
```

---

## Usage Examples

### Compact View (List Row)

```tsx
<div className="flex items-center gap-3">
  <TypeIcon type="link" size="sm" variant="icon-only" />
  <span>How to Build a Second Brain</span>
</div>
```

### Medium View (Card)

```tsx
<div className="flex items-start gap-3">
  <TypeIcon type="voice" size="md" variant="with-bg" />
  <div>
    <h3>Voice memo - Project ideas</h3>
    <p className="text-muted-foreground">2:34 duration</p>
  </div>
</div>
```

### Expanded View (Badge)

```tsx
<div className="flex items-center justify-between">
  <TypeIcon type="pdf" variant="badge" />
  <span className="text-muted-foreground">2 hours ago</span>
</div>
```

---

## Props Interface

```typescript
interface TypeIconProps {
  type: InboxContentType   // Which content type to display
  size?: 'sm' | 'md' | 'lg' // Icon size (default: 'md')
  variant?: 'icon-only' | 'with-bg' | 'badge' // Display style
  className?: string       // Additional CSS classes
}
```

---

## Acceptance Criteria

- [ ] Config file created at `src/renderer/src/lib/inbox-type-config.ts`
- [ ] Component created at `src/renderer/src/components/inbox/type-icon.tsx`
- [ ] All 8 content types have correct icon mapping
- [ ] All 8 content types have correct color mapping
- [ ] Dark mode colors work correctly (`dark:` variants)
- [ ] Three variants render correctly: icon-only, with-bg, badge
- [ ] Three sizes work: sm (14px), md (16px), lg (20px)
- [ ] `pnpm typecheck` passes
- [ ] Component is exported and importable

---

## Visual Reference

```
ICON-ONLY (compact view):
  [blue link icon] How to Build a Second Brain

WITH-BG (medium view):
  +---+
  |[i]|  Voice memo - Project ideas
  +---+  (icon on light violet background)

BADGE (expanded view):
  +------------------+
  | [icon] Link      |  (pill with background and border)
  +------------------+
```

---

## Testing

Create a simple test component to verify all types render:

```tsx
function TypeIconTest() {
  const types: InboxContentType[] = [
    'link', 'note', 'image', 'voice', 'pdf', 'webclip', 'file', 'video'
  ]

  return (
    <div className="p-8 space-y-8">
      <div className="flex gap-4">
        {types.map(type => (
          <TypeIcon key={type} type={type} variant="icon-only" />
        ))}
      </div>
      <div className="flex gap-4">
        {types.map(type => (
          <TypeIcon key={type} type={type} variant="with-bg" />
        ))}
      </div>
      <div className="flex gap-4 flex-wrap">
        {types.map(type => (
          <TypeIcon key={type} type={type} variant="badge" />
        ))}
      </div>
    </div>
  )
}
```
