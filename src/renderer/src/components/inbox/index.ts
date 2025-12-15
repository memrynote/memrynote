/**
 * Inbox Components
 *
 * Export all inbox-related components from this index file.
 */

// Header
export { InboxHeader, type InboxHeaderProps } from './inbox-header'

// View Switcher
export {
  ViewSwitcher,
  ViewSwitcherCompact,
  ViewIndicator,
  type ViewSwitcherProps,
  type ViewSwitcherCompactProps,
  type ViewIndicatorProps,
} from './view-switcher'

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

// Empty States
export {
  EmptyState,
  GettingStarted,
  InboxZero,
  ReturningEmpty,
  type EmptyStateProps,
  type EmptyStateType,
  type EmptyStateContext,
  type GettingStartedProps,
  type InboxZeroProps,
  type InboxZeroStats,
  type ReturningEmptyProps,
  type SnoozedItemPreview,
} from './empty-states'

// Search
export {
  SearchInput,
  StandaloneSearchInput,
  type SearchInputProps,
  type StandaloneSearchInputProps,
} from './search-input'

// Filters
export {
  FilterPopover,
  FilterDropdown,
  type FilterPopoverProps,
  type FilterState,
  type FilterDropdownProps,
} from './filter-popover'

export {
  ActiveFilters,
  getActiveFilterCount,
  hasActiveFilters,
  type ActiveFiltersProps,
} from './active-filters'

// Bulk Actions
export {
  BulkActionBar,
  type BulkActionBarProps,
  type ClusterSuggestion,
} from './bulk-action-bar'

export {
  AIClusterSuggestion,
  AIClusterSuggestionCompact,
  useMockClusterSuggestion,
  type AIClusterSuggestionProps,
  type AIClusterSuggestionCompactProps,
} from './ai-cluster-suggestion'

// Filing Panel
export { FilingPanel, type FilingPanelProps } from './filing-panel'
export { FolderTree, type FolderTreeProps } from './folder-tree'
export { TagInput, type TagInputProps } from './tag-input'

// Snooze
export { SnoozeMenu, SnoozeButton, type SnoozeMenuProps, type SnoozeButtonProps } from './snooze-menu'
export {
  SnoozedIndicator,
  SnoozedBadge,
  ReturningItemHighlight,
  type SnoozedIndicatorProps,
  type SnoozedBadgeProps,
  type ReturningItemHighlightProps,
} from './snoozed-indicator'

// Stale Items
export { StaleSection, type StaleSectionProps } from './stale-section'

// Shortcuts Modal
export { ShortcutsModal, type ShortcutsModalProps } from './shortcuts-modal'

// Accessibility
export {
  SRAnnouncer,
  GlobalSRAnnouncer,
  announce,
  announceNavigation,
  announceSelection,
  announceAction,
  type SRAnnouncerProps,
} from './sr-announcer'

// Quick Capture
export {
  QuickCaptureBar,
  type QuickCaptureBarProps,
  type CaptureMode,
} from './quick-capture-bar'

// Preview Panel
export { PreviewPanelShell, type PreviewPanelShellProps } from './preview-panel-shell'
export { UrlPreview as UrlPreviewPanel, type UrlPreviewProps } from './preview-url'
export { NotePreview as NotePreviewPanel, type NotePreviewProps as NotePreviewPanelProps } from './preview-note'
export { ImagePreview as ImagePreviewPanel, type ImagePreviewProps as ImagePreviewPanelProps } from './preview-image'
export { VoicePreview as VoicePreviewPanel, type VoicePreviewProps as VoicePreviewPanelProps } from './preview-voice'
export { PdfPreview as PdfPreviewPanel, type PdfPreviewProps as PdfPreviewPanelProps } from './preview-pdf'
export { WebclipPreview as WebclipPreviewPanel, type WebclipPreviewProps as WebclipPreviewPanelProps } from './preview-webclip'
export { FilePreview as FilePreviewPanel, type FilePreviewProps as FilePreviewPanelProps } from './preview-file'
export { VideoPreview as VideoPreviewPanel, type VideoPreviewProps as VideoPreviewPanelProps } from './preview-video'
export {
  PreviewSkeleton,
  PreviewError,
  PreviewEmpty,
  PreviewLoadingOverlay,
  type PreviewSkeletonProps,
  type PreviewErrorProps,
  type PreviewEmptyProps,
  type PreviewLoadingOverlayProps,
} from './preview-states'
