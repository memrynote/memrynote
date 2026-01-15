/**
 * OAuth Buttons Component
 *
 * Buttons for OAuth sign in with Google, Apple, and GitHub.
 *
 * @module components/sync/oauth-buttons
 */

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

type OAuthProvider = 'google' | 'apple' | 'github'

interface OAuthButtonsProps {
  onOAuthStart: (provider: OAuthProvider) => Promise<void>
  isLoading?: boolean
  loadingProvider?: OAuthProvider | null
  disabled?: boolean
  className?: string
  variant?: 'default' | 'stacked'
}

// =============================================================================
// Provider Icons
// =============================================================================

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

// =============================================================================
// Component
// =============================================================================

/**
 * OAuth provider buttons for sign in.
 */
export function OAuthButtons({
  onOAuthStart,
  isLoading = false,
  loadingProvider = null,
  disabled = false,
  className,
  variant = 'default'
}: OAuthButtonsProps) {
  const isDisabled = disabled || isLoading

  const handleClick = async (provider: OAuthProvider) => {
    if (isDisabled) return
    await onOAuthStart(provider)
  }

  const buttonClass = variant === 'stacked' ? 'w-full' : ''

  return (
    <div
      className={cn(
        variant === 'default' ? 'flex items-center gap-3' : 'flex flex-col gap-3',
        className
      )}
    >
      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className={cn(buttonClass, 'flex-1')}
        onClick={() => handleClick('google')}
        disabled={isDisabled}
        aria-label="Continue with Google"
      >
        {loadingProvider === 'google' ? (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <GoogleIcon className="size-5" />
        )}
        {variant === 'stacked' && (
          <span className="ml-2">Continue with Google</span>
        )}
      </Button>

      {/* Apple */}
      <Button
        type="button"
        variant="outline"
        className={cn(buttonClass, 'flex-1')}
        onClick={() => handleClick('apple')}
        disabled={isDisabled}
        aria-label="Continue with Apple"
      >
        {loadingProvider === 'apple' ? (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <AppleIcon className="size-5" />
        )}
        {variant === 'stacked' && (
          <span className="ml-2">Continue with Apple</span>
        )}
      </Button>

      {/* GitHub */}
      <Button
        type="button"
        variant="outline"
        className={cn(buttonClass, 'flex-1')}
        onClick={() => handleClick('github')}
        disabled={isDisabled}
        aria-label="Continue with GitHub"
      >
        {loadingProvider === 'github' ? (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <GitHubIcon className="size-5" />
        )}
        {variant === 'stacked' && (
          <span className="ml-2">Continue with GitHub</span>
        )}
      </Button>
    </div>
  )
}

// =============================================================================
// Divider Component
// =============================================================================

interface OAuthDividerProps {
  className?: string
}

/**
 * "Or continue with" divider for separating OAuth from email form.
 */
export function OAuthDivider({ className }: OAuthDividerProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>
    </div>
  )
}
