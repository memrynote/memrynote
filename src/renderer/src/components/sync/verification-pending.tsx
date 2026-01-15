/**
 * Verification Pending Screen Component
 *
 * Shows email verification pending state with resend option.
 *
 * @module components/sync/verification-pending
 */

import { useState, useCallback, useEffect } from 'react'
import { Mail, Loader2, CheckCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface VerificationPendingProps {
  email: string
  onResend: () => Promise<void>
  onChangeEmail?: () => void
  onVerified?: () => void
  isResending?: boolean
  error?: string | null
  className?: string
  checkInterval?: number // Interval to check verification status (ms)
}

// =============================================================================
// Component
// =============================================================================

/**
 * Email verification pending screen with resend functionality.
 */
export function VerificationPending({
  email,
  onResend,
  onChangeEmail,
  onVerified: _onVerified,
  isResending = false,
  error,
  className,
  checkInterval: _checkInterval = 5000
}: VerificationPendingProps) {
  // Note: onVerified and checkInterval are reserved for future auto-verification polling
  void _onVerified
  void _checkInterval
  const [resendCooldown, setResendCooldown] = useState(0)
  const [localError, setLocalError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [resendCooldown])

  // Handle resend
  const handleResend = useCallback(async () => {
    setLocalError(null)
    setResendSuccess(false)

    try {
      await onResend()
      setResendCooldown(60) // 60 second cooldown
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to resend email')
    }
  }, [onResend])

  const displayError = error || localError
  const canResend = resendCooldown === 0 && !isResending

  return (
    <div className={cn('space-y-6', className)}>
      {/* Icon */}
      <div className="flex justify-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Mail className="size-12 text-primary" aria-hidden="true" />
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to
        </p>
        <p className="font-medium">{email}</p>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Click the link in the email to verify your account. If you don&apos;t see
          the email, check your spam folder.
        </p>
      </div>

      {/* Success Message */}
      {resendSuccess && (
        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="size-4" aria-hidden="true" />
          <span className="text-sm">Verification email sent!</span>
        </div>
      )}

      {/* Error Message */}
      {displayError && (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"
          role="alert"
        >
          <p className="text-sm text-destructive">{displayError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {/* Resend Button */}
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={!canResend}
          className="w-full"
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              Sending...
            </>
          ) : resendCooldown > 0 ? (
            <>
              <RefreshCw className="mr-2 size-4" aria-hidden="true" />
              Resend in {resendCooldown}s
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 size-4" aria-hidden="true" />
              Resend verification email
            </>
          )}
        </Button>

        {/* Change Email */}
        {onChangeEmail && (
          <Button variant="ghost" onClick={onChangeEmail} className="w-full">
            Use a different email
          </Button>
        )}
      </div>

      {/* Help Text */}
      <p className="text-center text-xs text-muted-foreground">
        Didn&apos;t receive the email? Make sure {email} is correct and check your
        spam folder.
      </p>
    </div>
  )
}

// =============================================================================
// Compact Version
// =============================================================================

interface VerificationPendingCompactProps {
  email: string
  onResend: () => Promise<void>
  isResending?: boolean
  className?: string
}

/**
 * Compact verification pending indicator (for inline use).
 */
export function VerificationPendingCompact({
  email,
  onResend,
  isResending = false,
  className
}: VerificationPendingCompactProps) {
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [cooldown])

  const handleResend = async () => {
    await onResend()
    setCooldown(60)
  }

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
      <span className="text-muted-foreground">
        Verification sent to {email}
      </span>
      <button
        onClick={handleResend}
        disabled={cooldown > 0 || isResending}
        className="text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend'}
      </button>
    </div>
  )
}
