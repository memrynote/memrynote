# 14 - Snooze Feature

## Objective

Implement the complete snooze functionality including the snooze menu dropdown, snoozed items indicator in the header, snoozed items popover list, and the return animation when snoozed items come back to the inbox.

---

## Context

Snoozing allows users to defer items they are not ready to process:
- Quick preset times (later today, tomorrow, weekend, next week)
- Custom date/time picker
- Visual indicator of snoozed count
- Notification when items return

**Dependencies:**
- 01-foundation-types
- 12-item-selection
- 13-bulk-action-bar

**Blocks:** 18-page-integration

---

## Specifications

From inbox-layouts.md:

### Snooze Menu

```
On item hover or selection:

+----------------------------------------------------------------------+
|  [ ]  [link]  How to Build a Second Brain       [File] [clock] [...] |
|        fortelabs.com . 2 hours ago                     |             |
|                                                        v             |
|                                    +-------------------------+       |
|                                    |  Snooze until...        |       |
|                                    |                         |       |
|                                    |  o Later today  (6 PM)  |       |
|                                    |  o Tomorrow     (9 AM)  |       |
|                                    |  o This weekend (Sat)   |       |
|                                    |  o Next week    (Mon)   |       |
|                                    |  o Pick date...         |       |
|                                    |                         |       |
|                                    +-------------------------+       |
+----------------------------------------------------------------------+
```

### Snoozed Items Indicator

```
Header when items are snoozed:
+----------------------------------------------------------------------+
|                                                                      |
|  Inbox  o 24 items . 3 snoozed                                       |
|                          |                                           |
|                          +-- clickable, shows snoozed items list     |
+----------------------------------------------------------------------+

Snoozed items popover:
+-------------------------------------+
|  Snoozed Items                      |
|                                     |
|  Returning today (2)                |
|  |- [link] Design article    6 PM   |
|  +- [note] Meeting notes     8 PM   |
|                                     |
|  Returning tomorrow (1)             |
|  +- [image] Whiteboard       9 AM   |
|                                     |
|              [View All Snoozed]     |
+-------------------------------------+
```

### Return Animation

```
When snoozed item returns, slide in from top with highlight:

+----------------------------------------------------------------------+
|  +----------------------------------------------------------------+  |
|  |  [bell] Snoozed item returned                            [x]   |  |
|  |                                                                |  |
|  |  [ ]  [link]  Design article                                   |  |
|  |        Snoozed 2 days ago                                      |  |
|  |                                                                |  |
|  +----------------------------------------------------------------+  |
|                                                                      |
|  -------------------------------------------------------------------  |
|                                                                      |
|  [Regular inbox items below...]                                      |
+----------------------------------------------------------------------+
```

---

## Implementation Guide

### File Locations

1. **Snooze menu:** `src/renderer/src/components/inbox/snooze-menu.tsx`
2. **Snoozed indicator:** `src/renderer/src/components/inbox/snoozed-indicator.tsx`
3. **Return notification:** `src/renderer/src/components/inbox/snooze-return-banner.tsx`
4. **Utilities:** `src/renderer/src/lib/snooze-utils.ts`

### Snooze Utilities

```typescript
// src/renderer/src/lib/snooze-utils.ts

export interface SnoozeOption {
  label: string
  getDate: () => Date
  description: string
}

export function getSnoozeOptions(): SnoozeOption[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return [
    {
      label: 'Later today',
      description: formatTime(getLaterToday()),
      getDate: getLaterToday,
    },
    {
      label: 'Tomorrow',
      description: formatDate(getTomorrow()),
      getDate: getTomorrow,
    },
    {
      label: 'This weekend',
      description: formatDate(getThisWeekend()),
      getDate: getThisWeekend,
    },
    {
      label: 'Next week',
      description: formatDate(getNextWeek()),
      getDate: getNextWeek,
    },
  ]
}

function getLaterToday(): Date {
  const now = new Date()
  // Set to 6 PM today, or 2 hours from now if after 4 PM
  const sixPM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0)
  if (now.getHours() >= 16) {
    return new Date(now.getTime() + 2 * 60 * 60 * 1000)
  }
  return sixPM
}

function getTomorrow(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0)
}

function getThisWeekend(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntilSaturday,
    10,
    0
  )
}

function getNextWeek(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilMonday = (1 - dayOfWeek + 7) % 7 || 7
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntilMonday,
    9,
    0
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export function groupSnoozedByReturn(items: SnoozedItem[]): Map<string, SnoozedItem[]> {
  const groups = new Map<string, SnoozedItem[]>()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

  for (const item of items) {
    let key: string
    if (item.snoozedUntil < tomorrow) {
      key = 'Today'
    } else if (item.snoozedUntil < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
      key = 'Tomorrow'
    } else {
      key = formatDate(item.snoozedUntil)
    }

    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(item)
  }

  return groups
}
```

### SnoozeMenu Component

```tsx
// src/renderer/src/components/inbox/snooze-menu.tsx

import { useState } from 'react'
import { Clock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
import { getSnoozeOptions } from '@/lib/snooze-utils'

interface SnoozeMenuProps {
  onSnooze: (until: Date) => void
  trigger?: React.ReactNode
}

export function SnoozeMenu({ onSnooze, trigger }: SnoozeMenuProps): React.JSX.Element {
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [customDate, setCustomDate] = useState<Date | undefined>()
  const options = getSnoozeOptions()

  const handleCustomSnooze = () => {
    if (customDate) {
      onSnooze(customDate)
      setShowCustomPicker(false)
      setCustomDate(undefined)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Clock className="h-4 w-4" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">Snooze until...</p>
          </div>
          <DropdownMenuSeparator />

          {options.map((option) => (
            <DropdownMenuItem
              key={option.label}
              onClick={() => onSnooze(option.getDate())}
              className="flex justify-between"
            >
              <span>{option.label}</span>
              <span className="text-muted-foreground text-xs">
                {option.description}
              </span>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowCustomPicker(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Pick date...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Date Picker Dialog */}
      <Dialog open={showCustomPicker} onOpenChange={setShowCustomPicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose snooze date</DialogTitle>
          </DialogHeader>

          <div className="flex justify-center py-4">
            <CalendarPicker
              mode="single"
              selected={customDate}
              onSelect={setCustomDate}
              disabled={(date) => date < new Date()}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomPicker(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomSnooze} disabled={!customDate}>
              Snooze until {customDate?.toLocaleDateString()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

### SnoozedIndicator Component

```tsx
// src/renderer/src/components/inbox/snoozed-indicator.tsx

import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TypeIcon } from './type-icon'
import { groupSnoozedByReturn } from '@/lib/snooze-utils'
import type { InboxItem } from '@/types/inbox'

interface SnoozedIndicatorProps {
  snoozedItems: InboxItem[]
  onViewAll: () => void
  onUnsnooze: (id: string) => void
}

export function SnoozedIndicator({
  snoozedItems,
  onViewAll,
  onUnsnooze,
}: SnoozedIndicatorProps): React.JSX.Element | null {
  if (snoozedItems.length === 0) return null

  const grouped = groupSnoozedByReturn(
    snoozedItems.map((item) => ({
      ...item,
      snoozedUntil: item.snoozedUntil!,
    }))
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {snoozedItems.length} snoozed
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="start">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Snoozed Items
          </h4>
        </div>

        <div className="space-y-4 max-h-64 overflow-y-auto">
          {Array.from(grouped.entries()).map(([label, items]) => (
            <div key={label}>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Returning {label.toLowerCase()} ({items.length})
              </p>
              <div className="space-y-1">
                {items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TypeIcon type={item.type} size="sm" variant="icon-only" />
                      <span className="text-sm truncate">{item.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {item.snoozedUntil.toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-muted-foreground pl-2">
                    + {items.length - 3} more
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 mt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onViewAll}
          >
            View All Snoozed
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

### SnoozeReturnBanner Component

```tsx
// src/renderer/src/components/inbox/snooze-return-banner.tsx

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TypeIcon } from './type-icon'
import type { InboxItem } from '@/types/inbox'

interface SnoozeReturnBannerProps {
  item: InboxItem
  onDismiss: () => void
}

export function SnoozeReturnBanner({
  item,
  onDismiss,
}: SnoozeReturnBannerProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(true)
  const [isHighlighted, setIsHighlighted] = useState(true)

  // Auto-dismiss highlight after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHighlighted(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'mx-4 mt-4 mb-2 p-4 rounded-lg border-2 transition-all duration-500',
        isHighlighted
          ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
          : 'bg-muted/50 border-transparent'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell
            className={cn(
              'h-5 w-5 flex-shrink-0',
              isHighlighted ? 'text-amber-500' : 'text-muted-foreground'
            )}
          />
          <div>
            <p className="text-sm font-medium mb-1">Snoozed item returned</p>
            <div className="flex items-center gap-2">
              <TypeIcon type={item.type} size="sm" variant="icon-only" />
              <span className="text-sm">{item.title}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Snoozed {formatSnoozeDuration(item.snoozedAt)}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={() => {
            setIsVisible(false)
            onDismiss()
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function formatSnoozeDuration(snoozedAt: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - snoozedAt.getTime()
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return 'yesterday'
  return `${diffDays} days ago`
}
```

---

## Acceptance Criteria

- [ ] `snooze-menu.tsx` component created
- [ ] Menu shows 4 preset options with calculated times
- [ ] "Pick date" opens calendar dialog
- [ ] Custom date picker disables past dates
- [ ] `snoozed-indicator.tsx` component created
- [ ] Indicator shows count and is clickable
- [ ] Popover groups items by return date
- [ ] "View All Snoozed" button triggers callback
- [ ] `snooze-return-banner.tsx` component created
- [ ] Banner appears at top of inbox for returned items
- [ ] Banner highlight fades after 5 seconds
- [ ] Banner can be dismissed
- [ ] Snooze utilities calculate correct dates
- [ ] `pnpm typecheck` passes

---

## Snooze State Management

```typescript
interface SnoozedItem extends InboxItem {
  snoozedUntil: Date
  snoozedAt: Date
}

// Snooze an item
function snoozeItem(item: InboxItem, until: Date): SnoozedItem {
  return {
    ...item,
    snoozedUntil: until,
    snoozedAt: new Date(),
  }
}

// Check for returned items (run on interval or app focus)
function getReturnedItems(snoozedItems: SnoozedItem[]): SnoozedItem[] {
  const now = new Date()
  return snoozedItems.filter((item) => item.snoozedUntil <= now)
}
```

---

## Testing

```tsx
function SnoozeTest() {
  const [snoozed, setSnoozed] = useState<Date | null>(null)

  return (
    <div className="p-8 space-y-4">
      <SnoozeMenu onSnooze={setSnoozed} />

      {snoozed && (
        <p>Snoozed until: {snoozed.toLocaleString()}</p>
      )}
    </div>
  )
}
```
