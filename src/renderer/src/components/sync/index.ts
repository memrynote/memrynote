/**
 * Sync Components
 *
 * Components for authentication, sync status, and device management.
 *
 * @module components/sync
 */

// Forms
export { SignupForm } from './signup-form'
export { LoginForm } from './login-form'
export { ForgotPasswordForm } from './forgot-password-form'
export { ResetPasswordForm } from './reset-password-form'

// OAuth
export { OAuthButtons, OAuthDivider } from './oauth-buttons'

// Password
export { PasswordStrength, PasswordStrengthCompact, validatePassword } from './password-strength'

// Recovery Phrase
export { RecoveryPhraseDisplay, RecoveryPhraseCompact } from './recovery-phrase-display'
export { RecoveryPhraseConfirm } from './recovery-phrase-confirm'
export { RecoveryPhraseInput } from './recovery-phrase-input'

// Verification
export { VerificationPending, VerificationPendingCompact } from './verification-pending'

// Dialogs
export { ChangePasswordDialog } from './change-password-dialog'

// Device Linking
export { QRLinking } from './qr-linking'
export { QRScanner } from './qr-scanner'
export { LinkingApprovalDialog } from './linking-approval-dialog'
export { LinkingPending } from './linking-pending'
export { LinkingModal } from './linking-modal'
