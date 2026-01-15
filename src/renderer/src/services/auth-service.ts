/**
 * Auth Service
 *
 * Thin wrapper around window.api.sync and window.api.crypto for authentication
 * and encryption operations in the renderer process.
 *
 * @module services/auth-service
 */

import type {
  SetupStatus,
  RecoveryPhraseValidation
} from '../../../preload/index.d'

// =============================================================================
// Types for service input
// =============================================================================

export interface EmailSignupInput {
  email: string
  password: string
  deviceName: string
}

export interface EmailLoginInput {
  email: string
  password: string
  deviceName: string
}

export interface ResetPasswordInput {
  token: string
  newPassword: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface OAuthStartInput {
  provider: 'google' | 'apple' | 'github'
  deviceName: string
}

export interface OAuthCallbackInput {
  code: string
  state: string
}

export interface ConfirmRecoveryPhraseInput {
  phrase: string
  confirmationWords: Array<{ index: number; word: string }>
}

export interface SetupFirstDeviceInput {
  kdfSalt: string
  keyVerifier: string
}

// =============================================================================
// Password validation types
// =============================================================================

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'fair' | 'good' | 'strong'
  checks: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecial: boolean
  }
}

// =============================================================================
// Auth Service
// =============================================================================

export const authService = {
  // ===========================================================================
  // Setup Status
  // ===========================================================================

  /**
   * Get the current setup status.
   * @returns Setup status with flags for user, device, and master key
   */
  getSetupStatus: (): Promise<SetupStatus> => {
    return window.api.sync.getSetupStatus()
  },

  /**
   * Complete first device setup by storing KDF salt and key verifier.
   * @param input - KDF salt and key verifier
   */
  setupFirstDevice: (
    input: SetupFirstDeviceInput
  ): Promise<{ success: boolean }> => {
    return window.api.sync.setupFirstDevice(input)
  },

  // ===========================================================================
  // Email Authentication
  // ===========================================================================

  /**
   * Sign up with email and password.
   * Generates recovery phrase and initiates email verification.
   * @param input - Email, password, and device name
   */
  emailSignup: (
    input: EmailSignupInput
  ): Promise<{ success: boolean; error?: string }> => {
    return window.api.sync.emailSignup(input)
  },

  /**
   * Log in with email and password.
   * @param input - Email, password, and device name
   */
  emailLogin: (
    input: EmailLoginInput
  ): Promise<{ success: boolean; error?: string }> => {
    return window.api.sync.emailLogin(input)
  },

  /**
   * Verify email with token from verification email.
   * @param token - Verification token
   */
  emailVerify: (token: string): Promise<{ success: boolean; error?: string }> => {
    return window.api.sync.emailVerify(token)
  },

  /**
   * Resend verification email.
   */
  resendVerification: (): Promise<{ success: boolean; error?: string }> => {
    return window.api.sync.resendVerification()
  },

  // ===========================================================================
  // Password Management
  // ===========================================================================

  /**
   * Request password reset email.
   * @param email - User's email address
   */
  forgotPassword: (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    return window.api.sync.forgotPassword(email)
  },

  /**
   * Reset password with token from reset email.
   * @param input - Reset token and new password
   */
  resetPassword: (
    input: ResetPasswordInput
  ): Promise<{ success: boolean; error?: string }> => {
    return window.api.sync.resetPassword(input)
  },

  /**
   * Change password (authenticated).
   * @param input - Current and new password
   */
  changePassword: (
    input: ChangePasswordInput
  ): Promise<{ success: boolean; error?: string }> => {
    return window.api.sync.changePassword(input)
  },

  /**
   * Validate password strength locally.
   * @param password - Password to validate
   */
  validatePassword: (password: string): PasswordValidationResult => {
    const checks = {
      minLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    }

    const errors: string[] = []
    if (!checks.minLength) errors.push('Password must be at least 12 characters')
    if (!checks.hasUppercase) errors.push('Password must contain an uppercase letter')
    if (!checks.hasLowercase) errors.push('Password must contain a lowercase letter')
    if (!checks.hasNumber) errors.push('Password must contain a number')
    if (!checks.hasSpecial) errors.push('Password must contain a special character')

    const passedChecks = Object.values(checks).filter(Boolean).length
    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
    if (passedChecks >= 5) strength = 'strong'
    else if (passedChecks >= 4) strength = 'good'
    else if (passedChecks >= 3) strength = 'fair'

    return {
      isValid: errors.length === 0,
      errors,
      strength,
      checks
    }
  },

  // ===========================================================================
  // OAuth Authentication
  // ===========================================================================

  /**
   * Start OAuth flow for a provider.
   * @param input - Provider and device name
   * @returns Auth URL to open in browser
   */
  oauthStart: (input: OAuthStartInput): Promise<{ authUrl: string }> => {
    return window.api.sync.oauthStart(input)
  },

  /**
   * Complete OAuth callback.
   * @param input - OAuth code and state
   */
  oauthCallback: (
    input: OAuthCallbackInput
  ): Promise<{ success: boolean; error?: string }> => {
    return window.api.sync.oauthCallback(input)
  },

  // ===========================================================================
  // Session
  // ===========================================================================

  /**
   * Log out and clear session.
   */
  logout: (): Promise<{ success: boolean }> => {
    return window.api.sync.logout()
  },

  // ===========================================================================
  // Recovery Phrase
  // ===========================================================================

  /**
   * Generate a new BIP39 recovery phrase.
   * @returns 24-word recovery phrase
   */
  generateRecoveryPhrase: (): Promise<{ phrase: string; wordCount: number }> => {
    return window.api.crypto.generateRecoveryPhrase()
  },

  /**
   * Validate a recovery phrase.
   * @param phrase - Recovery phrase to validate
   */
  validateRecoveryPhrase: (phrase: string): Promise<RecoveryPhraseValidation> => {
    return window.api.crypto.validateRecoveryPhrase(phrase)
  },

  /**
   * Confirm recovery phrase by checking random words.
   * @param input - Phrase and confirmation words
   */
  confirmRecoveryPhrase: (
    input: ConfirmRecoveryPhraseInput
  ): Promise<{ success: boolean; error?: string }> => {
    return window.api.crypto.confirmRecoveryPhrase(input)
  },

  // ===========================================================================
  // Keychain
  // ===========================================================================

  /**
   * Check if master key is stored in keychain.
   */
  hasMasterKey: (): Promise<{ hasMasterKey: boolean }> => {
    return window.api.crypto.hasMasterKey()
  },

  /**
   * Clear master key from keychain.
   */
  clearKeychain: (): Promise<{ success: boolean }> => {
    return window.api.crypto.clearKeychain()
  },

  /**
   * Derive keys from master key.
   */
  deriveKeys: (): Promise<{ success: boolean; error?: string }> => {
    return window.api.crypto.deriveKeys()
  }
}

// =============================================================================
// Event Subscriptions
// =============================================================================

/**
 * Subscribe to sync session expired events.
 * @param callback - Callback when session expires
 * @returns Unsubscribe function
 */
export const onSessionExpired = (
  callback: (event: { reason: 'token_expired' | 'device_removed' | 'key_rotated' }) => void
): (() => void) => {
  return window.api.onSyncSessionExpired(callback)
}

// =============================================================================
// Standalone Functions
// =============================================================================

/**
 * Validate password strength locally.
 * Exported as a standalone function for use in components.
 * @param password - Password to validate
 */
export const validatePassword = authService.validatePassword

// Re-export types for convenience
export type { SetupStatus, RecoveryPhraseValidation }
