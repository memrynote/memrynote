/**
 * Type Badge Component
 *
 * A versatile badge component for displaying inbox item type indicators.
 * Supports multiple variants for different contexts:
 * - icon: Just the icon with color (compact view)
 * - label: Icon with type label (expanded view)
 * - pill: Icon in a colored pill background (headers)
 */

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { InboxItemType } from '@/data/inbox-types'
import { getTypeConfig } from '@/lib/inbox-type-config'

// ============================================================================
// TYPES
// ============================================================================

export type TypeBadgeVariant = 'icon' | 'label' | 'pill'
export type TypeBadgeSize = 'xs' | 'sm' | 'md' | 'lg'

export interface TypeBadgeProps {
  /** The inbox item type to display */
  type: InboxItemType
  /** Display variant */
  variant?: TypeBadgeVariant
  /** Size of the badge */
  size?: TypeBadgeSize
  /** Whether to show background tint (for icon variant) */
  showBackground?: boolean
  /** Additional class names */
  className?: string
}

// ============================================================================
// SIZE MAPPINGS
// ============================================================================

const ICON_SIZES: Record<TypeBadgeSize, string> = {
  xs: 'size-3',
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
}

const CONTAINER_SIZES: Record<TypeBadgeSize, string> = {
  xs: 'size-5',
  sm: 'size-6',
  md: 'size-7',
  lg: 'size-8',
}

const PILL_PADDING: Record<TypeBadgeSize, string> = {
  xs: 'px-1.5 py-0.5 gap-1',
  sm: 'px-2 py-0.5 gap-1',
  md: 'px-2.5 py-1 gap-1.5',
  lg: 'px-3 py-1.5 gap-2',
}

const LABEL_SIZES: Record<TypeBadgeSize, string> = {
  xs: 'text-[9px]',
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
}

// ============================================================================
// ICON ONLY VARIANT
// ============================================================================

interface IconVariantProps {
  type: InboxItemType
  size: TypeBadgeSize
  showBackground: boolean
  className?: string
}

function IconVariant({ type, size, showBackground, className }: IconVariantProps): React.JSX.Element {
  const config = getTypeConfig(type)
  const IconComponent = config.icon

  if (showBackground) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-md',
          'transition-colors duration-150',
          CONTAINER_SIZES[size],
          config.bgTint,
          config.hoverBg,
          className
        )}
      >
        <IconComponent className={cn(ICON_SIZES[size], config.iconColor)} />
      </div>
    )
  }

  return (
    <IconComponent
      className={cn(
        ICON_SIZES[size],
        config.iconColor,
        'transition-colors duration-150',
        className
      )}
    />
  )
}

// ============================================================================
// LABEL VARIANT
// ============================================================================

interface LabelVariantProps {
  type: InboxItemType
  size: TypeBadgeSize
  className?: string
}

function LabelVariant({ type, size, className }: LabelVariantProps): React.JSX.Element {
  const config = getTypeConfig(type)
  const IconComponent = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5',
        'transition-colors duration-150',
        className
      )}
    >
      <IconComponent className={cn(ICON_SIZES[size], config.iconColor)} />
      <span
        className={cn(
          'font-medium uppercase tracking-wide',
          LABEL_SIZES[size],
          config.textColor
        )}
      >
        {config.label}
      </span>
    </div>
  )
}

// ============================================================================
// PILL VARIANT
// ============================================================================

interface PillVariantProps {
  type: InboxItemType
  size: TypeBadgeSize
  className?: string
}

function PillVariant({ type, size, className }: PillVariantProps): React.JSX.Element {
  const config = getTypeConfig(type)
  const IconComponent = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full',
        'border transition-all duration-200',
        PILL_PADDING[size],
        config.bgTint,
        config.borderColor,
        config.hoverBg,
        className
      )}
    >
      <IconComponent className={cn(ICON_SIZES[size], config.iconColor)} />
      <span
        className={cn(
          'font-semibold uppercase tracking-wider',
          LABEL_SIZES[size],
          config.textColor
        )}
      >
        {config.label}
      </span>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TypeBadge = forwardRef<HTMLDivElement, TypeBadgeProps>(
  function TypeBadge(
    {
      type,
      variant = 'icon',
      size = 'md',
      showBackground = false,
      className,
    },
    ref
  ) {
    const content = (() => {
      switch (variant) {
        case 'icon':
          return (
            <IconVariant
              type={type}
              size={size}
              showBackground={showBackground}
              className={className}
            />
          )
        case 'label':
          return <LabelVariant type={type} size={size} className={className} />
        case 'pill':
          return <PillVariant type={type} size={size} className={className} />
        default:
          return null
      }
    })()

    // For ref forwarding, wrap in a span
    return (
      <span ref={ref} className="inline-flex">
        {content}
      </span>
    )
  }
)

// ============================================================================
// ICON-ONLY EXPORT (for direct use without wrapper)
// ============================================================================

export interface TypeIconProps {
  type: InboxItemType
  size?: TypeBadgeSize
  className?: string
}

export function TypeIcon({ type, size = 'md', className }: TypeIconProps): React.JSX.Element {
  const config = getTypeConfig(type)
  const IconComponent = config.icon

  return (
    <IconComponent
      className={cn(
        ICON_SIZES[size],
        config.iconColor,
        'transition-colors duration-150',
        className
      )}
    />
  )
}

// ============================================================================
// TYPE DOT (minimal indicator)
// ============================================================================

export interface TypeDotProps {
  type: InboxItemType
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const DOT_SIZES = {
  sm: 'size-1.5',
  md: 'size-2',
  lg: 'size-2.5',
}

export function TypeDot({ type, size = 'md', className }: TypeDotProps): React.JSX.Element {
  const config = getTypeConfig(type)

  // Map text color to bg color
  const bgColorMap: Record<string, string> = {
    'text-blue-600': 'bg-blue-500',
    'text-amber-600': 'bg-amber-500',
    'text-emerald-600': 'bg-emerald-500',
    'text-violet-600': 'bg-violet-500',
    'text-red-600': 'bg-red-500',
    'text-cyan-600': 'bg-cyan-500',
    'text-stone-600': 'bg-stone-500',
    'text-pink-600': 'bg-pink-500',
  }

  const bgColor = bgColorMap[config.iconColor] || 'bg-gray-500'

  return (
    <span
      className={cn(
        'inline-block rounded-full',
        DOT_SIZES[size],
        bgColor,
        className
      )}
      aria-label={config.label}
    />
  )
}
