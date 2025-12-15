/**
 * Shortcuts Modal Component
 *
 * A refined keyboard shortcuts reference modal with terminal-inspired aesthetics.
 * Shows all available shortcuts organized by category.
 */

import { useCallback, useEffect } from 'react'
import { X, Keyboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  getInboxShortcuts,
  isMac,
  type InboxShortcutCategory,
} from '@/hooks/use-inbox-keyboard'

// ============================================================================
// TYPES
// ============================================================================

export interface ShortcutsModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal should close */
  onClose: () => void
}

// ============================================================================
// KEYBOARD KEY COMPONENT
// ============================================================================

interface KeyCapProps {
  children: React.ReactNode
  variant?: 'default' | 'wide' | 'special'
  className?: string
}

function KeyCap({
  children,
  variant = 'default',
  className,
}: KeyCapProps): React.JSX.Element {
  return (
    <kbd
      className={cn(
        // Base styles - refined keycap appearance
        'inline-flex items-center justify-center',
        'font-mono text-[11px] font-medium tracking-tight',
        'rounded-[5px] border',
        // Subtle 3D depth effect
        'bg-gradient-to-b from-muted/80 to-muted',
        'border-border/80',
        'shadow-[0_1px_0_1px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]',
        'dark:shadow-[0_1px_0_1px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]',
        // Text styling
        'text-foreground/80',
        // Size variants
        variant === 'default' && 'min-w-[24px] h-[22px] px-1.5',
        variant === 'wide' && 'min-w-[48px] h-[22px] px-2',
        variant === 'special' && 'min-w-[32px] h-[22px] px-1.5',
        className
      )}
    >
      {children}
    </kbd>
  )
}

// ============================================================================
// KEY COMBINATION DISPLAY
// ============================================================================

interface KeyComboProps {
  keys: string[]
}

function KeyCombo({ keys }: KeyComboProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => {
        // Determine if key needs special styling
        const isWide = key.length > 3 || ['Space', 'Enter', 'Delete', 'Escape', 'Shift'].some(k => key.includes(k))
        const isModifier = key.includes('⌘') || key.includes('Ctrl') || key.includes('⌥') || key.includes('Alt')
        const isArrow = key.includes('↑') || key.includes('↓') || key.includes('←') || key.includes('→')

        // Split combined keys (e.g., "⌘+A" -> ["⌘", "+", "A"])
        if (key.includes('+')) {
          const parts = key.split('+')
          return (
            <span key={index} className="flex items-center gap-0.5">
              {parts.map((part, partIndex) => (
                <span key={partIndex} className="flex items-center gap-0.5">
                  <KeyCap variant={part.length > 2 ? 'wide' : 'default'}>
                    {part}
                  </KeyCap>
                  {partIndex < parts.length - 1 && (
                    <span className="text-[10px] text-muted-foreground/50">+</span>
                  )}
                </span>
              ))}
            </span>
          )
        }

        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && (
              <span className="text-[10px] text-muted-foreground/40 px-0.5">/</span>
            )}
            <KeyCap
              variant={isWide ? 'wide' : isArrow || isModifier ? 'special' : 'default'}
            >
              {key}
            </KeyCap>
          </span>
        )
      })}
    </div>
  )
}

// ============================================================================
// SHORTCUT ROW
// ============================================================================

interface ShortcutRowProps {
  keys: string[]
  label: string
  description?: string
}

function ShortcutRow({ keys, label }: ShortcutRowProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between py-1.5 group">
      <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
        {label}
      </span>
      <KeyCombo keys={keys} />
    </div>
  )
}

// ============================================================================
// CATEGORY SECTION
// ============================================================================

interface CategorySectionProps {
  category: InboxShortcutCategory
  index: number
}

function CategorySection({ category, index }: CategorySectionProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'space-y-1',
        // Staggered animation
        'animate-in fade-in slide-in-from-bottom-2',
        'duration-300 ease-out'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Category header */}
      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 pb-1 border-b border-border/30">
        {category.title}
      </h3>

      {/* Shortcuts */}
      <div className="space-y-0.5">
        {category.shortcuts.map((shortcut, idx) => (
          <ShortcutRow
            key={idx}
            keys={shortcut.keys}
            label={shortcut.label}
            description={shortcut.description}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// SHORTCUTS MODAL COMPONENT
// ============================================================================

export function ShortcutsModal({
  isOpen,
  onClose,
}: ShortcutsModalProps): React.JSX.Element {
  const shortcuts = getInboxShortcuts()

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return undefined
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          'sm:max-w-[520px] p-0 gap-0 overflow-hidden',
          // Refined dark appearance
          'bg-gradient-to-b from-background via-background to-muted/20',
          'border-border/50',
          'shadow-2xl shadow-black/20 dark:shadow-black/50'
        )}
      >
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Icon with subtle glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                <div className="relative flex size-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Keyboard className="size-4 text-primary" />
                </div>
              </div>
              <div>
                <DialogTitle className="text-base font-semibold tracking-tight">
                  Keyboard Shortcuts
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isMac ? 'macOS' : 'Windows/Linux'} shortcuts
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8 rounded-full hover:bg-muted"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-border">
          {/* Two-column grid for shortcuts */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {shortcuts.map((category, index) => (
              <CategorySection
                key={category.title}
                category={category}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/30 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              Press <KeyCap>?</KeyCap> to toggle this panel
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
