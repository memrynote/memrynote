/**
 * Forgot Password Form Component
 *
 * Form for requesting a password reset email.
 *
 * @module components/sync/forgot-password-form
 */

import { useState, useCallback } from 'react'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>
  onBack?: () => void
  isLoading?: boolean
  error?: string | null
  className?: string
}

// =============================================================================
// Component
// =============================================================================

/**
 * Forgot password form.
 */
export function ForgotPasswordForm({
  onSubmit,
  onBack,
  isLoading = false,
  error,
  className
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Validation
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLocalError(null)

      if (!emailValid) {
        setLocalError('Please enter a valid email address')
        return
      }

      try {
        await onSubmit(email.trim())
        setIsSuccess(true)
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'An error occurred')
      }
    },
    [email, emailValid, onSubmit]
  )

  const displayError = error || localError

  // Success state
  if (isSuccess) {
    return (
      <div className={cn('space-y-6 text-center', className)}>
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
            <CheckCircle className="size-8 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to reset your password.
          </p>
        </div>
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mt-4">
            <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
            Back to sign in
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Forgot your password?</h3>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              disabled={isLoading}
              autoComplete="email"
              autoFocus
              aria-describedby={displayError ? 'forgot-error' : undefined}
            />
          </div>
        </div>

        {/* Error Message */}
        {displayError && (
          <div
            id="forgot-error"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"
            role="alert"
          >
            <p className="text-sm text-destructive">{displayError}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={!emailValid || isLoading}>
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
          Send Reset Link
        </Button>
      </form>

      {/* Back Link */}
      {onBack && (
        <div className="text-center">
          <Button variant="ghost" onClick={onBack} disabled={isLoading}>
            <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
            Back to sign in
          </Button>
        </div>
      )}
    </div>
  )
}
