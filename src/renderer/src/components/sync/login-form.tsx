/**
 * Login Form Component
 *
 * Email/password login form.
 *
 * @module components/sync/login-form
 */

import { useState, useCallback } from 'react'
import { Mail, Lock, Eye, EyeOff, Loader2, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string; deviceName: string }) => Promise<void>
  onForgotPassword?: () => void
  isLoading?: boolean
  error?: string | null
  className?: string
  defaultDeviceName?: string
}

// =============================================================================
// Component
// =============================================================================

/**
 * Email/password login form.
 */
export function LoginForm({
  onSubmit,
  onForgotPassword,
  isLoading = false,
  error,
  className,
  defaultDeviceName = ''
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [deviceName, setDeviceName] = useState(defaultDeviceName)
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Validation
  const emailValid = email.trim().length > 0
  const passwordValid = password.length > 0
  const deviceNameValid = deviceName.trim().length > 0
  const isValid = emailValid && passwordValid && deviceNameValid

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLocalError(null)

      if (!emailValid) {
        setLocalError('Please enter your email address')
        return
      }

      if (!passwordValid) {
        setLocalError('Please enter your password')
        return
      }

      if (!deviceNameValid) {
        setLocalError('Please enter a device name')
        return
      }

      try {
        await onSubmit({
          email: email.trim(),
          password,
          deviceName: deviceName.trim()
        })
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'An error occurred')
      }
    },
    [email, password, deviceName, emailValid, passwordValid, deviceNameValid, onSubmit]
  )

  const displayError = error || localError

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={isLoading}
            autoComplete="email"
            aria-describedby={displayError ? 'login-error' : undefined}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-primary hover:underline"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          )}
        </div>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Device Name */}
      <div className="space-y-2">
        <Label htmlFor="login-device-name">Device Name</Label>
        <div className="relative">
          <Smartphone
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="login-device-name"
            type="text"
            placeholder="My MacBook"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          A name to identify this device in your account
        </p>
      </div>

      {/* Error Message */}
      {displayError && (
        <div
          id="login-error"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"
          role="alert"
        >
          <p className="text-sm text-destructive">{displayError}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
        Sign In
      </Button>
    </form>
  )
}
