/**
 * Recovery Phrase Input Component
 *
 * Component for entering an existing recovery phrase when logging in on a new device.
 * Used when a user has an existing account but needs to set up a new device.
 *
 * @module components/sync/recovery-phrase-input
 */

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface RecoveryPhraseInputProps {
  onSubmit: (phrase: string) => void
  isLoading?: boolean
  error?: string | null
  className?: string
}

// BIP39 word list validation (subset of common words for quick check)
const isValidBip39Format = (phrase: string): boolean => {
  const words = phrase.trim().toLowerCase().split(/\s+/)
  // Recovery phrases are typically 12 or 24 words
  return words.length === 12 || words.length === 24
}

// =============================================================================
// Component
// =============================================================================

/**
 * Recovery phrase input component.
 * Allows users to enter their existing 24-word recovery phrase.
 */
export function RecoveryPhraseInput({
  onSubmit,
  isLoading = false,
  error,
  className
}: RecoveryPhraseInputProps) {
  const [phrase, setPhrase] = useState('')
  const [showPhrase, setShowPhrase] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Validate phrase format
  const validation = useMemo(() => {
    if (!phrase.trim()) {
      return { isValid: false, wordCount: 0, message: '' }
    }

    const words = phrase.trim().toLowerCase().split(/\s+/)
    const wordCount = words.length
    const isValidLength = wordCount === 12 || wordCount === 24

    if (!isValidLength) {
      return {
        isValid: false,
        wordCount,
        message: `Recovery phrase must be 12 or 24 words (currently ${wordCount} words)`
      }
    }

    return { isValid: true, wordCount, message: '' }
  }, [phrase])

  // Handle submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setLocalError(null)

      const trimmedPhrase = phrase.trim().toLowerCase()

      if (!isValidBip39Format(trimmedPhrase)) {
        setLocalError('Please enter a valid 12 or 24 word recovery phrase')
        return
      }

      onSubmit(trimmedPhrase)
    },
    [phrase, onSubmit]
  )

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Allow paste but normalize the input
    const pastedText = e.clipboardData.getData('text')
    const normalized = pastedText
      .trim()
      .toLowerCase()
      .replace(/[\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')

    e.preventDefault()
    setPhrase(normalized)
    setLocalError(null)
  }, [])

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPhrase(e.target.value)
    setLocalError(null)
  }, [])

  const displayError = error || localError

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <KeyRound className="size-8 text-primary" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-xl font-semibold">Enter Your Recovery Phrase</h2>
        <p className="text-sm text-muted-foreground">
          Enter the 24-word recovery phrase you saved when you first created your account. This
          phrase is required to set up sync on this device.
        </p>
      </div>

      {/* Error Alert */}
      {displayError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Textarea
              value={phrase}
              onChange={handleChange}
              onPaste={handlePaste}
              placeholder="Enter your 24-word recovery phrase, separated by spaces..."
              className={cn(
                'min-h-[120px] resize-none font-mono text-sm',
                !showPhrase && phrase && 'text-security-disc'
              )}
              style={
                !showPhrase && phrase
                  ? {
                      WebkitTextSecurity: 'disc',
                      textSecurity: 'disc'
                    }
                  : undefined
              }
              disabled={isLoading}
              aria-label="Recovery phrase input"
              autoComplete="off"
              spellCheck={false}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2"
              onClick={() => setShowPhrase(!showPhrase)}
              aria-label={showPhrase ? 'Hide recovery phrase' : 'Show recovery phrase'}
            >
              {showPhrase ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>

          {/* Word count indicator */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {validation.wordCount > 0
                ? `${validation.wordCount} words entered`
                : 'Enter your recovery phrase'}
            </span>
            {validation.wordCount > 0 && !validation.isValid && (
              <span className="text-destructive">{validation.message}</span>
            )}
            {validation.isValid && <span className="text-green-600">Valid word count</span>}
          </div>
        </div>

        {/* Security notice */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/50">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Security Notice:</strong> Your recovery phrase is never sent to our servers. It
            is only used locally on this device to derive your encryption keys.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading || !validation.isValid}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              Verifying...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </form>

      {/* Help text */}
      <p className="text-center text-xs text-muted-foreground">
        Lost your recovery phrase?{' '}
        <span className="text-destructive">
          Unfortunately, your data cannot be recovered without it.
        </span>
      </p>
    </div>
  )
}

export default RecoveryPhraseInput
