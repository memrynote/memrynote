/**
 * Inbox Components
 *
 * Export all inbox-related components from this index file.
 */

// Header
export { InboxHeader, type InboxHeaderProps } from './inbox-header'

// Type Badge
export {
  TypeBadge,
  TypeIcon,
  TypeDot,
  type TypeBadgeProps,
  type TypeBadgeVariant,
  type TypeBadgeSize,
  type TypeIconProps,
  type TypeDotProps,
} from './type-badge'

// Compact View
export { CompactView, type CompactViewProps } from './compact-view'
export { CompactRow, type CompactRowProps } from './compact-row'

// Medium View
export { MediumView, type MediumViewProps } from './medium-view'
export { MediumCard, type MediumCardProps } from './medium-card'

// Expanded View
export { ExpandedView, type ExpandedViewProps } from './expanded-view'
export { ExpandedCard, type ExpandedCardProps, type AISuggestion } from './expanded-card'

// Type Renderers
export {
  TypeRenderer,
  TypeRendererSkeleton,
  TypeRendererError,
  type TypeRendererProps,
  LinkPreview,
  type LinkPreviewProps,
  NotePreview,
  type NotePreviewProps,
  ImagePreview,
  type ImagePreviewProps,
  VoicePreview,
  type VoicePreviewProps,
  PdfPreview,
  type PdfPreviewProps,
  WebclipPreview,
  type WebclipPreviewProps,
  FilePreview,
  type FilePreviewProps,
  VideoPreview,
  type VideoPreviewProps,
} from './type-renderers'
