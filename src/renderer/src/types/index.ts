export interface TreeDataItem {
  id: string
  name: string
  type?: 'file' | 'folder'
  children?: TreeDataItem[]
  isOpen?: boolean
  iconName?: string
  iconColor?: string
  disabled?: boolean
  draggable?: boolean
  customIcon?: string      // Kullanıcının seçtiği ikon adı (lucide icon name)
  inheritedIcon?: string   // Parent'tan gelen ikon adı
}

// Inbox item types
export type InboxItemType = "link" | "note" | "image" | "voice"

// Preview content types for each item type
export interface LinkPreviewContent {
  excerpt?: string
  heroImage?: string | null
  highlightedText?: string
}

export interface NotePreviewContent {
  fullText: string
}

export interface ImagePreviewContent {
  imageUrl?: string
  dimensions?: { width: number; height: number }
  fileSize?: string
  caption?: string
}

export interface VoicePreviewContent {
  audioUrl?: string
  transcription?: string
  transcriptionAuto?: boolean
}

export type PreviewContent =
  | LinkPreviewContent
  | NotePreviewContent
  | ImagePreviewContent
  | VoicePreviewContent

export interface InboxItem {
  id: string
  type: InboxItemType
  title: string
  timestamp: Date
  url?: string        // only for type "link"
  duration?: number   // only for type "voice" (seconds)
  content?: string    // only for type "note" (preview text)
  previewContent?: PreviewContent
}

// Filing system types
export interface Folder {
  id: string
  name: string
  path: string        // Full path like "Work / Project Alpha"
  parent?: string     // Parent folder name for hierarchy
}

export interface LinkedNote {
  id: string
  title: string
  type: "note" | "folder"
}
