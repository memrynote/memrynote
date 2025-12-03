import { useState, useRef, useCallback } from "react"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

interface QuickAddInputProps {
  onAdd: (title: string) => void
  placeholder?: string
  className?: string
}

// ============================================================================
// QUICK ADD INPUT COMPONENT
// ============================================================================

export const QuickAddInput = ({
  onAdd,
  placeholder = "Add task...",
  className,
}: QuickAddInputProps): React.JSX.Element => {
  const [value, setValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback((): void => {
    const trimmedValue = value.trim()
    if (trimmedValue) {
      onAdd(trimmedValue)
      setValue("")
      // Keep focus for rapid entry
      inputRef.current?.focus()
    }
  }, [value, onAdd])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      setValue("")
      inputRef.current?.blur()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value)
  }

  const handleFocus = (): void => {
    setIsFocused(true)
  }

  const handleBlur = (): void => {
    setIsFocused(false)
  }

  const handleContainerClick = (): void => {
    inputRef.current?.focus()
  }

  return (
    <div
      role="button"
      tabIndex={-1}
      onClick={handleContainerClick}
      className={cn(
        "flex items-center gap-3 rounded-md border px-3 py-2.5 transition-all duration-150",
        isFocused
          ? "border-primary bg-background shadow-sm"
          : "border-transparent bg-muted/50 hover:bg-muted",
        className
      )}
    >
      {/* Checkbox placeholder / Plus icon */}
      <div
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          isFocused
            ? "border-text-tertiary"
            : "border-transparent"
        )}
      >
        {!isFocused && (
          <Plus className="size-4 text-text-tertiary" aria-hidden="true" />
        )}
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent text-sm outline-none",
          "placeholder:text-text-tertiary",
          isFocused ? "text-text-primary" : "text-text-tertiary"
        )}
        aria-label="Quick add task"
      />
    </div>
  )
}

export default QuickAddInput

