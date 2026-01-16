/**
 * Auth Context
 *
 * Provides authentication state and methods to the application.
 * Wraps TanStack Query hooks for a simpler API.
 *
 * @module contexts/auth-context
 */

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { SetupStatus } from '../../../preload/index.d'
import {
  useSetupStatus,
  useHasMasterKey,
  useEmailSignup,
  useEmailLogin,
  useEmailVerify,
  useResendVerification,
  useForgotPassword,
  useResetPassword,
  useChangePassword,
  useOAuthStart,
  useOAuthCallback,
  useGenerateRecoveryPhrase,
  useConfirmRecoveryPhrase,
  useLinkViaRecovery,
  useSetupFirstDevice,
  useLogout,
  useSessionExpired,
  authKeys
} from '@/hooks/use-auth'
import type {
  EmailSignupInput,
  EmailLoginInput,
  ResetPasswordInput,
  ChangePasswordInput,
  OAuthStartInput,
  ConfirmRecoveryPhraseInput,
  LinkViaRecoveryInput
} from '@/services/auth-service'

// =============================================================================
// Types
// =============================================================================

export interface AuthContextValue {
  // State
  isLoading: boolean
  isAuthenticated: boolean
  needsSetup: boolean
  isFullySetup: boolean
  hasMasterKey: boolean
  setupStatus: SetupStatus | null

  // Recovery phrase (for setup flow)
  recoveryPhrase: string | null
  isGeneratingPhrase: boolean
  generateRecoveryPhrase: () => void

  // Email auth
  signup: (input: EmailSignupInput) => Promise<{ success: boolean; error?: string }>
  login: (input: EmailLoginInput) => Promise<{ success: boolean; error?: string }>
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>
  resendVerification: () => Promise<{ success: boolean; error?: string }>

  // Password
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (input: ResetPasswordInput) => Promise<{ success: boolean; error?: string }>
  changePassword: (input: ChangePasswordInput) => Promise<{ success: boolean; error?: string }>

  // OAuth
  startOAuth: (input: OAuthStartInput) => Promise<{ authUrl: string }>
  completeOAuth: (input: { code: string; state: string }) => Promise<{ success: boolean; error?: string }>

  // Recovery phrase confirmation
  confirmRecoveryPhrase: (input: ConfirmRecoveryPhraseInput) => Promise<{ success: boolean; error?: string }>

  // First device setup (after recovery phrase confirmation)
  setupFirstDevice: () => Promise<{ success: boolean; error?: string }>
  isSettingUpDevice: boolean

  // Device linking (for new device using recovery phrase)
  linkViaRecovery: (input: LinkViaRecoveryInput) => Promise<{ success: boolean; deviceId?: string; error?: string }>
  isLinkingViaRecovery: boolean

  // Session
  logout: () => Promise<{ success: boolean }>

  // Refresh
  refreshStatus: () => void

  // Loading states
  isSigningUp: boolean
  isLoggingIn: boolean
  isVerifying: boolean
  isResending: boolean
  isForgotPassword: boolean
  isResettingPassword: boolean
  isChangingPassword: boolean
  isStartingOAuth: boolean
  isCompletingOAuth: boolean
  isConfirmingPhrase: boolean
  isLoggingOut: boolean
}

// =============================================================================
// Context
// =============================================================================

const AuthContext = createContext<AuthContextValue | null>(null)

// =============================================================================
// Hook
// =============================================================================

/**
 * Use the auth context.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// =============================================================================
// Provider Props
// =============================================================================

interface AuthProviderProps {
  children: ReactNode
  onSessionExpired?: (reason: 'token_expired' | 'device_removed' | 'key_rotated') => void
}

// =============================================================================
// Provider
// =============================================================================

/**
 * Auth provider component.
 * Provides authentication state and methods to children.
 */
export function AuthProvider({ children, onSessionExpired }: AuthProviderProps) {
  const queryClient = useQueryClient()

  // Queries
  const setupStatusQuery = useSetupStatus()
  const masterKeyQuery = useHasMasterKey()
  const recoveryPhraseQuery = useGenerateRecoveryPhrase(false)

  // Mutations
  const signupMutation = useEmailSignup()
  const loginMutation = useEmailLogin()
  const verifyMutation = useEmailVerify()
  const resendMutation = useResendVerification()
  const forgotPasswordMutation = useForgotPassword()
  const resetPasswordMutation = useResetPassword()
  const changePasswordMutation = useChangePassword()
  const oauthStartMutation = useOAuthStart()
  const oauthCallbackMutation = useOAuthCallback()
  const confirmPhraseMutation = useConfirmRecoveryPhrase()
  const linkViaRecoveryMutation = useLinkViaRecovery()
  const setupDeviceMutation = useSetupFirstDevice()
  const logoutMutation = useLogout()

  // Session expired handler
  useSessionExpired(
    useCallback(
      (reason) => {
        // Invalidate all auth queries
        queryClient.invalidateQueries({ queryKey: authKeys.all })
        // Call external handler if provided
        onSessionExpired?.(reason)
      },
      [queryClient, onSessionExpired]
    )
  )

  // Derived state
  const isLoading = setupStatusQuery.isLoading || masterKeyQuery.isLoading
  const setupStatus = setupStatusQuery.data ?? null
  const hasMasterKey = masterKeyQuery.data?.hasMasterKey ?? false

  const isAuthenticated = setupStatus?.hasUser && setupStatus?.hasDevice
  const needsSetup = !setupStatus?.isSetup
  const isFullySetup =
    setupStatus?.isSetup && setupStatus?.hasMasterKey && hasMasterKey

  // Methods
  const generateRecoveryPhrase = useCallback(() => {
    recoveryPhraseQuery.refetch()
  }, [recoveryPhraseQuery])

  const signup = useCallback(
    async (input: EmailSignupInput) => {
      return signupMutation.mutateAsync(input)
    },
    [signupMutation]
  )

  const login = useCallback(
    async (input: EmailLoginInput) => {
      return loginMutation.mutateAsync(input)
    },
    [loginMutation]
  )

  const verifyEmail = useCallback(
    async (token: string) => {
      return verifyMutation.mutateAsync(token)
    },
    [verifyMutation]
  )

  const resendVerification = useCallback(async () => {
    return resendMutation.mutateAsync()
  }, [resendMutation])

  const forgotPassword = useCallback(
    async (email: string) => {
      return forgotPasswordMutation.mutateAsync(email)
    },
    [forgotPasswordMutation]
  )

  const resetPassword = useCallback(
    async (input: ResetPasswordInput) => {
      return resetPasswordMutation.mutateAsync(input)
    },
    [resetPasswordMutation]
  )

  const changePassword = useCallback(
    async (input: ChangePasswordInput) => {
      return changePasswordMutation.mutateAsync(input)
    },
    [changePasswordMutation]
  )

  const startOAuth = useCallback(
    async (input: OAuthStartInput) => {
      return oauthStartMutation.mutateAsync(input)
    },
    [oauthStartMutation]
  )

  const completeOAuth = useCallback(
    async (input: { code: string; state: string }) => {
      return oauthCallbackMutation.mutateAsync(input)
    },
    [oauthCallbackMutation]
  )

  const confirmRecoveryPhrase = useCallback(
    async (input: ConfirmRecoveryPhraseInput) => {
      return confirmPhraseMutation.mutateAsync(input)
    },
    [confirmPhraseMutation]
  )

  const setupFirstDevice = useCallback(async () => {
    try {
      const result = await setupDeviceMutation.mutateAsync()
      return { success: result.success }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Device setup failed'
      }
    }
  }, [setupDeviceMutation])

  const linkViaRecovery = useCallback(
    async (input: LinkViaRecoveryInput) => {
      try {
        const result = await linkViaRecoveryMutation.mutateAsync(input)
        return result
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Device linking failed'
        }
      }
    },
    [linkViaRecoveryMutation]
  )

  const logout = useCallback(async () => {
    return logoutMutation.mutateAsync()
  }, [logoutMutation])

  const refreshStatus = useCallback(() => {
    setupStatusQuery.refetch()
    masterKeyQuery.refetch()
  }, [setupStatusQuery, masterKeyQuery])

  // Memoized context value
  const value = useMemo<AuthContextValue>(
    () => ({
      // State
      isLoading,
      isAuthenticated: Boolean(isAuthenticated),
      needsSetup,
      isFullySetup: Boolean(isFullySetup),
      hasMasterKey,
      setupStatus,

      // Recovery phrase
      recoveryPhrase: recoveryPhraseQuery.data?.phrase ?? null,
      isGeneratingPhrase: recoveryPhraseQuery.isFetching,
      generateRecoveryPhrase,

      // Email auth
      signup,
      login,
      verifyEmail,
      resendVerification,

      // Password
      forgotPassword,
      resetPassword,
      changePassword,

      // OAuth
      startOAuth,
      completeOAuth,

      // Recovery phrase confirmation
      confirmRecoveryPhrase,

      // First device setup
      setupFirstDevice,
      isSettingUpDevice: setupDeviceMutation.isPending,

      // Device linking (new device using recovery phrase)
      linkViaRecovery,
      isLinkingViaRecovery: linkViaRecoveryMutation.isPending,

      // Session
      logout,

      // Refresh
      refreshStatus,

      // Loading states
      isSigningUp: signupMutation.isPending,
      isLoggingIn: loginMutation.isPending,
      isVerifying: verifyMutation.isPending,
      isResending: resendMutation.isPending,
      isForgotPassword: forgotPasswordMutation.isPending,
      isResettingPassword: resetPasswordMutation.isPending,
      isChangingPassword: changePasswordMutation.isPending,
      isStartingOAuth: oauthStartMutation.isPending,
      isCompletingOAuth: oauthCallbackMutation.isPending,
      isConfirmingPhrase: confirmPhraseMutation.isPending,
      isLoggingOut: logoutMutation.isPending
    }),
    [
      isLoading,
      isAuthenticated,
      needsSetup,
      isFullySetup,
      hasMasterKey,
      setupStatus,
      recoveryPhraseQuery.data?.phrase,
      recoveryPhraseQuery.isFetching,
      generateRecoveryPhrase,
      signup,
      login,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      changePassword,
      startOAuth,
      completeOAuth,
      confirmRecoveryPhrase,
      setupFirstDevice,
      linkViaRecovery,
      logout,
      refreshStatus,
      signupMutation.isPending,
      loginMutation.isPending,
      verifyMutation.isPending,
      resendMutation.isPending,
      forgotPasswordMutation.isPending,
      resetPasswordMutation.isPending,
      changePasswordMutation.isPending,
      oauthStartMutation.isPending,
      oauthCallbackMutation.isPending,
      confirmPhraseMutation.isPending,
      linkViaRecoveryMutation.isPending,
      setupDeviceMutation.isPending,
      logoutMutation.isPending
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
