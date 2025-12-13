Prompt #15: Preview — Image, Voice, Clip
The Prompt
You are building the Image Preview, Voice Preview, and Web Clip Preview components for Memry's inbox. These content-specific components render inside the PreviewPanelShell and provide detailed viewing, playback, and editing capabilities for their respective item types.

## What You Are Building

Three preview components:
1. **ImagePreview** — Full image viewing with zoom controls, pan/drag, metadata, AI-detected tags, and captions
2. **VoicePreview** — Audio playback with large waveform, timestamped transcript, and transcript editing
3. **WebClipPreview** — Full clipped content display with source attribution, personal notes, and AI-suggested connections

All components render as children of PreviewPanelShell, filling its content area.

---

# PART 1: IMAGE PREVIEW

## Image Preview Layout
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                       MAIN IMAGE VIEWER                               │  │
│  │                       (zoomable, pannable)                            │  │
│  │                                                                       │  │
│  │                       Max-height: 350px                               │  │
│  │                       Fit: contain                                    │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ZOOM CONTROLS                                                        │  │
│  │  ─────────────                                                        │  │
│  │  [ - ]  ════════════○════════════  [ + ]     100%     [ ⟲ Reset ]    │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  MULTI-IMAGE NAVIGATION (if multiple images)                          │  │
│  │  ───────────────────────────────────────                              │  │
│  │  ◀  │ [thumb1] [thumb2] [thumb3] [thumb4] [thumb5] │  ▶    3 of 5    │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  FILE INFO                                                            │  │
│  │  ─────────                                                            │  │
│  │  📁 screenshot.png                                                    │  │
│  │  1920 × 1080  ·  1.2 MB  ·  PNG                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  AI DETECTED CONTENT                                                  │  │
│  │  ───────────────────                                                  │  │
│  │  ┌───────────┐ ┌─────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐  │  │
│  │  │ dashboard │ │  chart  │ │ analytics │ │ dark mode │ │ sidebar  │  │  │
│  │  └───────────┘ └─────────┘ └───────────┘ └───────────┘ └──────────┘  │  │
│  │                                                                       │  │
│  │  Confidence: 94%                                                      │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  CAPTION / ALT TEXT                                                   │  │
│  │  ─────────────────                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │  Dashboard redesign concept - dark mode variant                 │  │  │
│  │  │                                                                 │  │  │
│  │  │  Placeholder: Add a caption or description...                   │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ✓ Auto-saved                                                         │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  TAGS                                                                 │  │
│  │  ────                                                                 │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌───────────┐                       │  │
│  │  │ Screenshots │ │   Design    │ │  + Add    │                       │  │
│  │  └─────────────┘ └─────────────┘ └───────────┘                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Image Preview Sections

### Main Image Viewer
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Container:                                                           │  │
│  │  - Background: gray-100 (checkerboard for transparency)               │  │
│  │  - Border-radius: 8px                                                 │  │
│  │  - Overflow: hidden                                                   │  │
│  │  - Height: 350px (max)                                                │  │
│  │  - Display: flex                                                      │  │
│  │  - Align-items: center                                                │  │
│  │  - Justify-content: center                                            │  │
│  │  - Position: relative                                                 │  │
│  │  - Cursor: grab (default), grabbing (when dragging)                   │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │                                                                 │  │  │
│  │  │                                                                 │  │  │
│  │  │                        IMAGE                                    │  │  │
│  │  │                                                                 │  │  │
│  │  │                        Object-fit: contain                      │  │  │
│  │  │                        Transform: scale() translate()           │  │  │
│  │  │                        Transition: transform 150ms              │  │  │
│  │  │                                                                 │  │  │
│  │  │                                                                 │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Interactions:                                                              │
│  - Scroll wheel: Zoom in/out (centered on cursor)                          │
│  - Click + drag: Pan image (when zoomed > 100%)                             │
│  - Double-click: Toggle between fit and 100%                                │
│  - Pinch (touch): Zoom gesture                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

**Transparency Checkerboard Pattern:**
```css
.image-viewer-bg {
  background-image:
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  background-color: #fafafa;
}
```

### Zoom Controls
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │   ┌───┐   ══════════════════●══════════════════   ┌───┐              │  │
│  │   │ − │                                           │ + │   150%       │  │
│  │   └───┘                                           └───┘              │  │
│  │                                                                       │  │
│  │         Slider track: 180px wide                    Percentage        │  │
│  │                                                     display           │  │
│  │                                                                       │  │
│  │                                                   ┌────────────────┐  │  │
│  │                                                   │  ⟲ Fit to view │  │  │
│  │                                                   └────────────────┘  │  │
│  │                                                   Reset button        │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Container:                                                                 │
│  - Display: flex                                                            │
│  - Align-items: center                                                      │
│  - Gap: 12px                                                                │
│  - Padding: 12px 16px                                                       │
│  - Background: gray-50                                                      │
│  - Border-radius: 8px                                                       │
│  - Margin: 12px 0                                                           │
│                                                                             │
│  Zoom buttons (−, +):                                                       │
│  - Size: 32px × 32px                                                        │
│  - Border-radius: 6px                                                       │
│  - Background: white                                                        │
│  - Border: 1px solid gray-200                                               │
│  - Icon: 16px, gray-600                                                     │
│  - Hover: bg-gray-100                                                       │
│  - Disabled (at min/max): opacity 0.5                                       │
│                                                                             │
│  Slider:                                                                    │
│  - Width: 180px                                                             │
│  - Height: 4px track                                                        │
│  - Track: gray-200                                                          │
│  - Fill: gray-900                                                           │
│  - Thumb: 16px circle, white, border: 2px gray-400                          │
│  - Range: 25% to 400%                                                       │
│                                                                             │
│  Percentage display:                                                        │
│  - Width: 50px                                                              │
│  - Font-size: 13px                                                          │
│  - Color: gray-600                                                          │
│  - Font-variant-numeric: tabular-nums                                       │
│                                                                             │
│  Reset button:                                                              │
│  - Height: 32px                                                             │
│  - Padding: 0 12px                                                          │
│  - Ghost style                                                              │
│  - Icon: ⟲ rotate/reset                                                    │
│  - Text: "Fit to view"                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

**Zoom Levels:**
```typescript
const ZOOM_LEVELS = {
  min: 0.25,      // 25%
  fit: 'fit',     // Fit to container (calculated)
  full: 1.0,      // 100%
  max: 4.0,       // 400%
  step: 0.25,     // Step for buttons
};
```

### Multi-Image Navigation
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Only shown when item contains multiple images                              │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌───┐  ┌────────────────────────────────────────────────────┐ ┌───┐ │  │
│  │  │   │  │                                                    │ │   │ │  │
│  │  │ ◀ │  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │ │ ▶ │ │  │
│  │  │   │  │ │      │ │      │ │ ████ │ │      │ │      │      │ │   │ │  │
│  │  └───┘  │ │  1   │ │  2   │ │  3   │ │  4   │ │  5   │      │ └───┘ │  │
│  │         │ │      │ │      │ │active│ │      │ │      │      │       │  │
│  │         │ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘      │       │  │
│  │         │                                                    │       │  │
│  │         └────────────────────────────────────────────────────┘       │  │
│  │                                                                       │  │
│  │                           3 of 5                                      │  │
│  │                           ──────                                      │  │
│  │                           Position indicator                          │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Container:                                                                 │
│  - Padding: 12px 0                                                          │
│  - Display: flex                                                            │
│  - Align-items: center                                                      │
│  - Gap: 8px                                                                 │
│                                                                             │
│  Arrow buttons (◀ ▶):                                                       │
│  - Size: 36px × 36px                                                        │
│  - Border-radius: 8px                                                       │
│  - Background: white                                                        │
│  - Border: 1px solid gray-200                                               │
│  - Icon: 18px, gray-600                                                     │
│  - Hover: bg-gray-50                                                        │
│  - Disabled (at end): opacity 0.5                                           │
│                                                                             │
│  Thumbnail strip:                                                           │
│  - Flex: 1                                                                  │
│  - Overflow-x: auto                                                         │
│  - Scroll-snap-type: x mandatory                                            │
│  - Gap: 8px                                                                 │
│  - Padding: 4px                                                             │
│                                                                             │
│  Thumbnail:                                                                 │
│  - Size: 56px × 56px                                                        │
│  - Border-radius: 6px                                                       │
│  - Object-fit: cover                                                        │
│  - Border: 2px solid transparent                                            │
│  - Cursor: pointer                                                          │
│  - Scroll-snap-align: center                                                │
│                                                                             │
│  Active thumbnail:                                                          │
│  - Border: 2px solid blue-500                                               │
│  - Box-shadow: 0 0 0 2px blue-100                                           │
│                                                                             │
│  Position indicator:                                                        │
│  - Font-size: 13px                                                          │
│  - Color: gray-500                                                          │
│  - Text-align: center                                                       │
│  - Margin-top: 8px                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### File Info Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  FILE INFO                                                                  │
│  ─────────                                                                  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  📁  screenshot.png                                        [ Rename ] │  │
│  │      ────────────────                                                 │  │
│  │      Filename (editable)                                              │  │
│  │                                                                       │  │
│  │  1920 × 1080  ·  1.2 MB  ·  PNG  ·  sRGB                              │  │
│  │  ─────────────────────────────────────                                │  │
│  │  Dimensions · Size · Format · Color space                             │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Filename row:                                                              │
│  - Icon: 📁 or file type icon                                              │
│  - Filename: 15px, medium weight, gray-900                                 │
│  - Rename button: Ghost, appears on hover                                   │
│                                                                             │
│  Metadata row:                                                              │
│  - Font-size: 13px                                                          │
│  - Color: gray-500                                                          │
│  - Items separated by " · "                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### AI Detected Content
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  AI DETECTED CONTENT                                                        │
│  ───────────────────                                                        │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌───────────┐ ┌─────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐  │  │
│  │  │ dashboard │ │  chart  │ │ analytics │ │ dark mode │ │ sidebar  │  │  │
│  │  └───────────┘ └─────────┘ └───────────┘ └───────────┘ └──────────┘  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Confidence: 94%    ·    [ 🔄 Re-analyze ]                                  │
│                                                                             │
│  Container:                                                                 │
│  - Background: purple-50                                                    │
│  - Border: 1px solid purple-100                                             │
│  - Border-radius: 10px                                                      │
│  - Padding: 16px                                                            │
│                                                                             │
│  AI tag chips:                                                              │
│  - Background: white                                                        │
│  - Border: 1px solid purple-200                                             │
│  - Border-radius: 6px                                                       │
│  - Padding: 6px 12px                                                        │
│  - Font-size: 13px                                                          │
│  - Color: purple-700                                                        │
│  - Cursor: pointer (click to filter library by tag)                         │
│  - Hover: bg-purple-100                                                     │
│                                                                             │
│  Confidence:                                                                │
│  - Font-size: 12px                                                          │
│  - Color: gray-500                                                          │
│                                                                             │
│  Re-analyze button:                                                         │
│  - Ghost style                                                              │
│  - Triggers new AI analysis                                                 │
│                                                                             │
│  States:                                                                    │
│  - Loading: Show skeleton tags                                              │
│  - No tags: "No content detected" with analyze button                       │
│  - Error: "Analysis failed" with retry                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Caption / Alt Text Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  CAPTION                                                                    │
│  ───────                                                                    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Dashboard redesign concept - dark mode variant with                  │  │
│  │  improved sidebar navigation and data visualization.                  │  │
│  │                                                                       │  │
│  │  Placeholder: Add a caption or description...                         │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ✓ Auto-saved                                                               │
│                                                                             │
│  Text area:                                                                 │
│  - Background: white                                                        │
│  - Border: 1px solid gray-200                                               │
│  - Border-radius: 8px                                                       │
│  - Padding: 12px                                                            │
│  - Min-height: 80px                                                         │
│  - Font-size: 14px                                                          │
│  - Line-height: 1.5                                                         │
│  - Resize: vertical                                                         │
│  - Placeholder: gray-400                                                    │
│  - Focus: ring-2 ring-blue-500                                              │
│                                                                             │
│  Auto-save: Same pattern as URL preview notes                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Image Viewer Interactions

### Zoom State Management
```typescript
interface ImageViewerState {
  zoom: number;           // Current zoom level (0.25 - 4.0)
  pan: { x: number; y: number };  // Pan offset in pixels
  isDragging: boolean;
}

function useImageViewer(imageRef: RefObject<HTMLImageElement>) {
  const [state, setState] = useState<ImageViewerState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    isDragging: false,
  });

  // Zoom to point (cursor position)
  const zoomToPoint = (newZoom: number, point: { x: number; y: number }) => {
    const clampedZoom = Math.max(0.25, Math.min(4, newZoom));
    // Calculate new pan to keep point stationary
    // ... transform math
    setState(prev => ({ ...prev, zoom: clampedZoom, pan: newPan }));
  };

  // Handle wheel zoom
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const point = { x: e.offsetX, y: e.offsetY };
    zoomToPoint(state.zoom + delta, point);
  };

  // Handle drag pan
  const handleMouseDown = (e: MouseEvent) => {
    if (state.zoom > 1) {
      setState(prev => ({ ...prev, isDragging: true }));
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (state.isDragging) {
      setState(prev => ({
        ...prev,
        pan: {
          x: prev.pan.x + e.movementX,
          y: prev.pan.y + e.movementY,
        },
      }));
    }
  };

  // Double-click to toggle fit/100%
  const handleDoubleClick = () => {
    setState(prev => ({
      ...prev,
      zoom: prev.zoom === 1 ? calculateFitZoom() : 1,
      pan: { x: 0, y: 0 },
    }));
  };

  // Reset to fit
  const resetView = () => {
    setState({
      zoom: calculateFitZoom(),
      pan: { x: 0, y: 0 },
      isDragging: false,
    });
  };

  return {
    ...state,
    zoomIn: () => zoomToPoint(state.zoom + 0.25, center),
    zoomOut: () => zoomToPoint(state.zoom - 0.25, center),
    resetView,
    handlers: {
      onWheel: handleWheel,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: () => setState(prev => ({ ...prev, isDragging: false })),
      onDoubleClick: handleDoubleClick,
    },
  };
}
```

---

## Image Preview Props
```typescript
interface ImagePreviewProps {
  // Data
  data: ImageCardData;

  // Current image (for multi-image)
  currentImageIndex: number;
  onImageIndexChange: (index: number) => void;

  // Caption
  caption: string;
  onCaptionChange: (caption: string) => void;
  captionSaveStatus: "idle" | "saving" | "saved" | "error";

  // AI tags
  aiTags: string[];
  aiTagsStatus: "idle" | "loading" | "success" | "error";
  aiConfidence?: number;
  onReanalyze: () => void;
  onAiTagClick: (tag: string) => void;  // Filter by tag

  // User tags
  tags: string[];
  availableTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;

  // File operations
  onRename: (newName: string) => void;
  onDownload: () => void;
  onRotate: (degrees: number) => void;  // Optional rotation feature
}
```

---

# PART 2: VOICE PREVIEW

## Voice Preview Layout
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  LARGE WAVEFORM PLAYER                                                │  │
│  │  ─────────────────────                                                │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │   ▁▂▃▅▆▇█▇▆▅▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▃▂▁      │  │  │
│  │  │   ▁▂▃▅▆▇█▇▆▅▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▃▂▁      │  │  │
│  │  │                        ▲                                        │  │  │
│  │  │                        │                                        │  │  │
│  │  │                   Playhead                                      │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  PLAYBACK CONTROLS                                                    │  │
│  │  ─────────────────                                                    │  │
│  │                                                                       │  │
│  │        ┌─────┐    ┌─────────┐    ┌─────┐                              │  │
│  │        │ ⏪  │    │         │    │  ⏩ │       0:32 / 1:24            │  │
│  │        │-15s │    │   ▶/❚❚  │    │+15s │                              │  │
│  │        └─────┘    │         │    └─────┘                              │  │
│  │                   └─────────┘                                         │  │
│  │                   Play/Pause                                          │  │
│  │                                                                       │  │
│  │  🔊 ═══════●═══════════     │ 0.5x │ 1x │ 1.5x │ 2x │                │  │
│  │     Volume slider            Playback speed                           │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  TRANSCRIPT                                                    ▾      │  │
│  │  ──────────                                                           │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │  [0:00]  Remember to call back the client about the            │  │  │
│  │  │          proposal. They mentioned wanting to see more          │  │  │
│  │  │          options for the color palette.                        │  │  │
│  │  │                                                                 │  │  │
│  │  │  [0:15]  Also need to schedule a follow-up meeting for         │  │  │
│  │  │          next Tuesday. Check if Sarah is available.            │  │  │
│  │  │                                                                 │  │  │
│  │  │  [0:32]  The deadline for the first draft is Friday.           │  │  │
│  │  │          Make sure to send a reminder to the team.             │  │  │
│  │  │                                                                 │  │  │
│  │  │  [0:48]  Budget discussion: they're flexible on pricing        │  │  │
│  │  │          but want to stay under fifty thousand.                │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  Confidence: 98%  ·  [ ✏️ Edit transcript ]  ·  [ 📋 Copy all ]       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  TAGS                                                                 │  │
│  │  ┌───────┐ ┌─────────┐ ┌───────────┐                                 │  │
│  │  │ calls │ │ clients │ │  + Add    │                                 │  │
│  │  └───────┘ └─────────┘ └───────────┘                                 │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  DETAILS                                                              │  │
│  │  Recorded: Dec 13, 2024 at 10:30 AM                                   │  │
│  │  Duration: 1:24                                                       │  │
│  │  File size: 2.4 MB                                                    │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Voice Preview Sections

### Large Waveform Display
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Container:                                                           │  │
│  │  - Background: gray-100                                               │  │
│  │  - Border-radius: 12px                                                │  │
│  │  - Padding: 24px                                                      │  │
│  │  - Height: 120px                                                      │  │
│  │  - Cursor: pointer                                                    │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │   ▁▂▃▅▆▇█▇▆▅▃▂▁▂▃▄▅▆▇█│▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▃▂▁      │  │  │
│  │  │   ▁▂▃▅▆▇█▇▆▅▃▂▁▂▃▄▅▆▇█│▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▃▂▁      │  │  │
│  │  │                       ▲                                         │  │  │
│  │  │                       │                                         │  │  │
│  │  │                   Playhead line                                 │  │  │
│  │  │                   2px wide, orange-500                          │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  Time markers below:                                                  │  │
│  │  0:00          0:20          0:40          1:00          1:24        │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Waveform bars:                                                             │
│  - Width: 3px per bar                                                       │
│  - Gap: 2px                                                                 │
│  - Border-radius: 1.5px (rounded caps)                                      │
│  - Height: Proportional to amplitude (min 8px, max 80px)                    │
│                                                                             │
│  Bar colors:                                                                │
│  - Played: orange-500                                                       │
│  - Unplayed: gray-300                                                       │
│  - Hover preview: orange-300 (shows where click would seek)                 │
│                                                                             │
│  Playhead:                                                                  │
│  - Width: 2px                                                               │
│  - Color: orange-600                                                        │
│  - Full height of waveform                                                  │
│  - Top: Circle indicator (8px)                                              │
│                                                                             │
│  Time markers:                                                              │
│  - Font-size: 11px                                                          │
│  - Color: gray-400                                                          │
│  - Show every 20 seconds (adjust based on duration)                         │
│                                                                             │
│  Hover tooltip:                                                             │
│  - Show time at cursor position                                             │
│  - Small tooltip above waveform                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Playback Controls
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │         ┌───────┐      ┌─────────────┐      ┌───────┐                 │  │
│  │         │       │      │             │      │       │                 │  │
│  │         │  ⏪   │      │    ▶ / ❚❚   │      │  ⏩   │     0:32/1:24   │  │
│  │         │ -15s  │      │             │      │ +15s  │                 │  │
│  │         │       │      │             │      │       │                 │  │
│  │         └───────┘      └─────────────┘      └───────┘                 │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Skip buttons (⏪ ⏩):                                                       │
│  - Size: 44px × 44px                                                        │
│  - Border-radius: 10px                                                      │
│  - Background: gray-100                                                     │
│  - Icon: 20px, gray-600                                                     │
│  - Hover: bg-gray-200                                                       │
│  - Label below: "15s" in 10px, gray-500                                     │
│                                                                             │
│  Play/Pause button:                                                         │
│  - Size: 64px × 64px                                                        │
│  - Border-radius: full (circle)                                             │
│  - Background: orange-500                                                   │
│  - Icon: 28px, white                                                        │
│  - Hover: bg-orange-600                                                     │
│  - Active: bg-orange-700, scale(0.95)                                       │
│  - Focus: ring-4 ring-orange-200                                            │
│                                                                             │
│  Time display:                                                              │
│  - Font-size: 16px                                                          │
│  - Font-weight: 500                                                         │
│  - Font-variant-numeric: tabular-nums                                       │
│  - Color: gray-700                                                          │
│  - Format: "current / total"                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Volume & Speed Controls
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  🔊 ═══════════●════════════                                          │  │
│  │     Volume slider                                                     │  │
│  │                                                                       │  │
│  │  - Icon: Speaker (adjusts based on level)                             │  │
│  │    - 🔇 Muted (0%)                                                    │  │
│  │    - 🔈 Low (1-33%)                                                   │  │
│  │    - 🔉 Medium (34-66%)                                               │  │
│  │    - 🔊 High (67-100%)                                                │  │
│  │  - Slider width: 120px                                                │  │
│  │  - Click icon to toggle mute                                          │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                          │  │
│  │  │  0.5x  │ │   1x   │ │  1.5x  │ │   2x   │                          │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘                          │  │
│  │                 ▲                                                     │  │
│  │                 │                                                     │  │
│  │            Active (highlighted)                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Speed buttons:                                                             │
│  - Container: border: 1px solid gray-200, rounded-lg                        │
│  - Each button: Height 32px, padding 0 12px                                 │
│  - Default: bg-white, color gray-600                                        │
│  - Active: bg-gray-900, color white                                         │
│  - Hover (inactive): bg-gray-50                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Transcript Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  TRANSCRIPT                                                          [ ▾ ]  │
│  ──────────                                                                 │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌─────────┐                                                          │  │
│  │  │  0:00   │  Remember to call back the client about the             │  │
│  │  │         │  proposal. They mentioned wanting to see more           │  │
│  │  │  click  │  options for the color palette.                         │  │
│  │  │ to seek │                                                          │  │
│  │  └─────────┘                                                          │  │
│  │                                                                       │  │
│  │  ┌─────────┐                                                          │  │
│  │  │  0:15   │  Also need to schedule a follow-up meeting for          │  │
│  │  │         │  next Tuesday. Check if Sarah is available.             │  │
│  │  └─────────┘                                                          │  │
│  │                                        ▲                              │  │
│  │                                        │                              │  │
│  │                              Currently playing segment                │  │
│  │                              (highlighted bg)                         │  │
│  │                                                                       │  │
│  │  ┌─────────┐                                                          │  │
│  │  │  0:32   │  The deadline for the first draft is Friday.            │  │
│  │  └─────────┘  Make sure to send a reminder to the team.              │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Container:                                                                 │
│  - Max-height: 300px                                                        │
│  - Overflow-y: auto                                                         │
│  - Background: white                                                        │
│  - Border: 1px solid gray-200                                               │
│  - Border-radius: 10px                                                      │
│  - Padding: 16px                                                            │
│                                                                             │
│  Timestamp buttons:                                                         │
│  - Background: gray-100                                                     │
│  - Border-radius: 4px                                                       │
│  - Padding: 4px 8px                                                         │
│  - Font-size: 12px                                                          │
│  - Font-family: monospace                                                   │
│  - Color: gray-500                                                          │
│  - Cursor: pointer                                                          │
│  - Hover: bg-gray-200, color gray-700                                       │
│  - Click: Seeks audio to that timestamp                                     │
│                                                                             │
│  Transcript text:                                                           │
│  - Font-size: 15px                                                          │
│  - Line-height: 1.6                                                         │
│  - Color: gray-700                                                          │
│                                                                             │
│  Active segment:                                                            │
│  - Background: orange-50                                                    │
│  - Border-left: 3px solid orange-500                                        │
│  - Padding-left: 12px                                                       │
│  - Auto-scroll into view during playback                                    │
│                                                                             │
│  Segment spacing: 16px between segments                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Transcript Editing Mode
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  TRANSCRIPT                                              [ ✓ Done editing ] │
│  ──────────                                                                 │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌─────────┐  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  0:00   │  │ Remember to call back the client about the         │ │  │
│  │  │         │  │ proposal. They mentioned wanting to see more       │ │  │
│  │  │         │  │ options for the color palette.█                    │ │  │
│  │  └─────────┘  └─────────────────────────────────────────────────────┘ │  │
│  │                                                                       │  │
│  │  Each segment becomes editable textarea                               │  │
│  │  - Border: 1px solid blue-300                                         │  │
│  │  - Background: blue-50                                                │  │
│  │  - Focus ring on active segment                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ⚠️ Editing transcript. Changes will be saved when you click "Done".        │
│                                                                             │
│  Edit mode features:                                                        │
│  - Each segment is a textarea                                               │
│  - Tab moves to next segment                                                │
│  - Shift+Tab moves to previous                                              │
│  - Escape cancels all changes                                               │
│  - "Done" saves changes                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Transcript Actions Bar
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Confidence: 98%   ·   [ ✏️ Edit ]   ·   [ 📋 Copy all ]   ·   [ 🔄 Redo ] │
│                                                                             │
│  Actions bar below transcript:                                              │
│  - Font-size: 13px                                                          │
│  - Color: gray-500                                                          │
│  - Buttons: Ghost style                                                     │
│                                                                             │
│  Confidence indicator:                                                      │
│  - Shows AI confidence percentage                                           │
│  - < 80%: Show warning color (orange)                                       │
│  - < 60%: Show error color (red) + suggestion to review                     │
│                                                                             │
│  Edit button:                                                               │
│  - Toggles edit mode                                                        │
│  - Changes to "Done editing" when active                                    │
│                                                                             │
│  Copy all:                                                                  │
│  - Copies full transcript to clipboard                                      │
│  - Shows "Copied!" feedback                                                 │
│                                                                             │
│  Redo transcription:                                                        │
│  - Re-runs AI transcription                                                 │
│  - Confirms before overwriting edited transcript                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Transcript States

| State | Appearance |
|-------|------------|
| Transcribing | "Transcribing audio..." with progress bar |
| Success | Shows timestamped transcript |
| Partial | Shows transcript with low-confidence sections highlighted |
| Failed | "Transcription failed" with retry button |
| Not requested | "No transcript" with "Generate transcript" button |

---

## Voice Preview Props
```typescript
interface VoicePreviewProps {
  // Data
  data: VoiceCardData;

  // Playback state (controlled)
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;

  // Playback controls
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onSpeedChange: (speed: number) => void;

  // Transcript
  transcript: TranscriptSegment[];
  transcriptStatus: "idle" | "transcribing" | "success" | "partial" | "failed";
  transcriptConfidence?: number;
  isEditingTranscript: boolean;
  onToggleEditTranscript: () => void;
  onTranscriptChange: (segments: TranscriptSegment[]) => void;
  onCopyTranscript: () => void;
  onRetranscribe: () => void;

  // Waveform
  waveformData: number[];  // Amplitude values for visualization

  // Tags
  tags: string[];
  availableTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

interface TranscriptSegment {
  id: string;
  startTime: number;      // Seconds
  endTime: number;        // Seconds
  text: string;
  confidence?: number;    // 0-1 confidence score
}
```

---

# PART 3: WEB CLIP PREVIEW

## Web Clip Preview Layout
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  SOURCE ARTICLE                                                       │  │
│  │  ──────────────                                                       │  │
│  │                                                                       │  │
│  │  ┌────────────────────────────────────────────────────────────────┐   │  │
│  │  │                                                                │   │  │
│  │  │  🌐  How to Build Better User Interfaces                       │   │  │
│  │  │      ux-magazine.com                                           │   │  │
│  │  │                                                                │   │  │
│  │  │      Published: Dec 10, 2024  ·  By Sarah Chen                 │   │  │
│  │  │                                                                │   │  │
│  │  │                                    [ Open source article → ]   │   │  │
│  │  │                                                                │   │  │
│  │  └────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  CLIPPED CONTENT                                                      │  │
│  │  ───────────────                                                      │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ ┃                                                               │  │  │
│  │  │ ┃  "The best interfaces are almost invisible. Users            │  │  │
│  │  │ ┃  shouldn't have to think about how to use your product       │  │  │
│  │  │ ┃  — they should just be able to accomplish their goals.       │  │  │
│  │  │ ┃                                                               │  │  │
│  │  │ ┃  This principle, often called 'intuitive design,' is at      │  │  │
│  │  │ ┃  the heart of every successful user interface. When          │  │  │
│  │  │ ┃  users have to stop and figure out how something works,      │  │  │
│  │  │ ┃  you've already lost them."                                  │  │  │
│  │  │ ┃                                                               │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ── OR if image clip ──                                               │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │                    CLIPPED IMAGE                                │  │  │
│  │  │                    (with zoom controls)                         │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  YOUR NOTES                                                           │  │
│  │  ──────────                                                           │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │  This is a great quote for the design principles document.     │  │  │
│  │  │  Relates to our progressive disclosure discussion.             │  │  │
│  │  │                                                                 │  │  │
│  │  │  Could use this in the client presentation too.                │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ✓ Auto-saved                                                         │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ✨ RELATED IN YOUR LIBRARY                                           │  │
│  │  ──────────────────────────                                           │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │  📝  Design principles draft                              →    │  │  │
│  │  │      Note · Created last week                                   │  │  │
│  │  │                                                                 │  │  │
│  │  ├─────────────────────────────────────────────────────────────────┤  │  │
│  │  │                                                                 │  │  │
│  │  │  🔗  Nielsen Norman Group - 10 Usability Heuristics       →    │  │  │
│  │  │      Link · Saved 2 months ago                                  │  │  │
│  │  │                                                                 │  │  │
│  │  ├─────────────────────────────────────────────────────────────────┤  │  │
│  │  │                                                                 │  │  │
│  │  │  🌐  Web clip from smashingmagazine.com                   →    │  │  │
│  │  │      "Good design is obvious. Great design is transparent"      │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  AI found 3 related items based on content similarity                 │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  TAGS                                                                 │  │
│  │  ┌─────┐ ┌──────────┐ ┌─────────────┐ ┌───────────┐                  │  │
│  │  │ #UX │ │ #design  │ │ #principles │ │  + Add    │                  │  │
│  │  └─────┘ └──────────┘ └─────────────┘ └───────────┘                  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  DETAILS                                                              │  │
│  │  Clipped: Dec 13, 2024 at 11:45 AM                                    │  │
│  │  Source: Chrome Extension                                             │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Web Clip Preview Sections

### Source Article Card
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  SOURCE ARTICLE                                                             │
│  ──────────────                                                             │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌────┐                                                               │  │
│  │  │ 🌐 │   How to Build Better User Interfaces                        │  │
│  │  │    │   ─────────────────────────────────                          │  │
│  │  │favi│   Article title (from og:title)                              │  │
│  │  │con │                                                               │  │
│  │  └────┘   ux-magazine.com                                            │  │
│  │           ──────────────────                                          │  │
│  │           Domain                                                      │  │
│  │                                                                       │  │
│  │           Published: Dec 10, 2024  ·  By Sarah Chen                   │  │
│  │           ─────────────────────────────────────                       │  │
│  │           Metadata (if available)                                     │  │
│  │                                                                       │  │
│  │                                          ┌────────────────────────┐   │  │
│  │                                          │ Open source article → │   │  │
│  │                                          └────────────────────────┘   │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Container:                                                                 │
│  - Background: gray-50                                                      │
│  - Border: 1px solid gray-200                                               │
│  - Border-radius: 10px                                                      │
│  - Padding: 16px                                                            │
│                                                                             │
│  Favicon:                                                                   │
│  - Size: 32px × 32px                                                        │
│  - Border-radius: 6px                                                       │
│  - Background: white                                                        │
│  - Fallback: Globe icon 🌐                                                  │
│                                                                             │
│  Title:                                                                     │
│  - Font-size: 16px                                                          │
│  - Font-weight: 600                                                         │
│  - Color: gray-900                                                          │
│  - Line-clamp: 2                                                            │
│                                                                             │
│  Domain:                                                                    │
│  - Font-size: 13px                                                          │
│  - Color: gray-500                                                          │
│                                                                             │
│  Metadata:                                                                  │
│  - Font-size: 13px                                                          │
│  - Color: gray-400                                                          │
│  - Optional: Only show if available                                         │
│                                                                             │
│  Open button:                                                               │
│  - Primary button style                                                     │
│  - Opens source URL in new tab                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Clipped Content — Text
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  CLIPPED CONTENT                                                            │
│  ───────────────                                                            │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┃  "The best interfaces are almost invisible. Users                 │  │
│  │  ┃  shouldn't have to think about how to use your product            │  │
│  │  ┃  — they should just be able to accomplish their goals.            │  │
│  │  ┃                                                                   │  │
│  │  ┃  This principle, often called 'intuitive design,' is at           │  │
│  │  ┃  the heart of every successful user interface."                   │  │
│  │  ┃                                                                   │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Container:                                                                 │
│  - Background: blue-50                                                      │
│  - Border-left: 4px solid blue-400                                          │
│  - Border-radius: 0 10px 10px 0                                             │
│  - Padding: 20px 20px 20px 24px                                             │
│                                                                             │
│  Text:                                                                      │
│  - Font-size: 16px                                                          │
│  - Line-height: 1.7                                                         │
│  - Color: gray-700                                                          │
│  - Font-style: italic (optional, for quote feel)                            │
│                                                                             │
│  Curly quotes: Use " " not " "                                              │
│                                                                             │
│  [ 📋 Copy clip ]  button below                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Clipped Content — Image
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  CLIPPED CONTENT                                                            │
│  ───────────────                                                            │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │                                                                       │  │
│  │                     CLIPPED IMAGE                                     │  │
│  │                                                                       │  │
│  │                     (same viewer as Image Preview)                    │  │
│  │                     - Zoom controls                                   │  │
│  │                     - Max-height: 300px                               │  │
│  │                                                                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  "Dashboard design mockup"                                                  │
│  ─────────────────────────                                                  │
│  Image caption (if captured from source)                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Personal Notes Section

Same as URL Preview — editable textarea with auto-save.

### AI Related Items Section
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ✨ RELATED IN YOUR LIBRARY                                                 │
│  ──────────────────────────                                                 │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Container:                                                           │  │
│  │  - Background: purple-50                                              │  │
│  │  - Border: 1px solid purple-100                                       │  │
│  │  - Border-radius: 10px                                                │  │
│  │  - Padding: 0 (items handle padding)                                  │  │
│  │  - Overflow: hidden                                                   │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │  ┌────┐                                                         │  │  │
│  │  │  │ 📝 │  Design principles draft                           →   │  │  │
│  │  │  │    │  Note · Created last week                              │  │  │
│  │  │  └────┘                                                         │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  Each related item:                                                   │  │
│  │  - Padding: 14px 16px                                                 │  │
│  │  - Border-bottom: 1px solid purple-100 (except last)                  │  │
│  │  - Display: flex, align-items: center                                 │  │
│  │  - Cursor: pointer                                                    │  │
│  │  - Hover: bg-purple-100                                               │  │
│  │                                                                       │  │
│  │  Type icon:                                                           │  │
│  │  - 📝 Note, 🔗 Link, 🖼️ Image, 🎤 Voice, 🌐 Web clip                  │  │
│  │  - Size: 32px container, 16px icon                                    │  │
│  │  - Background: white                                                  │  │
│  │  - Border-radius: 6px                                                 │  │
│  │                                                                       │  │
│  │  Title: 14px, medium, gray-900, line-clamp-1                          │  │
│  │  Subtitle: 13px, gray-500                                             │  │
│  │  Arrow: →, gray-400, rightmost                                        │  │
│  │                                                                       │  │
│  │  Click: Opens that item in preview panel (replaces current)           │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  AI found 3 related items based on content similarity                       │
│  ─────────────────────────────────────────────────────                      │
│  Font-size: 12px, color: gray-400                                           │
│                                                                             │
│  States:                                                                    │
│  - Loading: Skeleton items with pulse                                       │
│  - Empty: "No related items found"                                          │
│  - Error: Hidden (fail silently)                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Web Clip Preview Props
```typescript
interface WebClipPreviewProps {
  // Data
  data: WebClipCardData;

  // Personal notes
  userNotes: string;
  onNotesChange: (notes: string) => void;
  notesSaveStatus: "idle" | "saving" | "saved" | "error";

  // Related items (AI-powered)
  relatedItems: RelatedItem[];
  relatedItemsStatus: "idle" | "loading" | "success" | "error";
  onRelatedItemClick: (id: string) => void;

  // Tags
  tags: string[];
  availableTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;

  // Actions
  onOpenSource: () => void;
  onCopyClip: () => void;
  onImageClick?: () => void;  // If image clip, open in lightbox
}

interface RelatedItem {
  id: string;
  type: "url" | "note" | "image" | "voice" | "webclip";
  title: string;
  subtitle: string;  // e.g., "Note · Created last week"
}
```

---

## Responsive Behavior

### All Three Previews

| Breakpoint | Changes |
|------------|---------|
| < 640px | Single column layout. Reduced padding (16px). Smaller fonts. |
| 640px - 1024px | Standard layout as specified. |
| > 1024px | Standard layout. Consider max-width constraints for readability. |

### Image Preview Responsive

| Breakpoint | Image Viewer Height |
|------------|---------------------|
| < 640px | 250px max |
| 640px+ | 350px max |
| Fullscreen mode | Full viewport height minus controls |

### Voice Preview Responsive

| Breakpoint | Changes |
|------------|---------|
| < 640px | Waveform height: 80px. Smaller play button (48px). Volume slider hidden (icon-only mute toggle). |
| 640px+ | Full controls as specified. |

---

## Verification Checklist

### Image Preview
☐ Main image displays correctly
☐ Zoom controls work (slider, buttons, scroll wheel)
☐ Pan/drag works when zoomed in
☐ Double-click toggles between fit and 100%
☐ Reset button returns to fit view
☐ Multi-image navigation works (arrows, thumbnails)
☐ Current image indicator updates
☐ Transparency checkerboard shows for transparent images
☐ File info displays correctly
☐ AI detected content shows (or loading/empty states)
☐ AI tags are clickable
☐ Caption field auto-saves
☐ Tags section works

### Voice Preview
☐ Waveform displays amplitude data
☐ Playhead moves during playback
☐ Clicking waveform seeks to position
☐ Play/pause button works
☐ Skip buttons (-15s, +15s) work
☐ Time display updates during playback
☐ Volume slider works
☐ Mute toggle works
☐ Playback speed buttons work
☐ Transcript displays with timestamps
☐ Clicking timestamp seeks audio
☐ Current segment highlights during playback
☐ Edit transcript mode works
☐ Copy transcript works
☐ Tags section works

### Web Clip Preview
☐ Source article card displays correctly
☐ Open source button works (new tab)
☐ Clipped text displays with quote styling
☐ Clipped image displays (if image clip)
☐ Copy clip button works
☐ Personal notes auto-save
☐ Related items display (or loading/empty states)
☐ Clicking related item navigates to it
☐ Tags section works

## Output

Create three React components:

1. **ImagePreview** — Full image viewer with zoom, multi-image navigation, AI tags, and caption editing
2. **VoicePreview** — Audio player with waveform, transcript, and editing capabilities
3. **WebClipPreview** — Clipped content display with source attribution and AI-suggested connections

Use Tailwind CSS for styling. All components render as children of PreviewPanelShell. Ensure smooth interactions (zoom, pan, seek) and proper state management. Include all loading, error, and empty states.

For the waveform visualization, you may use a library like wavesurfer.js or implement a custom canvas/SVG solution.

Implementation Notes
Key Techniques Used:
TechniqueWhyTransform-based zoom/panSmooth performance, hardware acceleratedTimestamp-linked transcriptEnables quick navigation, common in podcast appsAI-suggested connectionsBuilds knowledge graph, helps users discover related contentAuto-scrolling transcriptCurrent segment always visible during playbackConfidence indicatorsUsers know when to trust/verify AI output
Design Choices:

Checkerboard for transparency — Standard pattern for image editors. Helps users see transparent areas clearly.
Large waveform with time markers — Voice memos benefit from visual timeline. Time markers help orientation for longer recordings.
Editable transcript — AI transcription isn't perfect. Users need to correct errors, especially for names, technical terms.
Related items as AI feature — Surfacing connections builds the "second brain" value proposition. Purple styling signals AI-powered feature.
Source card prominent in Web Clip — Attribution is essential. Users need to return to source easily.


Expected Output Structure
jsx// ImagePreview.tsx
<div className="image-preview">
  <ImageViewer
    images={data.images}
    currentIndex={currentImageIndex}
    zoom={zoom}
    pan={pan}
    onZoomChange={handleZoomChange}
    onPanChange={handlePanChange}
  />

  <ZoomControls
    zoom={zoom}
    onZoomIn={handleZoomIn}
    onZoomOut={handleZoomOut}
    onReset={handleResetView}
  />

  {data.images.length > 1 && (
    <MultiImageNavigation
      images={data.images}
      currentIndex={currentImageIndex}
      onIndexChange={onImageIndexChange}
    />
  )}

  <FileInfoSection image={currentImage} onRename={onRename} />

  <AIDetectedContent
    tags={aiTags}
    status={aiTagsStatus}
    confidence={aiConfidence}
    onTagClick={onAiTagClick}
    onReanalyze={onReanalyze}
  />

  <CaptionSection
    caption={caption}
    onChange={onCaptionChange}
    saveStatus={captionSaveStatus}
  />

  <TagsSection ... />
</div>

// VoicePreview.tsx
<div className="voice-preview">
  <WaveformPlayer
    waveformData={waveformData}
    currentTime={currentTime}
    duration={duration}
    isPlaying={isPlaying}
    onSeek={onSeek}
  />

  <PlaybackControls
    isPlaying={isPlaying}
    currentTime={currentTime}
    duration={duration}
    onPlay={onPlay}
    onPause={onPause}
    onSkip={handleSkip}
  />

  <VolumeSpeedControls
    volume={volume}
    speed={playbackSpeed}
    onVolumeChange={onVolumeChange}
    onSpeedChange={onSpeedChange}
  />

  <TranscriptSection
    segments={transcript}
    status={transcriptStatus}
    confidence={transcriptConfidence}
    currentTime={currentTime}
    isEditing={isEditingTranscript}
    onToggleEdit={onToggleEditTranscript}
    onChange={onTranscriptChange}
    onCopy={onCopyTranscript}
    onSeek={onSeek}
  />

  <TagsSection ... />
  <DetailsSection ... />
</div>

// WebClipPreview.tsx
<div className="webclip-preview">
  <SourceArticleCard
    source={data.source}
    onOpen={onOpenSource}
  />

  <ClippedContentSection
    clipType={data.clipType}
    clippedText={data.clippedText}
    clippedImage={data.clippedImage}
    onCopy={onCopyClip}
    onImageClick={onImageClick}
  />

  <PersonalNotesSection
    notes={userNotes}
    onChange={onNotesChange}
    saveStatus={notesSaveStatus}
  />

  <RelatedItemsSection
    items={relatedItems}
    status={relatedItemsStatus}
    onItemClick={onRelatedItemClick}
  />

  <TagsSection ... />
  <DetailsSection ... />
</div>

Usage Guidelines

Image Preview: Test zoom from 25% to 400%, test pan when zoomed, test multi-image navigation
Voice Preview: Test playback, seeking via waveform and timestamps, test transcript editing
Web Clip Preview: Test text clips and image clips, test related items navigation
All: Verify auto-save works, test tags, test loading/error states