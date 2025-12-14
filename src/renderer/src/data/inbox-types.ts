// ============================================================================
// INBOX TYPE SYSTEM
// ============================================================================
// Foundation types for the inbox feature. Defines the 8 content types,
// their properties, filtering options, and state management types.

// ============================================================================
// CONTENT TYPE DEFINITIONS
// ============================================================================

/**
 * The 8 content types an inbox item can be
 */
export type InboxItemType =
  | 'link'      // URL captures (articles, pages, bookmarks)
  | 'note'      // Text captures (quick notes, thoughts)
  | 'image'     // Image files (screenshots, photos)
  | 'voice'     // Audio recordings (voice memos)
  | 'pdf'       // PDF documents
  | 'webclip'   // Highlighted excerpts from web pages
  | 'file'      // Generic files (documents, downloads)
  | 'video'     // Video files or links

// ============================================================================
// BASE ITEM INTERFACE
// ============================================================================

/**
 * Base properties shared by all inbox items
 */
export interface InboxItemBase {
  id: string
  type: InboxItemType
  title: string
  createdAt: Date
  source: InboxItemSource
  tagIds: string[]
  folderId: string | null        // null = unfiled (in inbox)
  filedAt: Date | null           // when it was filed
  snoozedUntil: Date | null      // snooze return date
  snoozedAt: Date | null         // when snooze was set
}

/**
 * Source of inbox item capture
 */
export type InboxItemSource =
  | 'paste'           // Pasted content (Cmd+V)
  | 'drag-drop'       // Dragged file
  | 'browser-ext'     // Browser extension
  | 'share-menu'      // System share menu
  | 'voice-record'    // In-app voice recording
  | 'quick-capture'   // Quick capture hotkey
  | 'import'          // Bulk import
  | 'api'             // External API

// ============================================================================
// TYPE-SPECIFIC INTERFACES
// ============================================================================

/**
 * Link item - URL captures with rich preview
 */
export interface LinkItem extends InboxItemBase {
  type: 'link'
  url: string
  domain: string                  // extracted domain (fortelabs.com)
  favicon: string | null          // favicon URL
  heroImage: string | null        // og:image or first image
  excerpt: string | null          // meta description or first paragraph
}

/**
 * Note item - Text captures
 */
export interface NoteItem extends InboxItemBase {
  type: 'note'
  content: string                 // full text content
  wordCount: number               // computed word count
  preview: string                 // first 2-3 lines for display
}

/**
 * Image item - Image files
 */
export interface ImageItem extends InboxItemBase {
  type: 'image'
  imageUrl: string                // path or URL to image
  dimensions: ImageDimensions
  fileSize: string                // human readable (2.4 MB)
  caption: string | null          // optional user caption
  thumbnailUrl: string | null     // smaller preview version
}

export interface ImageDimensions {
  width: number
  height: number
}

/**
 * Voice item - Audio recordings
 */
export interface VoiceItem extends InboxItemBase {
  type: 'voice'
  audioUrl: string                // path to audio file
  duration: number                // length in seconds
  waveformData: number[]          // array for visualization (normalized 0-1)
  transcription: string | null    // text transcription if available
  isAutoTranscribed: boolean
}

/**
 * PDF item - PDF documents
 */
export interface PdfItem extends InboxItemBase {
  type: 'pdf'
  fileUrl: string                 // path to PDF
  pageCount: number               // number of pages
  fileSize: string                // human readable
  thumbnailUrl: string | null     // first page preview
  textPreview: string | null      // extracted first paragraph
}

/**
 * Webclip item - Highlighted excerpts from web pages
 */
export interface WebclipItem extends InboxItemBase {
  type: 'webclip'
  sourceUrl: string               // original page URL
  domain: string                  // source domain
  highlights: WebclipHighlight[]  // array of highlighted text excerpts
}

export interface WebclipHighlight {
  id: string
  text: string
  note: string | null             // optional annotation
}

/**
 * File item - Generic files
 */
export interface FileItem extends InboxItemBase {
  type: 'file'
  fileUrl: string                 // path to file
  fileName: string                // original filename
  extension: string               // file extension (docx, xlsx)
  fileSize: string                // human readable
  mimeType: string                // file MIME type
}

/**
 * Video item - Video files or links
 */
export interface VideoItem extends InboxItemBase {
  type: 'video'
  videoUrl: string                // URL or path
  thumbnailUrl: string | null     // preview frame
  duration: number                // length in seconds
  videoSource: VideoSource        // YouTube, Vimeo, local, etc.
}

export type VideoSource =
  | 'youtube'
  | 'vimeo'
  | 'local'
  | 'loom'
  | 'other'

// ============================================================================
// UNION TYPE FOR ALL INBOX ITEMS
// ============================================================================

/**
 * Union type representing any inbox item
 */
export type InboxItem =
  | LinkItem
  | NoteItem
  | ImageItem
  | VoiceItem
  | PdfItem
  | WebclipItem
  | FileItem
  | VideoItem

// ============================================================================
// VIEW MODE TYPES
// ============================================================================

/**
 * Display density modes
 */
export type InboxViewMode = 'compact' | 'medium' | 'expanded'

export const inboxViewModes: { id: InboxViewMode; label: string }[] = [
  { id: 'compact', label: 'Compact' },
  { id: 'medium', label: 'Medium' },
  { id: 'expanded', label: 'Expanded' },
]

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filter by content type
 */
export type InboxTypeFilter = 'all' | InboxItemType

export const inboxTypeFilterOptions: { value: InboxTypeFilter; label: string; icon: string }[] = [
  { value: 'all', label: 'All Types', icon: 'LayoutGrid' },
  { value: 'link', label: 'Links', icon: 'Link2' },
  { value: 'note', label: 'Notes', icon: 'FileText' },
  { value: 'image', label: 'Images', icon: 'Image' },
  { value: 'voice', label: 'Voice', icon: 'Mic' },
  { value: 'pdf', label: 'PDFs', icon: 'FileText' },
  { value: 'webclip', label: 'Webclips', icon: 'Scissors' },
  { value: 'file', label: 'Files', icon: 'File' },
  { value: 'video', label: 'Videos', icon: 'Video' },
]

/**
 * Filter by time period
 */
export type InboxTimeFilter = 'all' | 'today' | 'thisWeek' | 'older' | 'stale'

export const inboxTimeFilterOptions: { value: InboxTimeFilter; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'older', label: 'Older' },
  { value: 'stale', label: 'Stale (7d+)' },
]

/**
 * Sort options
 */
export type InboxSortOption = 'newest' | 'oldest' | 'type' | 'title'

export const inboxSortOptions: { value: InboxSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'type', label: 'By Type' },
  { value: 'title', label: 'By Title' },
]

/**
 * Combined filter state
 */
export interface InboxFilters {
  search: string
  typeFilter: InboxTypeFilter
  timeFilter: InboxTimeFilter
  sortBy: InboxSortOption
  showSnoozed: boolean
  tagIds: string[]                // empty = all tags
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const defaultInboxFilters: InboxFilters = {
  search: '',
  typeFilter: 'all',
  timeFilter: 'all',
  sortBy: 'newest',
  showSnoozed: false,
  tagIds: [],
}

// ============================================================================
// SELECTION STATE
// ============================================================================

export interface InboxSelectionState {
  selectedIds: Set<string>
  focusedItemId: string | null
  lastSelectedId: string | null   // for shift-click range selection
  isInBulkMode: boolean
}

export const defaultInboxSelection: InboxSelectionState = {
  selectedIds: new Set(),
  focusedItemId: null,
  lastSelectedId: null,
  isInBulkMode: false,
}

// ============================================================================
// PAGE STATE
// ============================================================================

/**
 * Complete inbox page state
 */
export interface InboxState {
  items: InboxItem[]
  filters: InboxFilters
  viewMode: InboxViewMode
  selection: InboxSelectionState
  isLoading: boolean
  error: string | null
}

export const defaultInboxState: InboxState = {
  items: [],
  filters: defaultInboxFilters,
  viewMode: 'medium',
  selection: defaultInboxSelection,
  isLoading: false,
  error: null,
}

// ============================================================================
// EMPTY STATE TYPES
// ============================================================================

/**
 * Different empty state scenarios
 */
export type InboxEmptyStateType =
  | 'getting-started'    // First time, no items ever
  | 'inbox-zero'         // All processed, inbox empty
  | 'returning-empty'    // Has history, currently empty

// ============================================================================
// STALE ITEM CONFIGURATION
// ============================================================================

export const STALE_THRESHOLD_DAYS = 7

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isLinkItem = (item: InboxItem): item is LinkItem =>
  item.type === 'link'

export const isNoteItem = (item: InboxItem): item is NoteItem =>
  item.type === 'note'

export const isImageItem = (item: InboxItem): item is ImageItem =>
  item.type === 'image'

export const isVoiceItem = (item: InboxItem): item is VoiceItem =>
  item.type === 'voice'

export const isPdfItem = (item: InboxItem): item is PdfItem =>
  item.type === 'pdf'

export const isWebclipItem = (item: InboxItem): item is WebclipItem =>
  item.type === 'webclip'

export const isFileItem = (item: InboxItem): item is FileItem =>
  item.type === 'file'

export const isVideoItem = (item: InboxItem): item is VideoItem =>
  item.type === 'video'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for new inbox items
 */
export const generateInboxItemId = (): string => {
  return `inbox-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Check if an item is stale (unfiled for more than 7 days)
 */
export const isItemStale = (item: InboxItem): boolean => {
  const staleDate = new Date()
  staleDate.setDate(staleDate.getDate() - STALE_THRESHOLD_DAYS)

  return (
    item.createdAt < staleDate &&
    item.folderId === null &&
    (!item.snoozedUntil || item.snoozedUntil <= new Date())
  )
}

/**
 * Check if an item is currently snoozed
 */
export const isItemSnoozed = (item: InboxItem): boolean => {
  return item.snoozedUntil !== null && item.snoozedUntil > new Date()
}

/**
 * Get word count from text
 */
export const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Get preview text (first N characters)
 */
export const getPreviewText = (text: string, maxLength: number = 150): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Extract domain from URL
 */
export const extractDomain = (url: string): string => {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/**
 * Format file size to human readable
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Format duration in seconds to mm:ss
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
