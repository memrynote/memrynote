Prompt #4: Quick Capture Bar
The Prompt
You are building the Quick Capture Bar component for Memry's inbox page. This component lives inside Zone 4 of the page layout shell (the fixed 64px bar at the bottom).

## What You Are Building

A fixed bottom bar that allows users to quickly capture notes, URLs, voice memos, and files without navigating away from the inbox. This is the primary entry point for adding new items.

## Quick Capture Bar Layout

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                                 │   │
│   │  ┌────┐   ┌─────────────────────────────────────────────────────────────┐   ┌────┬────┬────┐   │   │
│   │  │ ➕ │   │  Type or paste anything...                                  │   │ 🎤 │ 📎 │ 🔗 │   │   │
│   │  │    │   │                                                             │   │    │    │    │   │   │
│   │  └────┘   └─────────────────────────────────────────────────────────────┘   └────┴────┴────┘   │   │
│   │                                                                                                 │   │
│   │  NEW       TEXT INPUT                                                       ACTION BUTTONS      │   │
│   │  BUTTON    (expandable)                                                                         │   │
│   │                                                                                                 │   │
│   └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
│   Inner container: max-width: 800px, centered                                                           │
│   Bar padding: 12px 24px                                                                                │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
  Height: 64px | Background: white | Border-top: 1px solid gray-200 | Box-shadow: 0 -2px 8px rgba(0,0,0,0.06)

## Component Structure

### Outer Container
- Position: fixed
- Bottom: 0
- Left: 0
- Right: 0
- Height: 64px
- Background: white
- Border-top: 1px solid gray-200
- Box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06)
- Z-index: 50
- Display: flex
- Align-items: center
- Justify-content: center
- Padding: 12px 24px

### Inner Container
- Max-width: 800px
- Width: 100%
- Display: flex
- Align-items: center
- Gap: 12px

## Element Details

### New Button (Left)

┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   ┌────────────────┐                                           │
│   │                │                                           │
│   │      ➕        │   40px × 40px                              │
│   │                │   Rounded-full (circle)                   │
│   │                │                                           │
│   └────────────────┘                                           │
│                                                                │
│   Default: bg-gray-900, icon white                             │
│   Hover: bg-gray-800                                           │
│   Active: bg-gray-950, scale-95                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘

- Size: 40px × 40px
- Border-radius: full (circle)
- Background: gray-900
- Icon: Plus sign, 20px, color: white, stroke-width: 2
- Hover: bg-gray-800
- Active (pressed): bg-gray-950, transform: scale(0.95)
- Focus: ring-2 ring-gray-900 ring-offset-2
- Purpose: Opens expanded capture modal (future prompt)
- For now: console.log("New item modal")

### Text Input (Center)

┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐   │
│   │                                                                       │   │
│   │    Type or paste anything...                                          │   │
│   │    ─────────────────────────                                          │   │
│   │    Placeholder text                                                   │   │
│   │                                                                       │   │
│   └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│   Height: 40px                                                                │
│   Border-radius: 10px                                                         │
│   Background: gray-100                                                        │
│   Padding: 0 16px                                                             │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

- Container: flex-grow (takes remaining space)
- Height: 40px
- Background: gray-100
- Border: none
- Border-radius: 10px
- Padding: 0 16px
- Font-size: 14px
- Color: gray-900
- Placeholder: "Type or paste anything..."
- Placeholder color: gray-400

**Input States:**

| State | Appearance |
|-------|------------|
| Default | bg-gray-100, placeholder visible |
| Hover | bg-gray-200 |
| Focused | bg-white, ring-2 ring-blue-500, shadow-sm |
| With text | Show submit button inside (right side) |
| URL detected | Show link preview indicator |

**URL Detection Behavior:**

When user pastes or types a URL (starts with http://, https://, or www.):

┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐   │
│   │                                                                       │   │
│   │  🔗  https://example.com/article...              [ ➜ Save ]           │   │
│   │  ──                                               ─────────           │   │
│   │  Link icon                                        Submit btn          │   │
│   │  appears                                          appears             │   │
│   │                                                                       │   │
│   └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

- Link icon: 16px, color: blue-500, appears at left inside input
- Input padding-left increases to 36px to make room for icon
- Submit button:
  - Appears inside input, right side
  - Text: "Save" with arrow icon ➜
  - Height: 32px
  - Padding: 0 12px
  - Background: blue-600
  - Color: white
  - Border-radius: 8px
  - Hover: bg-blue-700

**Text Entry Submit:**

When user types text (non-URL) and presses Enter or clicks submit:

┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐   │
│   │                                                                       │   │
│   │  Remember to review the design specs          [ ➜ Save ]              │   │
│   │                                                                       │   │
│   └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

- Submit button appears when input has any text
- Enter key submits (Shift+Enter for newline if expanded)

### Action Buttons (Right)

┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │                                                                      │   │
│   │   ┌────────────┐    ┌────────────┐    ┌────────────┐                 │   │
│   │   │     🎤     │    │     📎     │    │     🔗     │                 │   │
│   │   │            │    │            │    │            │                 │   │
│   │   │   Voice    │    │   Attach   │    │    Link    │                 │   │
│   │   └────────────┘    └────────────┘    └────────────┘                 │   │
│   │                                                                      │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   Container: flex row, gap: 4px                                              │
│   Each button: 40px × 40px                                                   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

- Container: flex row, gap: 4px
- Each button:
  - Size: 40px × 40px
  - Border-radius: 10px
  - Background: transparent
  - Icon: 20px, color: gray-500
  - Hover: bg-gray-100, icon color: gray-700
  - Active: bg-gray-200
  - Focus: ring-2 ring-gray-400 ring-offset-2

**Button Details:**

| Button | Icon | Tooltip | Action |
|--------|------|---------|--------|
| Voice | 🎤 Microphone | "Record voice memo" | Starts voice recording |
| Attach | 📎 Paperclip | "Attach file" | Opens file picker |
| Link | 🔗 Link | "Add link" | Focuses input with URL mode |

### Voice Recording State

When voice recording is active, the bar transforms:

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                                 │   │
│   │  ┌────┐   ┌─────────────────────────────────────────────────────────────┐   ┌────┐   ┌────┐     │   │
│   │  │ ⏹️ │   │  ● Recording...                              0:12           │   │ ✕  │   │ ✓  │     │   │
│   │  │stop│   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━               │   │    │   │save│     │   │
│   │  └────┘   │  Live waveform visualization                               │   └────┘   └────┘     │   │
│   │           └─────────────────────────────────────────────────────────────┘                       │   │
│   │                                                                                                 │   │
│   └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
│   Background: red-50 | Border-top: 2px solid red-500                                                    │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

**Recording State Elements:**

- Bar background: red-50
- Border-top: 2px solid red-500 (replaces shadow)
- Stop button (replaces New button):
  - Size: 40px × 40px
  - Background: red-600
  - Icon: Stop square, white
  - Hover: bg-red-700
  - Pulses gently to indicate active recording
- Waveform area (replaces text input):
  - Shows "● Recording..." with pulsing red dot
  - Live waveform visualization (simple bars)
  - Timer showing elapsed time: "0:12" format
  - Background: white
  - Border-radius: 10px
- Cancel button (✕):
  - Size: 40px × 40px
  - Background: gray-200
  - Icon: X mark, gray-600
  - Discards recording
- Save button (✓):
  - Size: 40px × 40px
  - Background: green-600
  - Icon: Checkmark, white
  - Saves recording to inbox

### Drag & Drop State

When files are dragged over the bar (or entire page):

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │   │
│   │ ·                                                                                             · │   │
│   │ ·                        📎  Drop files to add to inbox                                       · │   │
│   │ ·                                                                                             · │   │
│   │ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · │   │
│   └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
│   Background: blue-50 | Border: 2px dashed blue-400 | All other elements hidden                         │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

**Drag & Drop Elements:**

- Background: blue-50
- Border: 2px dashed blue-400
- All normal elements hidden
- Centered content:
  - Icon: 📎 or upload icon, 32px, color: blue-500
  - Text: "Drop files to add to inbox"
  - Font-size: 16px
  - Color: blue-700

## Component States Summary

| State | Trigger | Appearance |
|-------|---------|------------|
| Default | Initial | Normal layout, empty input |
| Text entered | User types | Submit button appears |
| URL detected | URL pattern in input | Link icon + Submit button |
| Focused | Input focused | Ring highlight, bg-white |
| Recording | Voice button held/clicked | Red theme, waveform, timer |
| Drag over | Files dragged to page | Blue dashed border, drop message |
| Processing | After submit | Brief loading spinner in submit button |

## Interactive Behaviors

### Text Input
- onFocus: Apply focus styles
- onChange: Detect URL pattern, show/hide submit button
- onKeyDown:
  - Enter: Submit if text present
  - Escape: Clear input and blur
- onPaste: Detect URL, trigger URL mode styling

### URL Detection Regex
```javascript
const urlPattern = /^(https?:\/\/|www\.)/i;
const isUrl = urlPattern.test(inputValue.trim());
```

### New Button
- onClick: Open expanded capture modal
- For now: console.log("Open capture modal")

### Voice Button
- onClick: Start recording (toggle)
- Alternative: onMouseDown start, onMouseUp stop (push-to-talk)
- For now: Toggle recording state locally

### Attach Button
- onClick: Open file picker
- Accept: images/*, .pdf, .doc, .docx, .txt, .md
- onFileSelected: console.log("Files:", files)

### Link Button
- onClick: Focus input, add "https://" prefix if empty
- Provides explicit way to enter link mode

### Submit Action
- onClick / Enter:
  - If URL: console.log("Save URL:", value)
  - If text: console.log("Save note:", value)
  - Clear input after submit
  - Show brief success indicator

## Props Interface
```typescript
interface QuickCaptureBarProps {
  // Callbacks
  onNewClick: () => void;
  onSubmit: (content: string, type: "note" | "url") => void;
  onVoiceSubmit: (audioBlob: Blob, duration: number) => void;
  onFilesAdded: (files: File[]) => void;

  // State
  isDisabled?: boolean;
  isLoading?: boolean;
}
```

## Internal State
```typescript
// Managed within the component
const [inputValue, setInputValue] = useState("");
const [isRecording, setIsRecording] = useState(false);
const [recordingTime, setRecordingTime] = useState(0);
const [isDragOver, setIsDragOver] = useState(false);
```

## Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| < 640px | Hide Link button (can still paste URLs). Inner container padding: 8px. |
| 640px - 768px | Show all buttons. Reduce gaps slightly. |
| > 768px | Full layout as specified |

## Accessibility Requirements

- New button: aria-label="Create new item"
- Text input:
  - aria-label="Quick capture - type or paste anything"
  - role="textbox"
- Voice button: aria-label="Record voice memo"
- Attach button: aria-label="Attach files"
- Link button: aria-label="Add link"
- Hidden file input: Connected to Attach button via id/htmlFor or click handler
- Recording state: aria-live="polite" announces "Recording started" and "Recording stopped"
- Drag & drop zone: aria-dropeffect="copy"

## Keyboard Shortcuts (Global)

| Shortcut | Action |
|----------|--------|
| N | Focus quick capture input (when not already focused) |
| Cmd/Ctrl + Enter | Submit current input |
| Escape | Clear input and blur |

Note: Global shortcuts will be implemented in Prompt #21. For now, just handle input-level keyboard events.

## Verification Checklist

After building, verify:
☐ New button (plus) has hover and active states
☐ Input shows placeholder, accepts text, handles focus states
☐ Submit button appears when input has text
☐ URL detection works (paste "https://example.com" and see link icon)
☐ Voice button toggles recording state
☐ Recording state shows timer incrementing, waveform area, stop/cancel/save buttons
☐ Attach button opens file picker dialog
☐ Link button focuses input and optionally adds https:// prefix
☐ Drag over page shows drop zone state
☐ File drop triggers onFilesAdded callback
☐ Bar is fixed at bottom and doesn't scroll with content
☐ Shadow appears above the bar
☐ Responsive: Link button hides on very small screens

## Output

Create a React component called QuickCaptureBar that accepts the props defined above. Use Tailwind CSS for styling. Manage recording and drag-drop states internally. Replace the "Quick Capture Bar" placeholder text in Zone 4 of InboxPageLayout with this component.

For the voice recording waveform, use a simple placeholder (animated bars or static representation) — actual audio visualization will be refined later.

Implementation Notes
Key Techniques Used:
TechniqueWhyState transformation diagramsRecording and drag-drop fundamentally change the UIURL detection regex providedRemoves ambiguity about what counts as a URLInternal vs prop state separationComponent manages ephemeral states, parent handles dataMultiple input modesText vs URL vs Voice vs File — each has distinct UXExplicit submit behaviorsClear what happens on Enter, click, or voice save
Design Choices:

Fixed bottom bar — Always accessible for capture, following patterns from messaging apps (WhatsApp, iMessage) and modern productivity tools (Linear, Height). Users develop muscle memory for bottom-of-screen input.
Inline submit button — Appears inside input when content is present. Cleaner than always-visible button, provides clear affordance that submission is possible.
URL auto-detection — Automatically recognizes pasted URLs and adjusts UI (link icon, "Save" instead of generic submit). Reduces friction vs requiring explicit "add link" flow.
Recording state takeover — Entire bar transforms during voice recording to focus attention. Red theme signals active recording state (convention from audio apps).
Drag & drop at bar level — Even though files can be dropped anywhere, the bar shows the drop target. Centralizes the feedback without covering content.


Expected Output Structure
jsx<div className="quick-capture-bar">
  <div className="capture-inner">
    {isRecording ? (
      // Recording State
      <>
        <button className="stop-btn">⏹</button>
        <div className="waveform-area">
          <span className="recording-indicator">● Recording...</span>
          <div className="waveform">{/* bars */}</div>
          <span className="timer">{formatTime(recordingTime)}</span>
        </div>
        <button className="cancel-btn">✕</button>
        <button className="save-btn">✓</button>
      </>
    ) : isDragOver ? (
      // Drag Over State
      <div className="drop-zone">
        <UploadIcon />
        <span>Drop files to add to inbox</span>
      </div>
    ) : (
      // Default State
      <>
        <button className="new-btn" onClick={onNewClick}>
          <PlusIcon />
        </button>

        <div className="input-wrapper">
          {isUrl && <LinkIcon className="input-icon" />}
          <input
            value={inputValue}
            onChange={handleChange}
            placeholder="Type or paste anything..."
          />
          {inputValue && (
            <button className="submit-btn" onClick={handleSubmit}>
              Save <ArrowIcon />
            </button>
          )}
        </div>

        <div className="action-buttons">
          <button className="voice-btn" onClick={startRecording}>
            <MicIcon />
          </button>
          <button className="attach-btn" onClick={openFilePicker}>
            <PaperclipIcon />
          </button>
          <button className="link-btn" onClick={focusWithUrl}>
            <LinkIcon />
          </button>
        </div>

        <input type="file" hidden ref={fileInputRef} onChange={handleFiles} />
      </>
    )}
  </div>
</div>

Usage Guidelines

Test all modes — Default → typing → URL paste → recording → drag-drop
Verify fixed positioning — Scroll the content area to ensure bar stays in place
Test recording timer — Start recording and verify timer increments
Test file picker — Click attach, select files, verify callback fires
Test URL detection — Paste various URLs (with/without https://) to verify detection