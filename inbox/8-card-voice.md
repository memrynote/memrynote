Prompt #8: Card — Voice
The Prompt
You are building the Voice Card component for Memry's inbox. This is a reusable card that displays voice memo recordings with waveform visualization, duration, transcription preview, and playback controls. The card will be used in both Grid View (masonry) and List View (timeline).

## What You Are Building

A content card that displays a recorded voice memo with visual waveform, playback capability, duration, transcription status/preview, and user-added metadata. Users can play the recording directly from the card without opening the full preview.

## Card Variants

This component has TWO layout variants controlled by a `variant` prop:

1. **Grid Variant** — Vertical card with prominent waveform for masonry layout
2. **List Variant** — Horizontal row with compact player for timeline layout

---

## VARIANT 1: Grid Card (Masonry)

┌─────────────────────────────────────────┐
│                                         │
│  🎤  Voice memo                         │  ← Title (user-editable)
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  ┌───┐                          │    │
│  │  │ ▶ │   ▁▂▃▅▆▇█▇▆▅▃▂▁▂▃▄▅▆█▇▆ │    │  ← Waveform with play button
│  │  └───┘                          │    │
│  │                                 │    │
│  │         0:00 / 1:24             │    │  ← Time: current / total
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📝 Transcription                │    │  ← Transcription section
│  │                                 │    │
│  │ "Remember to call back the      │    │
│  │ client about the proposal.      │    │
│  │ They mentioned wanting to..."   │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  📍 Transcribed                 5h ago  │  ← Status + timestamp
│                                         │
└─────────────────────────────────────────┘

---

## Grid Card Specifications

**Card Container:**
- Width: Fluid (determined by grid column)
- Min-width: 280px
- Max-width: 400px
- Background: white
- Border-radius: 12px
- Border: 1px solid gray-200
- Padding: 16px
- Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04)

**Card Height:**
- Auto-height based on content
- Min-height: 160px (no transcription)
- Max-height: 320px (with transcription, truncated)

### Header Section

┌─────────────────────────────────────────┐
│                                         │
│  ┌────┐                                 │
│  │ 🎤 │  Voice memo                     │
│  └────┘  ──────────                     │
│  ▲       Title text                     │
│  │       16px, semibold, gray-900       │
│  │                                      │
│  Mic icon                               │
│  16px, orange-500                       │
│                                         │
│  Flex row, items-center, gap: 8px       │
│  Margin-bottom: 12px                    │
│                                         │
└─────────────────────────────────────────┘

**Microphone Icon:**
- Size: 16px × 16px
- Color: orange-500
- Style: Filled microphone

**Title:**
- Default: "Voice memo"
- User can edit to custom title
- Font-size: 16px
- Font-weight: 600 (semibold)
- Color: gray-900
- Line-clamp: 1

### Player Section

┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  Background: gray-50            │    │
│  │  Border-radius: 10px            │    │
│  │  Padding: 16px                  │    │
│  │                                 │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │                         │    │    │
│  │  │     PLAYER CONTROLS     │    │    │
│  │  │                         │    │    │
│  │  └─────────────────────────┘    │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Margin-bottom: 12px                    │
│                                         │
└─────────────────────────────────────────┘

**Player Container:**
- Background: gray-50
- Border-radius: 10px
- Padding: 16px
- Display: flex, flex-direction: column, align-items: center
- Gap: 12px

### Player Controls Detail

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    PLAY BUTTON + WAVEFORM                   │
│                                                             │
│  ┌───────┐                                                  │
│  │       │                                                  │
│  │   ▶   │    ▁▂▃▅▆▇█▇▆▅▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆█▇▆▅▄▃▂▁     │
│  │       │    ─────────────────────────────────────────     │
│  └───────┘    Waveform visualization                        │
│                                                             │
│  ▲            ▲                                             │
│  │            │                                             │
│  Play/Pause   Waveform bars                                 │
│  button       (clickable to seek)                           │
│  44px                                                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    TIME DISPLAY                             │
│                                                             │
│                   0:00 / 1:24                               │
│                   ───────────                               │
│                   Current / Total                           │
│                                                             │
│                   Font: 13px, tabular-nums                  │
│                   Color: gray-500                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

**Play/Pause Button:**
- Size: 44px × 44px
- Border-radius: full (circle)
- Background: orange-500
- Icon: Play (▶) or Pause (❚❚), 20px, white
- Hover: bg-orange-600
- Active: bg-orange-700, scale(0.95)
- Focus: ring-2 ring-orange-500 ring-offset-2
- Transition: all 150ms

**Waveform Visualization:**
- Container: flex-grow, height: 40px
- Display: flex, align-items: center, gap: 2px
- Number of bars: ~40-50 (responsive to width)
- Bar width: 3px
- Bar border-radius: 1.5px (rounded ends)
- Bar heights: Variable based on audio amplitude data

**Waveform Bar Colors:**
| State | Played Portion | Unplayed Portion |
|-------|----------------|------------------|
| Default | gray-300 | gray-300 |
| Playing | orange-500 | gray-300 |
| Hover (seeking) | orange-400 | gray-200 |

**Waveform Interaction:**
- Entire waveform is clickable for seeking
- On click: Jump to position based on X coordinate
- Cursor: pointer
- Hover: Shows time tooltip at cursor position

**Time Display:**
- Format: "M:SS / M:SS" (e.g., "0:32 / 1:24")
- Font-size: 13px
- Font-family: Use tabular-nums for consistent width
- Color: gray-500
- Centered below waveform

### Transcription Section

┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  📝  Transcription         ▾   │    │  ← Header with expand toggle
│  │  ──────────────────────────    │    │
│  │                                 │    │
│  │  "Remember to call back the    │    │  ← Transcript text
│  │  client about the proposal.    │    │     Quoted style
│  │  They mentioned wanting to     │    │     Max 4 lines in collapsed
│  │  see more options for the..."  │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘

**Transcription Container:**
- Background: white
- Border: 1px solid gray-200
- Border-radius: 8px
- Padding: 12px
- Margin-bottom: 12px

**Transcription Header:**
- Display: flex, justify-content: space-between, align-items: center
- Icon: 📝 Document/text icon, 14px, gray-500
- Label: "Transcription", 13px, font-weight: 500, gray-600
- Expand toggle: Chevron down (▾), 16px, gray-400
  - Rotates 180° when expanded
- Margin-bottom: 8px

**Transcription Text:**
- Font-size: 14px
- Color: gray-700
- Line-height: 1.6
- Font-style: italic (to indicate it's a quote/transcription)
- Opening quote: " (included in text or styled ::before)
- Max lines: 4 (collapsed), unlimited (expanded)
- Overflow: Fade gradient at bottom when collapsed

**Transcription States:**

| State | Appearance |
|-------|------------|
| Transcribing | Pulsing dots animation "Transcribing..." |
| Transcribed | Shows transcript text |
| Failed | "Transcription failed" + Retry button |
| Unavailable | Section not shown at all |

**Transcribing State:**
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  📝  Transcribing...            │    │  ← Animated dots
│  │                                 │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │ ░░░░░░░░░░░░░░░░░░░░░░░ │    │    │  ← Skeleton lines
│  │  │ ░░░░░░░░░░░░░░░░░░░     │    │    │
│  │  │ ░░░░░░░░░░░░░░░░░░░░░░  │    │    │
│  │  └─────────────────────────┘    │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘

**Failed State:**
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  ⚠️  Transcription failed       │    │
│  │                                 │    │
│  │  [ 🔄 Retry ]                   │    │  ← Retry button
│  │                                 │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘

### Footer Section

┌─────────────────────────────────────────┐
│                                         │
│  ───────────────────────────────────    │  ← Divider
│                                         │
│  📍 Transcribed               5h ago    │  ← Status badge + timestamp
│                                         │
│  OR                                     │
│                                         │
│  ┌────────┐                             │
│  │ #calls │                   5h ago    │  ← Tags + timestamp
│  └────────┘                             │
│                                         │
└─────────────────────────────────────────┘

**Status Badge:**
- Icon: 📍 Location pin (indicates processed/transcribed)
- Text: "Transcribed" or "Processing" or "No transcript"
- Font-size: 12px
- Color: gray-500
- Display: flex, items-center, gap: 4px

**Alternative with Tags:**
- If user has added tags, show tags instead of status badge
- Status can be shown as tooltip on an info icon

---

## VARIANT 2: List Card (Timeline)

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                          │
│  ┌────┐  ┌────┐  ┌─────┐                                                                                 │
│  │    │  │ 🎤 │  │  ▶  │  Voice memo                                                        5 hours ago  │
│  │ ☐  │  │icon│  │play │  1:24 · 📍 Transcribed                                                          │
│  │    │  │    │  └─────┘  "Remember to call back the client about the proposal..."                       │
│  └────┘  └────┘                                                                                          │
│                                                                                                          │
│  ▲       ▲      ▲         ▲                                                                              │
│  │       │      │         │                                                                              │
│  Check   Type   Mini      Content area                                                                   │
│  box     icon   play                                                                                     │
│                 btn                                                                                      │
│                                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘

### List Card Structure

**Layout:**
- Display: flex row
- Align-items: flex-start
- Gap: 12px
- Padding: 12px 16px
- Background: white
- Border-bottom: 1px solid gray-100
- Min-height: 72px

**Checkbox Column:**
- Width: 24px
- Opacity: 0 by default, 1 on hover/selected
- Checkbox: 18px × 18px

**Type Icon Column:**
- Width: 32px, Height: 32px
- Background: orange-50
- Border-radius: 8px
- Icon: Microphone, 16px, orange-600

**Mini Play Button Column:**
- Width: 36px, Height: 36px
- Border-radius: full (circle)
- Background: orange-500
- Icon: Play/Pause, 14px, white
- Hover: bg-orange-600
- Flex-shrink: 0

**Content Column:**
- Flex: 1
- Display: flex, flex-direction: column
- Gap: 2px

*Row 1 — Title + Time:*
- Title: 14px, font-weight: 500, gray-900, line-clamp-1
- Time: 12px, gray-400, right-aligned, nowrap

*Row 2 — Duration + Status:*
- Duration: "1:24", 13px, gray-500
- Separator: " · "
- Status: "📍 Transcribed", 13px, gray-500

*Row 3 — Transcript Preview:*
- Quoted transcript text
- Font-size: 13px
- Color: gray-400
- Font-style: italic
- Line-clamp: 1

### List Card Playing State

When audio is playing, the row shows mini progress:

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                          │
│  ┌────┐  ┌────┐  ┌─────┐                                                                                 │
│  │    │  │ 🎤 │  │ ❚❚  │  Voice memo                              0:32 / 1:24              5 hours ago  │
│  │ ☐  │  │icon│  │pause│  ━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━━━━━━━                                          │
│  │    │  │    │  └─────┘  Playing...                                                                     │
│  └────┘  └────┘                                                                                          │
│                                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘

**Playing State Changes:**
- Play button shows Pause icon
- Row 2: Shows mini progress bar instead of duration + status
- Row 3: Shows "Playing..." or continues showing transcript

**Mini Progress Bar:**
- Height: 4px
- Background: gray-200
- Progress fill: orange-500
- Border-radius: 2px
- Width: 100% of content area

---

## Card States

### Interaction States

| State | Grid Appearance | List Appearance |
|-------|-----------------|-----------------|
| Default | White bg, subtle border | White bg, bottom border |
| Hover | Shadow lift | bg-gray-50, checkbox visible |
| Playing | Orange accent glow/border | Row highlighted, progress visible |
| Selected | bg-blue-50, border-blue-200 | bg-blue-50, checkbox checked |
| Focused | ring-2 ring-blue-500 | ring-2 ring-blue-500 |

### Playing State (Grid)

When audio is playing, add visual feedback:

┌─────────────────────────────────────────┐
│                                         │
│  Border: 2px solid orange-200           │
│  Box-shadow: 0 0 0 4px orange-50        │
│                                         │
│  🎤  Voice memo                         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  ┌───┐                          │    │
│  │  │❚❚ │   ▁▂▃▅▆▇█▇▆▅▃▂▁▂▃▄▅▆█▇▆ │    │  ← Pause icon
│  │  └───┘   ━━━━━━━●━━━━━━━━━━━━━━ │    │  ← Progress indicator
│  │                                 │    │
│  │         0:32 / 1:24             │    │  ← Current time updating
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘

### Hover Actions (Grid)

┌─────────────────────────────────────────┐
│                                         │
│  🎤  Voice memo                 ┌───┐   │
│                                 │ ⋮ │   │  ← More button (top-right)
│                                 └───┘   │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  (player controls)              │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  (transcription)                │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐     │
│  │ 📁 Move │ 🏷️ Tag │ ⬇️ │ 🗑️ Del │     │  ← Action bar (bottom, above footer)
│  └────────────────────────────────┘     │
│                                         │
│  ───────────────────────────────────    │
│  📍 Transcribed               5h ago    │
└─────────────────────────────────────────┘

**Action Bar:**
- Position: Above footer, on hover
- Same style as other cards
- Additional button: Download (⬇️) for audio file

---

## Waveform Generation

For the waveform visualization, generate bar heights from audio data:
```typescript
interface WaveformData {
  // Array of amplitude values (0-1) representing audio levels
  // Typically 40-60 samples for card display
  amplitudes: number[];
}

// Generate waveform display from amplitudes
function generateWaveformBars(amplitudes: number[]): number[] {
  // Normalize to pixel heights (min 4px, max 40px)
  const minHeight = 4;
  const maxHeight = 40;

  return amplitudes.map(amp => {
    return minHeight + (amp * (maxHeight - minHeight));
  });
}
```

**Static Waveform (no audio data yet):**
If audio amplitude data isn't available, show a placeholder pattern:
```typescript
// Generate random-ish but consistent placeholder
function generatePlaceholderWaveform(seed: string, barCount: number): number[] {
  // Use seed to generate consistent pattern for same recording
  // Returns array of heights between 0.2 and 1.0
}
```

**Waveform Visual:**
▁ = 10% height
▂ = 25% height
▃ = 40% height
▄ = 50% height
▅ = 60% height
▆ = 75% height
▇ = 85% height
█ = 100% height

---

## Audio Playback

### Playback Controls

**Play/Pause Toggle:**
```typescript
const [isPlaying, setIsPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const audioRef = useRef<HTMLAudioElement>(null);

const togglePlay = () => {
  if (isPlaying) {
    audioRef.current?.pause();
  } else {
    audioRef.current?.play();
  }
  setIsPlaying(!isPlaying);
};
```

**Seeking via Waveform Click:**
```typescript
const handleWaveformClick = (e: React.MouseEvent) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const percentage = clickX / rect.width;
  const newTime = percentage * duration;

  if (audioRef.current) {
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }
};
```

**Time Update:**
```typescript
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const handleTimeUpdate = () => {
    setCurrentTime(audio.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  audio.addEventListener('timeupdate', handleTimeUpdate);
  audio.addEventListener('ended', handleEnded);

  return () => {
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.removeEventListener('ended', handleEnded);
  };
}, []);
```

### Time Formatting
```typescript
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Examples:
// 0 → "0:00"
// 65 → "1:05"
// 125 → "2:05"
// 3661 → "61:01" (for very long recordings)
```

---

## Data Structure
```typescript
interface VoiceCardData {
  id: string;
  type: "voice";

  // Audio data
  audioUrl: string;              // URL to audio file
  duration: number;              // Duration in seconds
  waveformData?: number[];       // Amplitude array for visualization

  // Metadata
  title: string;                 // Default: "Voice memo"
  filename?: string;             // Original filename if any
  fileSize?: number;             // Bytes
  recordedAt?: Date;             // When it was recorded (if different from created)

  // Transcription
  transcription?: {
    text: string;                // Full transcript
    status: "pending" | "processing" | "completed" | "failed";
    confidence?: number;         // 0-1 confidence score
    timestamps?: {               // Word-level timestamps
      word: string;
      start: number;             // Start time in seconds
      end: number;               // End time in seconds
    }[];
  };

  // User data
  tags: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // States
  isArchived?: boolean;
}
```

## Props Interface
```typescript
interface VoiceCardProps {
  // Data
  data: VoiceCardData;

  // Variant
  variant: "grid" | "list";

  // Playback state (controlled by parent for single-audio-at-a-time)
  isPlaying: boolean;
  currentTime: number;
  onPlay: (id: string) => void;
  onPause: (id: string) => void;
  onSeek: (id: string, time: number) => void;

  // Selection
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;

  // Actions
  onClick: (id: string) => void;              // Opens preview panel
  onMove: (id: string) => void;
  onTag: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  onRetryTranscription: (id: string) => void;
}
```

**Note on Playback State:**
Playback state is controlled by parent to ensure only one audio plays at a time across all cards. Parent manages:
- Which card is currently playing
- Current playback time
- Audio element reference

---

## Loading Skeleton

**Grid Skeleton:**
┌─────────────────────────────────────────┐
│                                         │
│  ░░░░░░░░░░░░░░░░░░░░                   │  ← Title skeleton
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  ░░░░░  ░░░░░░░░░░░░░░░░░░░░░░  │    │  ← Player skeleton
│  │                                 │    │
│  │         ░░░░░░░░░░░             │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │    │  ← Transcription skeleton
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░    │    │
│  │ ░░░░░░░░░░░░░░░░░░░░░░         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ░░░░░░░░░░░░               ░░░░░░░░   │  ← Status + time skeleton
│                                         │
└─────────────────────────────────────────┘

**List Skeleton:**
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ░░  ░░░░  ░░░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░░░░░          │
│                   ░░░░░░░░░░░░░░░░░                                                                      │
│                   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘

---

## Accessibility Requirements

- Card container: role="article", aria-label="Voice memo: {title}"
- Play button: aria-label="Play voice memo" / "Pause voice memo"
- Waveform: role="slider", aria-label="Audio progress", aria-valuenow, aria-valuemin, aria-valuemax
- Current time: aria-live="polite" (announces time changes)
- Transcription: aria-label="Transcription of voice memo"
- Status badge: aria-label includes transcription status
- Checkbox: aria-label="Select voice memo: {title}"

**Keyboard Controls:**
| Key | Action |
|-----|--------|
| Space | Toggle play/pause (when card focused) |
| Left/Right | Seek backward/forward 5 seconds |
| Home | Jump to beginning |
| End | Jump to end |

---

## Verification Checklist

After building, verify:
☐ Grid variant displays with waveform visualization
☐ List variant displays with mini play button
☐ Play button toggles between play/pause icons
☐ Waveform shows progress during playback (color change)
☐ Clicking waveform seeks to that position
☐ Time display updates during playback
☐ Time formats correctly (M:SS format)
☐ Transcription section shows when available
☐ Transcription truncates with expand toggle
☐ "Transcribing..." state shows animated skeleton
☐ "Failed" state shows retry button
☐ Hover reveals action buttons
☐ Download action works
☐ Selection state shows blue styling
☐ Playing state shows orange accent (border/glow)
☐ Only one audio plays at a time (parent control works)
☐ Audio stops when card unmounts or another plays
☐ Keyboard controls work (Space to play, arrows to seek)

## Output

Create a React component called VoiceCard that accepts the props defined above. Use Tailwind CSS for styling. Include helper functions for time formatting and waveform generation. The component should render different layouts based on the `variant` prop and handle all playback states.

Note: Actual audio playback should use the HTML5 Audio API. The parent component will manage the shared audio element to ensure only one plays at a time.

Implementation Notes
Key Techniques Used:
TechniqueWhyControlled playback propsParent manages audio to prevent multiple simultaneous playsWaveform click-to-seekIntuitive interaction pattern from audio playersTranscription statesMultiple states (pending, processing, completed, failed) need distinct UXVisual playing indicatorOrange glow/border makes active audio obvious in a listTime formatting functionConsistent MM:SS display across all durations
Design Choices:

Orange accent color — Differentiates voice from other content types. Orange suggests audio/recording (common in podcast apps, voice memo apps).
Large play button (44px) — Easy tap target, prominent call-to-action. User's primary intent with voice memo is usually to play it.
Waveform as progress indicator — More informative than simple progress bar. Shows audio "shape" and allows precise seeking.
Transcription in collapsible section — Transcripts can be long. Collapsed by default keeps card compact; expandable for full reading.
Status badge in footer — "Transcribed" status helps user know at a glance if they can read vs must listen.
Parent-controlled playback — Essential for good UX. Without this, multiple voice memos could play simultaneously, creating audio chaos.


Expected Output Structure
jsx// Grid variant
<article className={`voice-card voice-card--grid ${isPlaying ? 'is-playing' : ''}`}>
  <div className="card-header">
    <MicrophoneIcon className="type-icon" />
    <h3 className="title">{data.title}</h3>
    <button className="more-btn">⋮</button>
  </div>

  <div className="player-container">
    <div className="player-controls">
      <button
        className="play-btn"
        onClick={() => isPlaying ? onPause(data.id) : onPlay(data.id)}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div
        className="waveform"
        onClick={handleWaveformClick}
        role="slider"
        aria-valuenow={currentTime}
        aria-valuemin={0}
        aria-valuemax={data.duration}
      >
        {waveformBars.map((height, i) => (
          <div
            key={i}
            className={`bar ${i < playedBars ? 'played' : ''}`}
            style={{ height }}
          />
        ))}
      </div>
    </div>

    <div className="time-display">
      {formatDuration(currentTime)} / {formatDuration(data.duration)}
    </div>
  </div>

  {data.transcription && (
    <div className="transcription-section">
      <div className="transcription-header">
        <DocumentIcon />
        <span>Transcription</span>
        <ChevronIcon className={expanded ? 'rotate-180' : ''} />
      </div>
      <div className={`transcription-text ${expanded ? 'expanded' : ''}`}>
        "{data.transcription.text}"
      </div>
    </div>
  )}

  <div className="hover-actions">
    <button onClick={onMove}><FolderIcon /></button>
    <button onClick={onTag}><TagIcon /></button>
    <button onClick={onDownload}><DownloadIcon /></button>
    <button onClick={onDelete}><TrashIcon /></button>
  </div>

  <div className="card-footer">
    <div className="status-badge">
      <PinIcon />
      <span>{getStatusText()}</span>
    </div>
    <span className="timestamp">{formatRelativeTime(data.createdAt)}</span>
  </div>
</article>

// Audio element (can be in parent, referenced by all cards)
<audio ref={audioRef} src={data.audioUrl} />

Usage Guidelines

Implement parent audio controller — Create a hook/context that manages single audio playback across all voice cards
Test playback switching — Click play on one card, then another; first should pause
Test seeking — Click different positions on waveform to verify seeking works
Test long recordings — Verify time formatting for recordings over 1 hour
Test transcription states — Pass different transcription.status values to verify all states render
Test keyboard controls — Focus card and use Space, Arrow keys
