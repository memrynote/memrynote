# 09 — Empty State Variants

## Objective

Build three distinct empty states for the inbox, each triggered by different conditions. Good empty states guide users on what to do next and celebrate achievements.

## Prerequisites

- **02-page-shell.md** — Page structure (content area)

## What We're Building

Three empty state components:
1. **Getting Started** — First time, no items ever
2. **Inbox Zero** — All items processed today
3. **Returning Empty** — Has history, currently empty

Plus logic to determine which state to show.

## Placement

| What | Where |
|------|-------|
| EmptyState components | `src/renderer/src/components/inbox/empty-states/` (NEW directory) |
| Getting started | `getting-started.tsx` |
| Inbox zero | `inbox-zero.tsx` |
| Returning empty | `returning-empty.tsx` |
| State selector | `empty-state.tsx` (dispatcher) |

## Specifications

### State Selection Logic

```
if (items.length === 0) {
  if (!hasFilingHistory && !hasDeleteHistory) {
    return <GettingStarted />
  } else if (itemsProcessedToday > 0) {
    return <InboxZero processedCount={itemsProcessedToday} />
  } else {
    return <ReturningEmpty snoozedItems={snoozedItems} />
  }
}
```

---

### 1. Getting Started State

**Trigger:** No items ever captured, no filing history.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                         ┌─────────────┐                              │
│                         │   📥        │                              │
│                         │   Inbox     │                              │
│                         └─────────────┘                              │
│                                                                      │
│                    Your inbox is ready                               │
│                                                                      │
│            Capture ideas, links, and files from anywhere.            │
│            They'll appear here until you're ready to organize.       │
│                                                                      │
│           ╭──────────────────────────────────────────────╮           │
│           │  📋  Paste anything          ⌘V              │           │
│           │  🖱️  Drag & drop files       or click        │           │
│           │  🌐  Save from browser       Extension       │           │
│           │  🎤  Record a thought        ⌘⇧R             │           │
│           ╰──────────────────────────────────────────────╯           │
│                                                                      │
│                    [ Try Pasting Something ]                         │
│                                                                      │
│      ┌──────────────────────────────────────────────────────────┐    │
│      │  Preview: What items will look like                      │    │
│      │   🔗  Article title here...                              │    │
│      │   📝  Note preview text...                               │    │
│      │   🖼️  [image thumbnail placeholder]                      │    │
│      └──────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Elements:**
- Large inbox icon (can be animated)
- Headline: "Your inbox is ready"
- Subtext explaining the concept
- Capture methods list with shortcuts
- Primary CTA button
- Ghost preview showing what items will look like

**CTA Action:** Focus on paste listener or open capture dialog

---

### 2. Inbox Zero State

**Trigger:** Items exist in history, inbox currently empty, processed items today.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                           ✨                                         │
│                                                                      │
│                      Inbox Zero!                                     │
│                                                                      │
│               You've processed all 12 items today.                   │
│                                                                      │
│                  ┌────────────────────────────┐                      │
│                  │  📊  Today's Stats          │                      │
│                  │                            │                      │
│                  │  📁 8 items filed          │                      │
│                  │  🗑️ 2 items deleted        │                      │
│                  │  🕐 2 items snoozed        │                      │
│                  │                            │                      │
│                  │  ⏱️ Avg time: 12s/item     │                      │
│                  └────────────────────────────┘                      │
│                                                                      │
│              New items will appear here automatically.               │
│                                                                      │
│                   [ Capture Something New ]                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Elements:**
- Celebration emoji (✨ or 🎉)
- "Inbox Zero!" headline
- Count of items processed today
- Stats card: filed/deleted/snoozed counts
- Average processing time (optional)
- Reassurance message
- Secondary CTA to capture new item

**Animation:** Subtle confetti or sparkle animation on first appearance

---

### 3. Returning Empty State

**Trigger:** Has history, inbox empty, returning after time away (no items processed today).

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                         📭                                           │
│                                                                      │
│                   Nothing new in inbox                               │
│                                                                      │
│         ┌─────────────────────────────────────────────────┐          │
│         │  Snoozed items returning soon:                  │          │
│         │                                                 │          │
│         │  🔗  Design article — returns tomorrow          │          │
│         │  📝  Meeting notes — returns in 3 days          │          │
│         │                                                 │          │
│         │                    [View Snoozed]               │          │
│         └─────────────────────────────────────────────────┘          │
│                                                                      │
│                    [ + Add New Item ]                                │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Elements:**
- Empty mailbox icon (📭)
- "Nothing new in inbox" headline
- Snoozed items preview (if any)
  - Shows next 2-3 items returning
  - "View Snoozed" link
- Simple CTA to add new item

**Conditional:** Snoozed section only shows if snoozed items exist.

---

### Props Interface

```
interface EmptyStateProps {
  type: 'getting-started' | 'inbox-zero' | 'returning'
  stats?: {
    processedToday: number
    filedToday: number
    deletedToday: number
    snoozedToday: number
  }
  snoozedItems?: SnoozedItem[]
  onCapture?: () => void
}
```

### Animation Considerations

- Entry animations: fade in + slight scale up
- Exit animations: fade out when items appear
- Inbox Zero: optional celebratory animation
- Respect `prefers-reduced-motion`

## Design System Alignment

| Element | Style |
|---------|-------|
| Container | `flex flex-col items-center justify-center min-h-[400px]` |
| Icon | `size-16 text-muted-foreground` |
| Headline | `text-2xl font-semibold mt-4` |
| Subtext | `text-muted-foreground text-center max-w-md mt-2` |
| Stats card | `bg-muted/50 rounded-lg p-4 mt-6` |
| CTA button | Primary button, centered |
| Ghost preview | `opacity-50 border-dashed` styling |

## Acceptance Criteria

- [ ] EmptyState dispatcher selects correct variant
- [ ] GettingStarted shows capture methods
- [ ] GettingStarted shows ghost preview
- [ ] InboxZero shows celebration message
- [ ] InboxZero shows today's stats
- [ ] ReturningEmpty shows snoozed preview
- [ ] All states are centered and well-spaced
- [ ] CTA buttons are functional
- [ ] Animations respect reduced motion
- [ ] Transitions smooth when items arrive/leave

## Next Prompt

**10-search-filtering.md** — Build the search input and filter system.
