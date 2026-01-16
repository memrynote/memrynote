/**
 * Auth Hooks
 * React hooks for authentication operations in the renderer process.
 * Uses TanStack Query for caching and data fetching.
 *
 * @module hooks/use-auth
 */

import { useEffect } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult
} from '@tanstack/react-query'
import type {
  SetupStatus,
  RecoveryPhraseValidation
} from '../../../preload/index.d'
import {
  authService,
  onSessionExpired,
  type EmailSignupInput,
  type EmailLoginInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
  type OAuthStartInput,
  type OAuthCallbackInput,
  type ConfirmRecoveryPhraseInput,
  type LinkViaRecoveryInput,
  type PasswordValidationResult
} from '@/services/auth-service'

// =============================================================================
// Query Keys
// =============================================================================

export const authKeys = {
  all: ['auth'] as const,
  setupStatus: () => [...authKeys.all, 'setupStatus'] as const,
  hasMasterKey: () => [...authKeys.all, 'hasMasterKey'] as const,
  recoveryPhrase: () => [...authKeys.all, 'recoveryPhrase'] as const
}

// =============================================================================
// Constants
// =============================================================================

/** Stale time for setup status (30 seconds) */
const SETUP_STATUS_STALE_TIME = 30 * 1000

// =============================================================================
// Setup Status Hooks
// =============================================================================

/**
 * Hook for fetching the current setup status.
 * @returns Setup status query result
 */
export function useSetupStatus(): UseQueryResult<SetupStatus, Error> {
  return useQuery({
    queryKey: authKeys.setupStatus(),
    queryFn: authService.getSetupStatus,
    staleTime: SETUP_STATUS_STALE_TIME
  })
}

/**
 * Hook for checking if master key exists in keychain.
 */
export function useHasMasterKey(): UseQueryResult<
  { hasMasterKey: boolean },
  Error
> {
  return useQuery({
    queryKey: authKeys.hasMasterKey(),
    queryFn: authService.hasMasterKey,
    staleTime: SETUP_STATUS_STALE_TIME
  })
}

/**
 * Hook for completing first device setup after recovery phrase confirmation.
 * Derives master key, registers device, saves to keychain.
 */
export function useSetupFirstDevice(): UseMutationResult<
  { success: boolean; deviceId?: string; userId?: string },
  Error,
  void
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.setupFirstDevice,
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate setup status and master key queries
        queryClient.invalidateQueries({ queryKey: authKeys.setupStatus() })
        queryClient.invalidateQueries({ queryKey: authKeys.hasMasterKey() })
      }
    }
  })
}

// =============================================================================
// Email Authentication Hooks
// =============================================================================

/**
 * Hook for email signup.
 * Invalidates setup status on success.
 */
export function useEmailSignup(): UseMutationResult<
  { success: boolean; error?: string },
  Error,
  EmailSignupInput
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.emailSignup,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: authKeys.setupStatus() })
      }
    }
  })
}

/**
 * Hook for email login.
 * Invalidates setup status on success.
 */
export function useEmailLogin(): UseMutationResult<
  { success: boolean; error?: string },
  Error,
  EmailLoginInput
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.emailLogin,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: authKeys.setupStatus() })
        queryClient.invalidateQueries({ queryKey: authKeys.hasMasterKey() })
      }
    }
  })
}

/**
 * Hook for email verification.
 */
export function useEmailVerify(): UseMutationResult<
  { success: boolean; error?: string },
  Error,
  string
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.emailVerify,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: authKeys.setupStatus() })
      }
    }
  })
}

/**
 * Hook for resending verification email.
 */
export function useResendVerification(): UseMutationResult<
  { success: boolean; error?: string },
  Error,
  void
> {
  return useMutation({
    mutationFn: authService.resendVerification
  })
}

// =============================================================================
// Password Management Hooks
// =============================================================================

/**
 * Hook for forgot password.
 */
export function useForgotPassword(): UseMutationResult<
  { success: boolean; error?: string },
  Error,
  string
> {
  return useMutation({
    mutationFn: authService.forgotPassword
  })
}

/**
 * Hook for reset password.
 */
export function useResetPassword(): UseMutationResult<
  { success: boolean; error?: string },
  Error,
  ResetPasswordInput
> {
  return useMutation({
    mutationFn: authService.resetPassword
  })
}

/**
 * Hook for changing password (authenticated).
 */
export function useChangePassword(): UseMutationResult<
  { success: boolean; error?: string },
  Error,
  ChangePasswordInput
> {
  return useMutation({
    mutationFn: authService.changePassword
  })
}

/**
 * Validate password strength synchronously.
 * Not a hook - use directly in components.
 * @param password - Password to validate
 */
export const validatePassword = authService.validatePassword

// =============================================================================
// OAuth Hooks
// =============================================================================

/**
 * Hook for starting OAuth flow.
 */
export function useOAuthStart(): UseMutationResult<
  { authUrl: string },
  Error,
  OAuthStartInput
> {
  return useMutation({
    mutationFn: authService.oauthStart
  })
}

/**
 * Hook for OAuth callback.
 */
export function useOAuthCallback(): UseMutationResult<
  { success: boolean; error?: string },
  Error,
  OAuthCallbackInput
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.oauthCallback,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: authKeys.setupStatus() })
        queryClient.invalidateQueries({ queryKey: authKeys.hasMasterKey() })
      }
    }
  })
}

// =============================================================================
// Recovery Phrase Hooks
// =============================================================================

/**
 * Hook for generating recovery phrase.
 * This is a query that generates on demand, not cached long-term.
 * @param enabled - Whether to enable the query
 */
export function useGenerateRecoveryPhrase(
  enabled = false
): UseQueryResult<{ phrase: string; wordCount: number }, Error> {
  return useQuery({
    queryKey: authKeys.recoveryPhrase(),
    queryFn: authService.generateRecoveryPhrase,
    enabled,
    staleTime: Infinity, // Don't auto-refetch
    gcTime: 0 // Don't cache after unmount
  })
}

/**
 * Hook for validating recovery phrase.
 */
export function useValidateRecoveryPhrase(): UseMutationResult<
  RecoveryPhraseValidation,
  Error,
  string
> {
  return useMutation({
    mutationFn: authService.validateRecoveryPhrase
  })
}

/**
 * Hook for confirming recovery phrase with random words.
 */
export function useConfirmRecoveryPhrase(): UseMutationResult<
  { success: boolean; error?: string },
  Error,
  ConfirmRecoveryPhraseInput
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.confirmRecoveryPhrase,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: authKeys.setupStatus() })
        queryClient.invalidateQueries({ queryKey: authKeys.hasMasterKey() })
      }
    }
  })
}

/**
 * Hook for linking a new device via recovery phrase.
 * Used when logging in on a new device.
 */
export function useLinkViaRecovery(): UseMutationResult<
  { success: boolean; deviceId?: string; error?: string },
  Error,
  LinkViaRecoveryInput
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.linkViaRecovery,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: authKeys.setupStatus() })
        queryClient.invalidateQueries({ queryKey: authKeys.hasMasterKey() })
      }
    }
  })
}

// =============================================================================
// Session Hooks
// =============================================================================

/**
 * Hook for logout.
 */
export function useLogout(): UseMutationResult<
  { success: boolean },
  Error,
  void
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    }
  })
}

/**
 * Hook for clearing keychain.
 */
export function useClearKeychain(): UseMutationResult<
  { success: boolean },
  Error,
  void
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.clearKeychain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.hasMasterKey() })
    }
  })
}

// =============================================================================
// Event Subscription Hooks
// =============================================================================

/**
 * Hook to subscribe to session expired events.
 * @param onExpired - Callback when session expires
 */
export function useSessionExpired(
  onExpired: (reason: 'token_expired' | 'device_removed' | 'key_rotated') => void
): void {
  useEffect(() => {
    const unsubscribe = onSessionExpired((event) => {
      onExpired(event.reason)
    })
    return unsubscribe
  }, [onExpired])
}

// =============================================================================
// Derived State Hook
// =============================================================================

/**
 * Comprehensive auth state hook.
 * Combines setup status and master key check.
 */
export function useAuthState() {
  const setupStatusQuery = useSetupStatus()
  const masterKeyQuery = useHasMasterKey()

  const isLoading = setupStatusQuery.isLoading || masterKeyQuery.isLoading
  const isError = setupStatusQuery.isError || masterKeyQuery.isError

  const setupStatus = setupStatusQuery.data
  const hasMasterKey = masterKeyQuery.data?.hasMasterKey ?? false

  // Determine auth state
  const isAuthenticated = setupStatus?.hasUser && setupStatus?.hasDevice
  const needsSetup = !setupStatus?.isSetup
  const needsEmailVerification = setupStatus?.hasUser && !setupStatus?.isSetup
  const isFullySetup =
    setupStatus?.isSetup && setupStatus?.hasMasterKey && hasMasterKey

  return {
    // Query states
    isLoading,
    isError,
    error: setupStatusQuery.error || masterKeyQuery.error,

    // Auth states
    isAuthenticated,
    needsSetup,
    needsEmailVerification,
    isFullySetup,
    hasMasterKey,

    // Raw data
    setupStatus,

    // Refetch
    refetch: () => {
      setupStatusQuery.refetch()
      masterKeyQuery.refetch()
    }
  }
}

// Re-export types
export type { PasswordValidationResult }
