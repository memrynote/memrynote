Prompt #23: Toast Notifications
The Prompt
You are building the Toast Notifications system for Memry's inbox. Toasts provide non-blocking feedback for user actions — confirmations, errors, warnings, and progress updates. They appear briefly, communicate status, and optionally allow undo or follow-up actions.

## What You Are Building

A toast notification system that includes:
1. **Success toasts** — Action completed successfully
2. **Error toasts** — Action failed, with retry option
3. **Warning toasts** — Action needs attention
4. **Info toasts** — Neutral information
5. **Loading toasts** — Action in progress
6. **Undo toasts** — Action completed with undo option
7. **Toast stacking** — Multiple toasts at once
8. **Progress toasts** — Long-running operations

---

## Toast Position & Container
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Header Bar                                                                                   │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Context Bar                                                                                  │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                          CONTENT AREA                                               │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                                                                                     │
│                                                                     ┌─────────────────────────────┐ │
│                                                                     │                             │ │
│                                                                     │      TOAST 1 (newest)       │ │
│                                                                     │                             │ │
│                                                                     └─────────────────────────────┘ │
│                                                                     ┌─────────────────────────────┐ │
│                                                                     │                             │ │
│                                                                     │      TOAST 2 (older)        │ │
│                                                                     │                             │ │
│                                                                     └─────────────────────────────┘ │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Quick Capture Bar                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Toast Container
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Toast Container:                                                           │
│                                                                             │
│  - Position: fixed                                                          │
│  - Bottom: 88px (above Quick Capture Bar)                                   │
│  - Right: 24px                                                              │
│  - Z-index: 100                                                             │
│  - Display: flex                                                            │
│  - Flex-direction: column-reverse (newest at bottom)                        │
│  - Gap: 12px                                                                │
│  - Pointer-events: none (container)                                         │
│  - Max-width: 400px                                                         │
│  - Max-height: calc(100vh - 200px)                                          │
│  - Overflow: hidden                                                         │
│                                                                             │
│  Individual toasts:                                                         │
│  - Pointer-events: auto                                                     │
│                                                                             │
│  Alternative positions (configurable):                                      │
│  - Top-right: top: 80px, right: 24px                                        │
│  - Top-center: top: 80px, left: 50%, transform: translateX(-50%)            │
│  - Bottom-center: bottom: 88px, left: 50%, transform: translateX(-50%)      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Toast Anatomy

### Base Toast Structure
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌────┐                                                       ┌────┐  │  │
│  │  │icon│   MESSAGE TEXT                                        │ ✕  │  │  │
│  │  │    │   ────────────                                        │    │  │  │
│  │  └────┘   Primary message content                             └────┘  │  │
│  │                                                                       │  │
│  │           Description text (optional)                                 │  │
│  │           ────────────────────────────                                │  │
│  │           Secondary supporting information                            │  │
│  │                                                                       │  │
│  │           ┌──────────────┐  ┌──────────────┐                          │  │
│  │           │   Action 1   │  │   Action 2   │                          │  │
│  │           └──────────────┘  └──────────────┘                          │  │
│  │           Optional action buttons                                     │  │
│  │                                                                       │  │
│  │  ════════════════════════════════════════════════════════════════════ │  │
│  │  Progress bar (for loading/progress toasts)                           │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Toast Dimensions
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Toast Card:                                                                │
│                                                                             │
│  - Width: 360px                                                             │
│  - Min-width: 300px                                                         │
│  - Max-width: 400px                                                         │
│  - Padding: 14px 16px                                                       │
│  - Background: white                                                        │
│  - Border: 1px solid gray-200                                               │
│  - Border-radius: 12px                                                      │
│  - Box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12),                              │
│                0 1px 4px rgba(0, 0, 0, 0.08)                                │
│                                                                             │
│  Layout:                                                                    │
│  - Display: flex                                                            │
│  - Gap: 12px                                                                │
│  - Align-items: flex-start                                                  │
│                                                                             │
│  Icon container:                                                            │
│  - Size: 24px × 24px                                                        │
│  - Flex-shrink: 0                                                           │
│  - Display: flex                                                            │
│  - Align-items: center                                                      │
│  - Justify-content: center                                                  │
│                                                                             │
│  Content area:                                                              │
│  - Flex: 1                                                                  │
│  - Min-width: 0                                                             │
│                                                                             │
│  Close button:                                                              │
│  - Size: 24px × 24px                                                        │
│  - Flex-shrink: 0                                                           │
│  - Border-radius: 6px                                                       │
│  - Background: transparent                                                  │
│  - Icon: 14px, gray-400                                                     │
│  - Hover: bg-gray-100, icon gray-600                                        │
│  - Margin-top: -2px (align with text)                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Toast Types

### 1. Success Toast
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌────┐                                                       ┌────┐  │  │
│  │  │ ✓  │   5 items archived                                    │ ✕  │  │  │
│  │  │    │                                                       │    │  │  │
│  │  └────┘                                                       └────┘  │  │
│  │  green                                                                │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Icon:                                                                      │
│  - Checkmark (✓) in circle                                                  │
│  - Color: green-600                                                         │
│  - Or: Background circle green-100, icon green-600                          │
│                                                                             │
│  Left accent (optional):                                                    │
│  - 3px left border: green-500                                               │
│                                                                             │
│  Message:                                                                   │
│  - Font-size: 14px                                                          │
│  - Font-weight: 500                                                         │
│  - Color: gray-900                                                          │
│                                                                             │
│  Auto-dismiss: 4 seconds                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### 2. Error Toast
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌────┐                                                       ┌────┐  │  │
│  │  │ ✕  │   Failed to archive items                             │ ✕  │  │  │
│  │  │    │                                                       │    │  │  │
│  │  └────┘   Please check your connection and try again.         └────┘  │  │
│  │  red                                                                  │  │
│  │           ┌─────────────┐                                             │  │
│  │           │  Try again  │                                             │  │
│  │           └─────────────┘                                             │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Icon:                                                                      │
│  - X mark or exclamation in circle                                          │
│  - Color: red-600                                                           │
│  - Background: red-100                                                      │
│                                                                             │
│  Left accent:                                                               │
│  - 3px left border: red-500                                                 │
│                                                                             │
│  Description:                                                               │
│  - Font-size: 13px                                                          │
│  - Color: gray-500                                                          │
│  - Margin-top: 4px                                                          │
│                                                                             │
│  Action button:                                                             │
│  - Margin-top: 12px                                                         │
│  - Height: 32px                                                             │
│  - Padding: 0 12px                                                          │
│  - Background: red-600                                                      │
│  - Color: white                                                             │
│  - Border-radius: 6px                                                       │
│  - Font-size: 13px                                                          │
│  - Font-weight: 500                                                         │
│  - Hover: bg-red-700                                                        │
│                                                                             │
│  Auto-dismiss: None (manual dismiss required)                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### 3. Warning Toast
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌────┐                                                       ┌────┐  │  │
│  │  │ ⚠  │   Large file detected                                 │ ✕  │  │  │
│  │  │    │                                                       │    │  │  │
│  │  └────┘   This file is 25MB. Upload may take a while.         └────┘  │  │
│  │  amber                                                                │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Icon:                                                                      │
│  - Warning triangle (⚠)                                                     │
│  - Color: amber-600                                                         │
│  - Background: amber-100                                                    │
│                                                                             │
│  Left accent:                                                               │
│  - 3px left border: amber-500                                               │
│                                                                             │
│  Auto-dismiss: 6 seconds                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### 4. Info Toast
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌────┐                                                       ┌────┐  │  │
│  │  │ ℹ  │   Tip: Use ⌘K to quickly search                       │ ✕  │  │  │
│  │  │    │                                                       │    │  │  │
│  │  └────┘                                                       └────┘  │  │
│  │  blue                                                                 │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Icon:                                                                      │
│  - Info "i" in circle                                                       │
│  - Color: blue-600                                                          │
│  - Background: blue-100                                                     │
│                                                                             │
│  Left accent:                                                               │
│  - 3px left border: blue-500                                                │
│                                                                             │
│  Auto-dismiss: 5 seconds                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### 5. Loading Toast
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌────┐                                                               │  │
│  │  │ ◠  │   Uploading image...                                          │  │
│  │  │    │                                                               │  │
│  │  └────┘                                                               │  │
│  │  spinner                                                              │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Icon:                                                                      │
│  - Animated spinner                                                         │
│  - Size: 20px                                                               │
│  - Color: gray-600                                                          │
│  - Animation: spin 1s linear infinite                                       │
│                                                                             │
│  Close button: Hidden (cannot dismiss loading toast)                        │
│                                                                             │
│  Auto-dismiss: None (dismissed programmatically when complete)              │
│                                                                             │
│  Transition: Can transition to success/error toast                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### 6. Progress Toast
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌────┐                                                       ┌────┐  │  │
│  │  │ ↑  │   Uploading 3 files                                   │ ✕  │  │  │
│  │  │    │                                                       │    │  │  │
│  │  └────┘   2 of 3 complete                                     └────┘  │  │
│  │                                                                       │  │
│  │  ┌────────────────────────────────────────────────────────────────┐   │  │
│  │  │████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │  │
│  │  └────────────────────────────────────────────────────────────────┘   │  │
│  │  Progress bar: 67%                                                    │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Icon:                                                                      │
│  - Upload arrow or relevant icon                                            │
│  - Color: blue-600                                                          │
│                                                                             │
│  Progress bar:                                                              │
│  - Height: 4px                                                              │
│  - Background: gray-200                                                     │
│  - Fill: blue-500                                                           │
│  - Border-radius: 2px                                                       │
│  - Margin-top: 12px                                                         │
│  - Transition: width 300ms ease                                             │
│                                                                             │
│  Close button: Visible (can cancel operation)                               │
│  - Clicking shows confirmation or cancels                                   │
│                                                                             │
│  Auto-dismiss: After completion + 2 seconds                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### 7. Undo Toast
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌────┐                                                               │  │
│  │  │ ✓  │   5 items archived                          [ Undo ]          │  │
│  │  │    │                                                               │  │
│  │  └────┘                                                               │  │
│  │  green                                              ─────────         │  │
│  │                                                     Action btn        │  │
│  │  ════════════════════════════════════════════════════════════════════ │  │
│  │  Countdown bar (shrinking left to right)                              │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Same as success toast, with:                                               │
│                                                                             │
│  Undo button:                                                               │
│  - Height: 28px                                                             │
│  - Padding: 0 12px                                                          │
│  - Background: transparent                                                  │
│  - Border: 1px solid gray-300                                               │
│  - Border-radius: 6px                                                       │
│  - Font-size: 13px                                                          │
│  - Font-weight: 500                                                         │
│  - Color: gray-700                                                          │
│  - Hover: bg-gray-50, border-gray-400                                       │
│                                                                             │
│  Countdown bar:                                                             │
│  - Height: 3px                                                              │
│  - Background: green-500                                                    │
│  - Position: absolute, bottom: 0, left: 0                                   │
│  - Width: animates from 100% to 0%                                          │
│  - Duration: matches auto-dismiss time (e.g., 8 seconds)                    │
│                                                                             │
│  Behavior:                                                                  │
│  - Hovering pauses the countdown                                            │
│  - Clicking Undo triggers undo action and dismisses                         │
│  - Auto-dismiss after countdown completes                                   │
│                                                                             │
│  Auto-dismiss: 8 seconds (longer to allow undo)                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Toast Actions

### Action Button Styles
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  PRIMARY ACTION (solid)                                                     │
│  ──────────────────────                                                     │
│                                                                             │
│  ┌─────────────────┐                                                        │
│  │   Try again     │                                                        │
│  └─────────────────┘                                                        │
│                                                                             │
│  - Background: contextual color (red-600 for error, blue-600 for info)      │
│  - Color: white                                                             │
│  - Font-weight: 500                                                         │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  SECONDARY ACTION (outlined)                                                │
│  ──────────────────────────                                                 │
│                                                                             │
│  ┌─────────────────┐                                                        │
│  │     Undo        │                                                        │
│  └─────────────────┘                                                        │
│                                                                             │
│  - Background: transparent                                                  │
│  - Border: 1px solid gray-300                                               │
│  - Color: gray-700                                                          │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  GHOST ACTION (text only)                                                   │
│  ────────────────────────                                                   │
│                                                                             │
│  Learn more →                                                               │
│                                                                             │
│  - Background: none                                                         │
│  - Color: blue-600                                                          │
│  - Underline on hover                                                       │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Multiple actions:                                                          │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                                   │
│  │   Try again     │  │    Dismiss      │                                   │
│  └─────────────────┘  └─────────────────┘                                   │
│  Primary               Secondary                                            │
│                                                                             │
│  Layout:                                                                    │
│  - Display: flex                                                            │
│  - Gap: 8px                                                                 │
│  - Margin-top: 12px                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Toast Stacking

### Multiple Toasts
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                   ┌─────────────────────────────────────┐   │
│                                   │                                     │   │
│                                   │  ✓  Note saved                      │   │
│                                   │                                     │   │
│                                   └─────────────────────────────────────┘   │
│                                   ┌─────────────────────────────────────┐   │
│                                   │                                     │   │
│                                   │  ✓  3 items archived      [ Undo ]  │   │
│                                   │  ═══════════════════════════════    │   │
│                                   │                                     │   │
│                                   └─────────────────────────────────────┘   │
│                                   ┌─────────────────────────────────────┐   │
│                                   │                                     │   │
│                                   │  ✕  Upload failed         [ Retry ] │   │
│                                   │     Connection lost                 │   │
│                                   │                                     │   │
│                                   └─────────────────────────────────────┘   │
│                                                                             │
│  Stacking behavior:                                                         │
│                                                                             │
│  - Newest toast appears at bottom                                           │
│  - Older toasts push up                                                     │
│  - Max visible: 5 toasts                                                    │
│  - If > 5, oldest auto-dismissed or collapsed                               │
│  - Gap between toasts: 12px                                                 │
│                                                                             │
│  Animation:                                                                 │
│  - New toast slides in from right                                           │
│  - Existing toasts slide up                                                 │
│  - Dismissed toasts slide out to right                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Collapsed State (Too Many Toasts)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                   ┌─────────────────────────────────────┐   │
│                                   │                                     │   │
│                                   │  ✓  Note saved                      │   │
│                                   │                                     │   │
│                                   └─────────────────────────────────────┘   │
│                                   ┌─────────────────────────────────────┐   │
│                                   │                                     │   │
│                                   │  ✓  3 items archived      [ Undo ]  │   │
│                                   │                                     │   │
│                                   └─────────────────────────────────────┘   │
│                                   ┌─────────────────────────────────────┐   │
│                                   │                                     │   │
│                                   │  + 3 more notifications             │   │
│                                   │                                     │   │
│                                   └─────────────────────────────────────┘   │
│                                                                             │
│  Collapsed indicator:                                                       │
│  - Shows when > max visible toasts                                          │
│  - Click expands to show all                                                │
│  - Or auto-expands when space available                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Animation

### Enter Animation
```css
@keyframes toastEnter {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-enter {
  animation: toastEnter 300ms cubic-bezier(0.21, 1.02, 0.73, 1);
}
```

### Exit Animation
```css
@keyframes toastExit {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.toast-exit {
  animation: toastExit 200ms ease-in forwards;
}
```

### Stack Reorder Animation
```css
.toast {
  transition: transform 200ms ease;
}

/* When a toast is dismissed, others slide down smoothly */
```

### Progress/Countdown Animation
```css
@keyframes countdown {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.toast-countdown-bar {
  animation: countdown var(--toast-duration) linear forwards;
}

.toast:hover .toast-countdown-bar {
  animation-play-state: paused;
}
```

### Spinner Animation
```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.toast-spinner {
  animation: spin 1s linear infinite;
}
```

---

## Toast State Management

### Toast Store
```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'progress';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;         // ms, null for persistent
  dismissible?: boolean;     // Show close button

  // Actions
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  onUndo?: () => void;       // Shorthand for undo action

  // Progress
  progress?: number;          // 0-100 for progress toasts

  // Callbacks
  onDismiss?: () => void;

  // Internal
  createdAt: number;
  pausedAt?: number;          // For pause-on-hover
}

interface ToastState {
  toasts: Toast[];
  maxVisible: number;
  position: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const DEFAULT_DURATIONS: Record<ToastType, number | null> = {
  success: 4000,
  error: null,      // Persistent until dismissed
  warning: 6000,
  info: 5000,
  loading: null,    // Persistent until updated
  progress: null,   // Persistent until complete
};
```

### Toast Hook
```typescript
interface ToastOptions {
  type?: ToastType;
  message: string;
  description?: string;
  duration?: number | null;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onUndo?: () => void;
}

interface UseToastResult {
  // Show toasts
  toast: (options: ToastOptions) => string;  // Returns toast ID
  success: (message: string, options?: Partial<ToastOptions>) => string;
  error: (message: string, options?: Partial<ToastOptions>) => string;
  warning: (message: string, options?: Partial<ToastOptions>) => string;
  info: (message: string, options?: Partial<ToastOptions>) => string;
  loading: (message: string) => string;

  // Update toasts
  update: (id: string, options: Partial<ToastOptions>) => void;
  updateProgress: (id: string, progress: number, message?: string) => void;

  // Dismiss toasts
  dismiss: (id: string) => void;
  dismissAll: () => void;

  // Promise helper
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => Promise<T>;
}

function useToast(): UseToastResult {
  const { addToast, updateToast, removeToast, clearToasts } = useToastStore();

  const toast = useCallback((options: ToastOptions): string => {
    const id = generateId();
    const type = options.type || 'info';

    addToast({
      id,
      type,
      message: options.message,
      description: options.description,
      duration: options.duration ?? DEFAULT_DURATIONS[type],
      dismissible: options.dismissible ?? true,
      action: options.action,
      onUndo: options.onUndo,
      createdAt: Date.now(),
    });

    return id;
  }, [addToast]);

  const success = useCallback((message: string, options?: Partial<ToastOptions>) => {
    return toast({ type: 'success', message, ...options });
  }, [toast]);

  const error = useCallback((message: string, options?: Partial<ToastOptions>) => {
    return toast({ type: 'error', message, dismissible: true, ...options });
  }, [toast]);

  const loading = useCallback((message: string) => {
    return toast({ type: 'loading', message, dismissible: false, duration: null });
  }, [toast]);

  const promise = useCallback(async <T>(
    promiseOrFn: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ): Promise<T> => {
    const id = loading(options.loading);

    try {
      const result = await promiseOrFn;
      const message = typeof options.success === 'function'
        ? options.success(result)
        : options.success;
      updateToast(id, { type: 'success', message, duration: 4000, dismissible: true });
      return result;
    } catch (err) {
      const message = typeof options.error === 'function'
        ? options.error(err as Error)
        : options.error;
      updateToast(id, { type: 'error', message, duration: null, dismissible: true });
      throw err;
    }
  }, [loading, updateToast]);

  return {
    toast,
    success,
    error,
    warning: (message, options) => toast({ type: 'warning', message, ...options }),
    info: (message, options) => toast({ type: 'info', message, ...options }),
    loading,
    update: updateToast,
    updateProgress: (id, progress, message) => updateToast(id, { progress, message }),
    dismiss: removeToast,
    dismissAll: clearToasts,
    promise,
  };
}
```

---

## Usage Examples

### Basic Usage
```typescript
const { success, error, warning, info, loading, dismiss, promise } = useToast();

// Simple success
success('Item saved');

// Success with undo
success('5 items archived', {
  onUndo: () => {
    unarchiveItems(itemIds);
  },
});

// Error with retry
error('Failed to save', {
  description: 'Please check your connection',
  action: {
    label: 'Try again',
    onClick: () => saveItem(),
  },
});

// Warning
warning('Large file detected', {
  description: 'Upload may take a while',
});

// Info
info('Tip: Use ⌘K to quickly search');

// Loading that updates
const toastId = loading('Uploading file...');
// ... later
dismiss(toastId);
success('File uploaded!');

// Promise helper (automatic loading → success/error)
promise(
  uploadFiles(files),
  {
    loading: 'Uploading files...',
    success: (result) => `${result.count} files uploaded`,
    error: 'Upload failed',
  }
);
```

### Progress Toast
```typescript
const { toast, updateProgress, dismiss } = useToast();

// Create progress toast
const toastId = toast({
  type: 'progress',
  message: 'Uploading 5 files',
  description: '0 of 5 complete',
  progress: 0,
});

// Update progress
for (let i = 0; i < files.length; i++) {
  await uploadFile(files[i]);
  updateProgress(toastId, ((i + 1) / files.length) * 100, {
    description: `${i + 1} of ${files.length} complete`,
  });
}

// Complete
update(toastId, {
  type: 'success',
  message: '5 files uploaded',
  description: undefined,
  progress: undefined,
  duration: 4000,
});
```

---

## Props Interface
```typescript
interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}

interface ToastContainerProps {
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  maxVisible?: number;
  gap?: number;
}

interface ToastProviderProps {
  children: React.ReactNode;
  defaultOptions?: Partial<ToastOptions>;
}
```

---

## Accessibility

### ARIA Attributes
```tsx
<div
  role="region"
  aria-label="Notifications"
  aria-live="polite"
  className="toast-container"
>
  {toasts.map(toast => (
    <div
      key={toast.id}
      role="alert"
      aria-atomic="true"
      className={`toast toast-${toast.type}`}
    >
      <div className="toast-icon" aria-hidden="true">
        {getIcon(toast.type)}
      </div>

      <div className="toast-content">
        <p className="toast-message">{toast.message}</p>
        {toast.description && (
          <p className="toast-description">{toast.description}</p>
        )}
      </div>

      {toast.dismissible && (
        <button
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="toast-close"
        >
          <XIcon aria-hidden="true" />
        </button>
      )}
    </div>
  ))}
</div>
```

### Screen Reader Announcements
```typescript
// Toast messages are announced via aria-live="polite"
// Error toasts use aria-live="assertive" for immediate announcement

<div
  role="alert"
  aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
>
```

### Keyboard Interaction
```typescript
// Toasts should be focusable for keyboard users
// Tab through action buttons
// Escape to dismiss focused toast (optional)

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    dismissFocusedToast();
  }
};
```

---

## Responsive Behavior

### Mobile (< 640px)
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  ✓  5 items archived   [ Undo ] │    │
│  │  ═════════════════════════════  │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ─────────────────────────────────────  │
│  Quick Capture Bar                      │
│                                         │
└─────────────────────────────────────────┘
Mobile changes:

Position: Fixed at bottom, centered
Width: calc(100% - 32px)
Max-width: none (full width)
Left: 16px, Right: 16px
Bottom: 80px (above Quick Capture)
Stack from bottom up
Swipe to dismiss (touch gesture)


### Swipe to Dismiss (Mobile)
```typescript
function useSwipeToDismiss(
  elementRef: RefObject<HTMLElement>,
  onDismiss: () => void,
  threshold: number = 100
) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let startX: number;
    let currentX: number;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;

      if (deltaX > 0) {
        element.style.transform = `translateX(${deltaX}px)`;
        element.style.opacity = `${1 - deltaX / threshold}`;
      }
    };

    const handleTouchEnd = () => {
      const deltaX = currentX - startX;

      if (deltaX > threshold) {
        onDismiss();
      } else {
        element.style.transform = '';
        element.style.opacity = '';
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, onDismiss, threshold]);
}
```

---

## Common Toast Patterns

### Action Confirmation
```typescript
// After archiving items
success(`${count} items archived`, {
  onUndo: () => unarchiveItems(itemIds),
});

// After moving items
success(`Moved to ${folderName}`, {
  onUndo: () => moveItems(itemIds, originalFolderId),
});

// After deleting items
success(`${count} items deleted`, {
  description: 'This cannot be undone',
});
```

### Error Handling
```typescript
// Network error
error('Connection lost', {
  description: 'Please check your internet connection',
  action: {
    label: 'Try again',
    onClick: retryLastAction,
  },
});

// Validation error
error('Invalid input', {
  description: 'Please check the form and try again',
});

// Server error
error('Something went wrong', {
  description: 'Our team has been notified',
  action: {
    label: 'Report issue',
    onClick: openSupportDialog,
  },
});
```

### Progress Operations
```typescript
// File upload
const uploadWithProgress = async (files: File[]) => {
  const toastId = toast({
    type: 'progress',
    message: `Uploading ${files.length} files`,
    progress: 0,
  });

  for (let i = 0; i < files.length; i++) {
    await uploadFile(files[i], (percent) => {
      const overallProgress = ((i + percent / 100) / files.length) * 100;
      updateProgress(toastId, overallProgress);
    });
  }

  update(toastId, {
    type: 'success',
    message: `${files.length} files uploaded`,
  });
};

// Bulk operation
const bulkArchive = async (itemIds: string[]) => {
  const toastId = toast({
    type: 'progress',
    message: `Archiving ${itemIds.length} items`,
    progress: 0,
  });

  for (let i = 0; i < itemIds.length; i++) {
    await archiveItem(itemIds[i]);
    updateProgress(toastId, ((i + 1) / itemIds.length) * 100);
  }

  update(toastId, {
    type: 'success',
    message: `${itemIds.length} items archived`,
    onUndo: () => unarchiveItems(itemIds),
  });
};
```

---

## Verification Checklist

After building, verify:

### Toast Types
☐ Success toast shows green icon and message
☐ Error toast shows red icon, description, and action
☐ Warning toast shows amber icon
☐ Info toast shows blue icon
☐ Loading toast shows spinner (no close button)
☐ Progress toast shows progress bar

### Behavior
☐ Toasts appear in correct position
☐ Toasts stack correctly (newest at insertion point)
☐ Auto-dismiss works with correct timing
☐ Manual dismiss (X button) works
☐ Pause on hover works (countdown pauses)
☐ Action buttons work
☐ Undo action works
☐ Progress updates correctly
☐ Loading → success/error transition works

### Animation
☐ Enter animation (slide in from right)
☐ Exit animation (slide out to right)
☐ Stack reorder animation (smooth)
☐ Countdown bar animation
☐ Spinner animation

### Accessibility
☐ aria-live region announces toasts
☐ Error toasts use assertive announcement
☐ Close buttons have accessible labels
☐ Keyboard focus works
☐ Screen readers read toast content

### Responsive
☐ Mobile layout (full width, bottom position)
☐ Swipe to dismiss works on mobile
☐ Max visible limit works
☐ Collapsed indicator shows when too many

### API
☐ `toast()` function works
☐ `success/error/warning/info/loading` shortcuts work
☐ `promise()` helper works
☐ `update()` function works
☐ `dismiss()` and `dismissAll()` work

## Output

Create a toast notification system with:

1. **ToastProvider** — Context provider for toast state
2. **ToastContainer** — Positioned container that renders toasts
3. **Toast** — Individual toast component with variants
4. **useToast** — Hook for creating and managing toasts
5. **toastStore** — State management for toasts (Zustand or Context)

Use Tailwind CSS for styling. The system should:
1. Support all toast types (success, error, warning, info, loading, progress)
2. Handle stacking and auto-dismiss
3. Support actions and undo
4. Animate smoothly
5. Be fully accessible
6. Work on mobile with swipe gestures
7. Provide a clean, simple API

Implementation Notes
Key Principles:
PrincipleApplicationNon-blockingToasts don't interrupt workflowActionableInclude undo, retry, or other actionsTimelyAuto-dismiss at appropriate intervalsStackableHandle multiple simultaneous notificationsAccessibleAnnounce to screen readers
Design Choices:

Bottom-right position — Out of the way, but visible. Consistent with many apps.
Colored left accent — Subtle but clear type indication. Works with icons too.
Undo with countdown bar — Visual feedback for time remaining. Pause on hover reduces anxiety.
Error toasts persist — Errors are important. User must acknowledge them.
Promise helper — Elegant pattern for async operations. Loading → success/error automatically.
Swipe to dismiss on mobile — Natural touch gesture. Reduces tap target size needs.