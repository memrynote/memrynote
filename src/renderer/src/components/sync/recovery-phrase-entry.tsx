/**
 * Recovery Phrase Entry Component
 * Full 24-word recovery phrase entry for returning users to register their device
 */

import { useState, useCallback, useMemo, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecoveryPhraseEntryProps {
  onSubmit: (phrase: string[]) => void
  onBack: () => void
  isLoading?: boolean
  error?: string
  className?: string
}

export function RecoveryPhraseEntry({
  onSubmit,
  onBack,
  isLoading = false,
  error,
  className
}: RecoveryPhraseEntryProps): React.JSX.Element {
  const [words, setWords] = useState<string[]>(Array(24).fill(''))
  const [showPhrase, setShowPhrase] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleWordChange = useCallback((index: number, value: string) => {
    const cleanValue = value.toLowerCase().trim()
    if (cleanValue.includes(' ')) {
      const pastedWords = cleanValue.split(/\s+/).filter(Boolean)
      if (pastedWords.length > 1) {
        setWords((prev) => {
          const newWords = [...prev]
          pastedWords.forEach((word, i) => {
            if (index + i < 24) {
              newWords[index + i] = word
            }
          })
          return newWords
        })
        const nextIndex = Math.min(index + pastedWords.length, 23)
        setTimeout(() => inputRefs.current[nextIndex]?.focus(), 0)
        return
      }
    }
    setWords((prev) => {
      const newWords = [...prev]
      newWords[index] = cleanValue
      return newWords
    })
  }, [])

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault()
        const nextIndex = e.shiftKey ? index - 1 : index + 1
        if (nextIndex >= 0 && nextIndex < 24) {
          inputRefs.current[nextIndex]?.focus()
        }
      } else if (e.key === 'Backspace' && !words[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    },
    [words]
  )

  const allFilled = useMemo(() => {
    return words.every((word) => word.length > 0)
  }, [words])

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (allFilled) {
        onSubmit(words)
      }
    },
    [words, allFilled, onSubmit]
  )

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Back</span>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Enter your recovery phrase</h2>
        <p className="text-sm text-muted-foreground">
          Enter your 24-word recovery phrase to access your account on this device
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPhrase(!showPhrase)}
            className="text-xs"
          >
            {showPhrase ? (
              <>
                <EyeOff className="w-3 h-3 mr-1" />
                Hide
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 mr-1" />
                Show
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {words.map((word, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground w-5 text-right">{index + 1}.</span>
              <Input
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type={showPhrase ? 'text' : 'password'}
                value={word}
                onChange={(e) => handleWordChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                placeholder=""
                disabled={isLoading}
                autoComplete="off"
                spellCheck={false}
                className={cn('h-8 text-sm px-2', error && 'border-destructive')}
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={!allFilled || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </form>
    </div>
  )
}

export default RecoveryPhraseEntry
