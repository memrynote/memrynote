/**
 * Inbox Type Configuration
 *
 * Centralized mapping of inbox item types to their visual representations.
 * This ensures consistent iconography and color coding across all views.
 */

import {
  Link2,
  FileText,
  Image,
  Mic,
  Scissors,
  File,
  Video,
  type LucideIcon,
} from 'lucide-react'
import type { InboxItemType } from '@/data/inbox-types'

// ============================================================================
// TYPE CONFIGURATION
// ============================================================================

export interface InboxTypeConfig {
  /** Lucide icon component */
  icon: LucideIcon
  /** Human-readable label */
  label: string
  /** Tailwind class for icon color */
  iconColor: string
  /** Tailwind class for background tint (subtle) */
  bgTint: string
  /** Tailwind class for border color */
  borderColor: string
  /** Tailwind class for ring/focus color */
  ringColor: string
  /** Darker variant for hover states */
  hoverBg: string
  /** Text color for labels on tinted backgrounds */
  textColor: string
}

/**
 * Complete configuration for all inbox item types
 * Colors chosen to complement the warm beige (#F6F5F0) background
 */
export const INBOX_TYPE_CONFIG: Record<InboxItemType, InboxTypeConfig> = {
  link: {
    icon: Link2,
    label: 'Link',
    iconColor: 'text-blue-600',
    bgTint: 'bg-blue-50',
    borderColor: 'border-blue-200',
    ringColor: 'ring-blue-500/20',
    hoverBg: 'hover:bg-blue-100',
    textColor: 'text-blue-700',
  },
  note: {
    icon: FileText,
    label: 'Note',
    iconColor: 'text-amber-600',
    bgTint: 'bg-amber-50',
    borderColor: 'border-amber-200',
    ringColor: 'ring-amber-500/20',
    hoverBg: 'hover:bg-amber-100',
    textColor: 'text-amber-700',
  },
  image: {
    icon: Image,
    label: 'Image',
    iconColor: 'text-emerald-600',
    bgTint: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    ringColor: 'ring-emerald-500/20',
    hoverBg: 'hover:bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  voice: {
    icon: Mic,
    label: 'Voice',
    iconColor: 'text-violet-600',
    bgTint: 'bg-violet-50',
    borderColor: 'border-violet-200',
    ringColor: 'ring-violet-500/20',
    hoverBg: 'hover:bg-violet-100',
    textColor: 'text-violet-700',
  },
  pdf: {
    icon: FileText,
    label: 'PDF',
    iconColor: 'text-red-600',
    bgTint: 'bg-red-50',
    borderColor: 'border-red-200',
    ringColor: 'ring-red-500/20',
    hoverBg: 'hover:bg-red-100',
    textColor: 'text-red-700',
  },
  webclip: {
    icon: Scissors,
    label: 'Webclip',
    iconColor: 'text-cyan-600',
    bgTint: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    ringColor: 'ring-cyan-500/20',
    hoverBg: 'hover:bg-cyan-100',
    textColor: 'text-cyan-700',
  },
  file: {
    icon: File,
    label: 'File',
    iconColor: 'text-stone-600',
    bgTint: 'bg-stone-100',
    borderColor: 'border-stone-200',
    ringColor: 'ring-stone-500/20',
    hoverBg: 'hover:bg-stone-200',
    textColor: 'text-stone-700',
  },
  video: {
    icon: Video,
    label: 'Video',
    iconColor: 'text-pink-600',
    bgTint: 'bg-pink-50',
    borderColor: 'border-pink-200',
    ringColor: 'ring-pink-500/20',
    hoverBg: 'hover:bg-pink-100',
    textColor: 'text-pink-700',
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the Lucide icon component for a given type
 */
export function getTypeIcon(type: InboxItemType): LucideIcon {
  return INBOX_TYPE_CONFIG[type].icon
}

/**
 * Get the color classes for a given type
 */
export function getTypeColors(type: InboxItemType): {
  icon: string
  bg: string
  border: string
  ring: string
  hover: string
  text: string
} {
  const config = INBOX_TYPE_CONFIG[type]
  return {
    icon: config.iconColor,
    bg: config.bgTint,
    border: config.borderColor,
    ring: config.ringColor,
    hover: config.hoverBg,
    text: config.textColor,
  }
}

/**
 * Get the human-readable label for a given type
 */
export function getTypeLabel(type: InboxItemType): string {
  return INBOX_TYPE_CONFIG[type].label
}

/**
 * Get the full configuration for a given type
 */
export function getTypeConfig(type: InboxItemType): InboxTypeConfig {
  return INBOX_TYPE_CONFIG[type]
}

// ============================================================================
// TYPE GROUPS (for filtering UI)
// ============================================================================

/**
 * Group types by category for filter UI
 */
export const TYPE_GROUPS = {
  media: ['image', 'video', 'voice'] as InboxItemType[],
  documents: ['pdf', 'file', 'note'] as InboxItemType[],
  web: ['link', 'webclip'] as InboxItemType[],
}

/**
 * All types in display order
 */
export const ALL_TYPES_ORDERED: InboxItemType[] = [
  'link',
  'note',
  'image',
  'voice',
  'pdf',
  'webclip',
  'file',
  'video',
]
