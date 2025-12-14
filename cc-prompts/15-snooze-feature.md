# 15 — Snooze System

## Objective

Build the snooze feature that lets users defer items to a later time. Snoozed items disappear from the inbox and return automatically when the snooze period ends.

## Prerequisites

- **01-inbox-types.md** — Item with `snoozedUntil` property
- **12-bulk-actions.md** — Snooze button in action bar

## What We're Building

1. **Snooze Menu** — Time selection dropdown
2. **Snoozed Indicator** — Badge showing snoozed count
3. **Snoozed Popover** — List of snoozed items
4. **Return Animation** — Items returning to inbox
5. **Snooze Logic** — Data model and utilities

## Placement

| What | Where |
|------|-------|
| SnoozeMenu | `src/renderer/src/components/inbox/snooze-menu.tsx` (NEW) |
| SnoozedIndicator | `src/renderer/src/components/inbox/snoozed-indicator.tsx` (NEW) |
| Snooze utils | `src/renderer/src/lib/snooze-utils.ts` (NEW) |

## Specifications

### Snooze Menu

Triggered from item actions or bulk action bar:

```
┌─────────────────────────────┐
│  🕐  Snooze until...        │
│                             │
│  ○ Later today    (6 PM)    │
│  ○ Tomorrow       (9 AM)    │
│  ○ This weekend   (Sat 10AM)│
│  ○ Next week      (Mon 9AM) │
│  ─────────────────────────  │
│  ○ Pick date & time...      │
│                             │
└─────────────────────────────┘
```

### Snooze Options

| Option | Calculated Time |
|--------|-----------------|
| Later today | Today at 6 PM (or +3 hours if after 3 PM) |
| Tomorrow | Tomorrow at 9 AM |
| This weekend | Next Saturday at 10 AM |
| Next week | Next Monday at 9 AM |
| Pick date | Opens date/time picker |

### Time Calculation Logic

```
// Later today
if (currentHour < 15) {
  return today at 18:00
} else {
  return now + 3 hours
}

// Tomorrow
return tomorrow at 09:00

// This weekend
const saturday = next Saturday
return saturday at 10:00

// Next week
const monday = next Monday
return monday at 09:00
```

---

### Snooze Data Model

```
// On InboxItem:
interface InboxItem {
  // ... existing
  snoozedUntil: Date | null    // null = not snoozed
  snoozedAt: Date | null       // When snooze was set
}
```

### Snoozed Item State

```
interface SnoozedItem extends InboxItem {
  snoozedUntil: Date           // Non-null when snoozed
  snoozedAt: Date
  timeUntilReturn: string      // "2 hours", "Tomorrow"
}
```

---

### Filtering Snoozed Items

```
// Inbox shows only non-snoozed items
const visibleItems = items.filter(item => {
  if (!item.snoozedUntil) return true
  return item.snoozedUntil <= now  // Return if snooze expired
})

// Snoozed items list
const snoozedItems = items.filter(item =>
  item.snoozedUntil && item.snoozedUntil > now
)
```

---

### Snoozed Indicator (Header)

Shows in header when items are snoozed:

```
│  Inbox  ○ 24 items · 3 snoozed                               │
                           ↑
                    Click to show popover
```

**Badge:** `3 snoozed` as clickable text/badge

---

### Snoozed Popover

Click indicator to show snoozed items:

```
┌─────────────────────────────────────┐
│  🕐  Snoozed Items                  │
│                                     │
│  Returning today (2)                │
│  ├─ 🔗 Design article      6 PM     │
│  └─ 📝 Meeting notes       8 PM     │
│                                     │
│  Returning tomorrow (1)             │
│  └─ 🖼️ Whiteboard photo    9 AM     │
│                                     │
│  Returning later (2)                │
│  ├─ 🎤 Voice memo         Mon 9 AM  │
│  └─ 📄 Report             Jan 20    │
│                                     │
│              [View All Snoozed]     │
└─────────────────────────────────────┘
```

**Grouped by return time:**
- Returning today
- Returning tomorrow
- Returning later

**Item row:** Type icon + title + return time

**Actions:**
- Click item → Opens preview
- "View All Snoozed" → Shows full list (modal or dedicated view)

---

### Unsnooze Action

From snoozed popover, can unsnooze early:

```
│  🔗 Design article      6 PM  [Unsnooze] │
```

Unsnooze immediately returns item to inbox.

---

### Return Animation

When snooze expires, item returns with visual flair:

```
┌────────────────────────────────────────────────────────────────┐
│  🔔  Snoozed item returned                              [✕]   │
│                                                                │
│  □  🔗  Design article                                        │
│        Snoozed 2 days ago                                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Item appears at top of inbox
- Highlighted background (fades after 5 seconds)
- Shows "Snoozed X ago" instead of capture time
- Optional: Desktop notification

**Check interval:**
- Poll every minute for expired snoozes
- Or use setTimeout for next expiring item

---

### Snooze Utilities

```
// Calculate snooze times
getSnoozeOptions(): SnoozeOption[]
calculateSnoozeTime(option: string): Date

// Check snooze status
isItemSnoozed(item: InboxItem): boolean
getTimeUntilReturn(item: InboxItem): string
getSnoozedItems(items: InboxItem[]): SnoozedItem[]
getReturningItems(items: InboxItem[]): InboxItem[]  // Expired snoozes

// Actions
snoozeItem(item: InboxItem, until: Date): InboxItem
unsnoozeItem(item: InboxItem): InboxItem
```

---

### Format Return Time

| Time Until | Display |
|------------|---------|
| < 1 hour | "in 45 minutes" |
| Today | "Today at 6 PM" |
| Tomorrow | "Tomorrow at 9 AM" |
| This week | "Wednesday at 9 AM" |
| Later | "Jan 20 at 9 AM" |

---

### Keyboard Shortcut

- `s` — Opens snooze menu for focused/selected item(s)

## Design System Alignment

| Element | Style |
|---------|-------|
| Snooze menu | `w-64 p-2 rounded-lg shadow-lg` |
| Menu option | `py-2 px-3 hover:bg-accent rounded-md cursor-pointer` |
| Time hint | `text-muted-foreground text-sm` |
| Snoozed badge | `text-muted-foreground hover:text-foreground cursor-pointer` |
| Return highlight | `bg-amber-50 border-l-4 border-amber-400` |
| Clock icon | `text-amber-600` |

### Using shadcn Components

- `DropdownMenu` or `Popover` for snooze menu
- `Popover` for snoozed items list
- `Badge` for snoozed count
- `Calendar` for date picker (if custom date)

## Acceptance Criteria

- [ ] Snooze menu shows 5 time options
- [ ] "Later today" calculates correctly
- [ ] "Tomorrow" sets 9 AM next day
- [ ] "This weekend" finds Saturday
- [ ] "Next week" finds Monday
- [ ] Custom date opens picker
- [ ] Snoozed items hidden from inbox
- [ ] Snoozed count shows in header
- [ ] Snoozed popover lists items by return time
- [ ] Can unsnooze from popover
- [ ] Items return when snooze expires
- [ ] Return animation highlights item
- [ ] Return shows "Snoozed X ago"
- [ ] `s` shortcut opens snooze menu

## Next Prompt

**16-stale-items.md** — Build the stale items warning section.
