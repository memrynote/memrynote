# Capture Types Reference

## Zod Schemas

### CaptureTextSchema

```typescript
export const CaptureTextSchema = z.object({
  content: z.string().min(1).max(50000),
  title: z.string().min(1).max(200).optional(),
  tags: z.array(z.string().max(50)).max(20).optional()
})
```

### CaptureLinkSchema

```typescript
export const CaptureLinkSchema = z.object({
  url: z.string().max(2000),
  tags: z.array(z.string().max(50)).max(20).optional()
})
```

### CaptureImageSchema

```typescript
export const CaptureImageSchema = z.object({
  data: binaryDataSchema,  // Buffer | Uint8Array | ArrayBuffer
  filename: z.string().min(1).max(255),
  mimeType: z.enum([
    // Images
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
    // Audio
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4',
    'audio/x-m4a', 'audio/flac', 'audio/aac', 'audio/webm',
    // Video
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
    // Documents
    'application/pdf'
  ]),
  tags: z.array(z.string().max(50)).max(20).optional()
})
```

### CaptureVoiceSchema

```typescript
export const CaptureVoiceSchema = z.object({
  data: z.instanceof(Buffer),
  duration: z.number().min(0).max(300),  // Max 5 minutes
  format: z.enum(['webm', 'mp3', 'wav']),
  transcribe: z.boolean().default(true),
  tags: z.array(z.string().max(50)).max(20).optional()
})
```

### CaptureClipSchema

```typescript
export const CaptureClipSchema = z.object({
  html: z.string().max(100000),
  text: z.string().max(50000),
  sourceUrl: z.string().max(2000),
  sourceTitle: z.string().max(200),
  tags: z.array(z.string().max(50)).max(20).optional()
})
```

## Metadata Types

### LinkMetadata

```typescript
interface LinkMetadata {
  url: string
  siteName?: string
  description?: string
  excerpt?: string
  heroImage?: string | null
  favicon?: string | null
  author?: string
  publishedDate?: string
  fetchedAt: string
  fetchStatus: 'success' | 'partial' | 'failed'
}
```

### ImageMetadata

```typescript
interface ImageMetadata {
  originalFilename: string
  format: string
  width: number
  height: number
  fileSize: number
  hasExif: boolean
  caption?: string
}
```

### VoiceMetadata

```typescript
interface VoiceMetadata {
  duration: number
  format: string
  fileSize: number
  sampleRate?: number
}
```

### SocialMetadata

```typescript
interface SocialMetadata {
  platform: 'twitter' | 'linkedin' | 'mastodon' | 'bluesky' | 'threads' | 'other'
  postUrl: string
  authorName: string
  authorHandle: string
  authorAvatar?: string
  postContent: string
  timestamp?: string
  mediaUrls: string[]
  metrics?: {
    likes?: number
    reposts?: number
    replies?: number
  }
  isThread?: boolean
  threadId?: string
  extractionStatus: 'full' | 'partial' | 'failed'
}
```

### PdfMetadata

```typescript
interface PdfMetadata {
  originalFilename: string
  pageCount: number
  fileSize: number
  extractedTitle?: string
  author?: string
  creationDate?: string
  textExcerpt?: string
  hasText: boolean
  ocrStatus?: ProcessingStatus | 'skipped'
  isPasswordProtected?: boolean
}
```

### ReminderMetadata

```typescript
interface ReminderMetadata {
  reminderId: string
  targetType: 'note' | 'journal' | 'highlight'
  targetId: string
  targetTitle: string | null
  remindAt: string
  highlightText?: string
  highlightStart?: number
  highlightEnd?: number
  reminderNote?: string
}
```

## Processing Status

```typescript
type ProcessingStatus = 'pending' | 'processing' | 'complete' | 'failed'
```

## Attachment Storage

Attachments stored at: `{vaultPath}/attachments/inbox/{itemId}/`

| Type | File Pattern | Thumbnail |
|------|--------------|-----------|
| image | `{original-filename}` | `thumb_{hash}.jpg` |
| voice | `audio.{format}` | None |
| pdf | `{original-filename}` | None |
| video | `{original-filename}` | None |

## Binary Data Handling

IPC serialization can convert Buffer to various formats. The handler normalizes:

```typescript
let fileBuffer: Buffer
if (Buffer.isBuffer(parsed.data)) {
  fileBuffer = parsed.data
} else if (parsed.data instanceof Uint8Array) {
  fileBuffer = Buffer.from(parsed.data)
} else if (parsed.data instanceof ArrayBuffer) {
  fileBuffer = Buffer.from(parsed.data)
} else if (typeof parsed.data === 'object' && parsed.data !== null) {
  // Handle Electron's Buffer serialization: {type: 'Buffer', data: [...]}
  const data = parsed.data as Record<string, unknown>
  if (data.type === 'Buffer' && Array.isArray(data.data)) {
    fileBuffer = Buffer.from(data.data as number[])
  }
}
```
