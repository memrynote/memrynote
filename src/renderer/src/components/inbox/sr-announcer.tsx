/**
 * Screen Reader Announcer Component
 *
 * An accessible live region for announcing dynamic content changes
 * to screen reader users.
 */

import { useEffect, useState } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface SRAnnouncerProps {
  /** The message to announce */
  message?: string
  /** Priority level for the announcement */
  priority?: 'polite' | 'assertive'
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Screen Reader Announcer
 *
 * Creates an ARIA live region that announces messages to screen readers.
 * The element is visually hidden but accessible to assistive technology.
 */
export function SRAnnouncer({
  message = '',
  priority = 'polite',
}: SRAnnouncerProps): React.JSX.Element {
  const [currentMessage, setCurrentMessage] = useState('')

  // Update message with a small delay to ensure screen readers pick it up
  useEffect(() => {
    if (!message) return undefined
    // Clear first to ensure re-announcement of same message
    setCurrentMessage('')
    const timer = setTimeout(() => {
      setCurrentMessage(message)
    }, 100)
    return () => clearTimeout(timer)
  }, [message])

  return (
    <div
      id="sr-announcer"
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  )
}

// ============================================================================
// GLOBAL ANNOUNCER PORTAL
// ============================================================================

/**
 * Global Screen Reader Announcer
 *
 * A static announcer that can be used from anywhere in the app.
 * Mount once at the app root level.
 */
export function GlobalSRAnnouncer(): React.JSX.Element {
  return (
    <>
      {/* Polite announcements for non-urgent updates */}
      <div
        id="sr-announcer-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Assertive announcements for urgent updates */}
      <div
        id="sr-announcer-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  )
}

// ============================================================================
// ANNOUNCEMENT HELPERS
// ============================================================================

/**
 * Announce a message to screen readers
 */
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcerId = priority === 'assertive' ? 'sr-announcer-assertive' : 'sr-announcer-polite'
  const announcer = document.getElementById(announcerId) || document.getElementById('sr-announcer')

  if (announcer) {
    // Clear first to force re-announcement
    announcer.textContent = ''

    // Use requestAnimationFrame to ensure the clear is processed
    requestAnimationFrame(() => {
      announcer.textContent = message

      // Clear after a delay
      setTimeout(() => {
        announcer.textContent = ''
      }, 1000)
    })
  }
}

/**
 * Announce navigation change
 */
export function announceNavigation(itemTitle: string, position: number, total: number): void {
  announce(`${itemTitle}, item ${position} of ${total}`)
}

/**
 * Announce selection change
 */
export function announceSelection(count: number, action: 'selected' | 'deselected'): void {
  if (count === 0) {
    announce('Selection cleared')
  } else {
    announce(`${count} ${count === 1 ? 'item' : 'items'} ${action}`)
  }
}

/**
 * Announce action completion
 */
export function announceAction(action: string): void {
  announce(action, 'polite')
}
