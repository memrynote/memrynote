# 09 - Empty States

## Objective

Implement the three empty state variants for the inbox: Getting Started (first-time users), Inbox Zero (all processed), and Returning Empty (has history but empty now). Each state provides contextual guidance and appropriate calls-to-action.

---

## Context

Empty states are critical for user experience because they:
- Guide new users on how to get started
- Celebrate accomplishments (inbox zero)
- Provide context about snoozed items
- Prevent confusion about why no items appear

**Dependencies:**
- 01-foundation-types

**Blocks:** 18-page-integration

---

## Specifications

From inbox-layouts.md, there are three distinct empty states:

### State 1: Getting Started (First Time)
**Trigger:** No items ever captured, no filing history

- Large inbox icon
- "Your inbox is ready" heading
- List of capture methods
- Primary CTA: "Try Pasting Something"
- Ghost preview of what items look like

### State 2: Inbox Zero (All Processed)
**Trigger:** Items exist in filing history, inbox currently empty

- Celebration emoji/icon
- "Inbox Zero!" heading
- Statistics for the day
- Secondary CTA: "Capture Something New"

### State 3: Returning Empty
**Trigger:** Has filing history, inbox empty, has snoozed items

- Mailbox empty icon
- "Nothing new in inbox" heading
- List of upcoming snoozed items
- CTA: "View Snoozed" or "Add New Item"

---

## Implementation Guide

### File Location

Create: `src/renderer/src/components/inbox/empty-state.tsx`

### EmptyState Component

```tsx
// src/renderer/src/components/inbox/empty-state.tsx

import {
  Inbox,
  Sparkles,
  MailOpen,
  Clipboard,
  MousePointerClick,
  Globe,
  Mic,
  FolderInput,
  Trash2,
  Clock,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type EmptyStateVariant = 'first-time' | 'inbox-zero' | 'returning-empty'

interface InboxStats {
  filed: number
  deleted: number
  snoozed: number
  avgProcessingTime: number // in seconds
}

interface SnoozedItemPreview {
  id: string
  title: string
  type: string
  returnsAt: Date
}

interface EmptyStateProps {
  variant: EmptyStateVariant
  stats?: InboxStats
  snoozedItems?: SnoozedItemPreview[]
  onCapture?: () => void
  onViewSnoozed?: () => void
  onAddNew?: () => void
}

export function EmptyState({
  variant,
  stats,
  snoozedItems = [],
  onCapture,
  onViewSnoozed,
  onAddNew,
}: EmptyStateProps): React.JSX.Element {
  switch (variant) {
    case 'first-time':
      return <FirstTimeState onCapture={onCapture} />
    case 'inbox-zero':
      return <InboxZeroState stats={stats} onCapture={onCapture} />
    case 'returning-empty':
      return (
        <ReturningEmptyState
          snoozedItems={snoozedItems}
          onViewSnoozed={onViewSnoozed}
          onAddNew={onAddNew}
        />
      )
  }
}

// =============================================================================
// STATE 1: FIRST TIME
// =============================================================================

function FirstTimeState({
  onCapture,
}: {
  onCapture?: () => void
}): React.JSX.Element {
  const captureOptions = [
    { icon: Clipboard, label: 'Paste anything', shortcut: 'Cmd+V' },
    { icon: MousePointerClick, label: 'Drag & drop files', shortcut: 'or click' },
    { icon: Globe, label: 'Save from browser', shortcut: 'Extension' },
    { icon: Mic, label: 'Record a thought', shortcut: 'Cmd+Shift+R' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-4">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <Inbox className="w-10 h-10 text-muted-foreground" />
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-semibold mb-2">Your inbox is ready</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Capture ideas, links, and files from anywhere.
        They'll appear here until you're ready to organize.
      </p>

      {/* Capture Options */}
      <Card className="w-full max-w-md mb-8">
        <CardContent className="p-4 space-y-3">
          {captureOptions.map(({ icon: Icon, label, shortcut }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{label}</span>
              </div>
              <kbd className="px-2 py-1 text-xs bg-muted rounded text-muted-foreground">
                {shortcut}
              </kbd>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Primary CTA */}
      <Button size="lg" onClick={onCapture}>
        Try Pasting Something
      </Button>

      {/* Ghost Preview */}
      <div className="mt-12 w-full max-w-md opacity-40">
        <p className="text-xs text-muted-foreground mb-2 text-center">
          Preview: What items will look like
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="w-4 h-4 rounded bg-blue-200" />
            <span className="text-sm">Article title here...</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="w-4 h-4 rounded bg-amber-200" />
            <span className="text-sm">Note preview text...</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="w-4 h-4 rounded bg-emerald-200" />
            <div className="w-16 h-8 bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// STATE 2: INBOX ZERO
// =============================================================================

function InboxZeroState({
  stats,
  onCapture,
}: {
  stats?: InboxStats
  onCapture?: () => void
}): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-4">
      {/* Celebration Icon */}
      <div className="text-5xl mb-6">
        <Sparkles className="w-16 h-16 text-amber-400" />
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-semibold mb-2">Inbox Zero!</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        You've processed all {stats?.filed ?? 0 + (stats?.deleted ?? 0) + (stats?.snoozed ?? 0)} items today.
      </p>

      {/* Stats Card */}
      {stats && (
        <Card className="w-full max-w-sm mb-8">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>Today's Stats</span>
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <FolderInput className="h-4 w-4 text-muted-foreground" />
                  <span>{stats.filed} items filed</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                  <span>{stats.deleted} items deleted</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{stats.snoozed} items snoozed</span>
                </div>
              </div>
              {stats.avgProcessingTime > 0 && (
                <div className="pt-2 border-t mt-2">
                  <span className="text-xs text-muted-foreground">
                    Avg processing: {stats.avgProcessingTime}s per item
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info text */}
      <p className="text-sm text-muted-foreground mb-4">
        New items will appear here automatically.
      </p>

      {/* CTA */}
      <Button variant="outline" onClick={onCapture}>
        Capture Something New
      </Button>
    </div>
  )
}

// =============================================================================
// STATE 3: RETURNING EMPTY
// =============================================================================

function ReturningEmptyState({
  snoozedItems,
  onViewSnoozed,
  onAddNew,
}: {
  snoozedItems: SnoozedItemPreview[]
  onViewSnoozed?: () => void
  onAddNew?: () => void
}): React.JSX.Element {
  const formatReturnTime = (date: Date) => {
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 24) return 'returns today'
    if (diffDays === 1) return 'returns tomorrow'
    return `returns in ${diffDays} days`
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-4">
      {/* Icon */}
      <div className="text-5xl mb-6">
        <MailOpen className="w-16 h-16 text-muted-foreground" />
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-semibold mb-2">Nothing new in inbox</h2>

      {/* Snoozed Items Preview */}
      {snoozedItems.length > 0 && (
        <Card className="w-full max-w-md my-8">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3">
              Snoozed items returning soon:
            </h3>
            <div className="space-y-2">
              {snoozedItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="truncate max-w-[200px]">{item.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatReturnTime(item.returnsAt)}
                  </span>
                </div>
              ))}
            </div>
            {snoozedItems.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={onViewSnoozed}
              >
                View All Snoozed ({snoozedItems.length})
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Button onClick={onAddNew}>
        <Plus className="h-4 w-4 mr-2" />
        Add New Item
      </Button>
    </div>
  )
}
```

---

## Props Interface

```typescript
type EmptyStateVariant = 'first-time' | 'inbox-zero' | 'returning-empty'

interface EmptyStateProps {
  variant: EmptyStateVariant
  stats?: InboxStats              // For inbox-zero variant
  snoozedItems?: SnoozedItemPreview[] // For returning-empty variant
  onCapture?: () => void          // Opens capture dialog
  onViewSnoozed?: () => void      // Opens snoozed items view
  onAddNew?: () => void           // Opens add new item
}
```

---

## Determining Which Variant to Show

```typescript
// In inbox page component

function getEmptyStateVariant(
  items: InboxItem[],
  hasFilingHistory: boolean,
  snoozedItems: SnoozedItemPreview[]
): EmptyStateVariant | null {
  // If there are items, no empty state
  if (items.length > 0) return null

  // First time: no history at all
  if (!hasFilingHistory) return 'first-time'

  // Has snoozed items coming back
  if (snoozedItems.length > 0) return 'returning-empty'

  // All processed today
  return 'inbox-zero'
}
```

---

## Acceptance Criteria

- [ ] `empty-state.tsx` component created
- [ ] Three variants implemented: first-time, inbox-zero, returning-empty
- [ ] First-time shows capture options with keyboard shortcuts
- [ ] First-time shows ghost preview of items
- [ ] Inbox-zero shows celebration icon and stats
- [ ] Inbox-zero shows items filed/deleted/snoozed counts
- [ ] Returning-empty shows upcoming snoozed items
- [ ] All CTAs trigger appropriate callbacks
- [ ] Layout is centered and visually balanced
- [ ] Works well at different viewport sizes
- [ ] `pnpm typecheck` passes

---

## Visual Guidelines

| Variant | Primary Color | Icon | Emotion |
|---------|--------------|------|---------|
| First-time | Neutral | Inbox | Welcoming |
| Inbox-zero | Amber/Gold | Sparkles | Celebratory |
| Returning-empty | Muted | MailOpen | Informative |

---

## Testing

```tsx
// Test all three variants
function EmptyStateTest() {
  return (
    <div className="space-y-8 p-8">
      <div className="h-[600px] border rounded-lg">
        <EmptyState variant="first-time" onCapture={() => alert('Capture')} />
      </div>

      <div className="h-[600px] border rounded-lg">
        <EmptyState
          variant="inbox-zero"
          stats={{ filed: 8, deleted: 2, snoozed: 2, avgProcessingTime: 12 }}
        />
      </div>

      <div className="h-[600px] border rounded-lg">
        <EmptyState
          variant="returning-empty"
          snoozedItems={[
            { id: '1', title: 'Design article', type: 'link', returnsAt: new Date(Date.now() + 3600000) },
            { id: '2', title: 'Meeting notes', type: 'note', returnsAt: new Date(Date.now() + 86400000 * 3) },
          ]}
        />
      </div>
    </div>
  )
}
```
