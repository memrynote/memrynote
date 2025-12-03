import { useRef, useEffect } from "react"
import { Folder, CornerDownLeft } from "lucide-react"

import { cn } from "@/lib/utils"

interface InlineQuickFileProps {
  query: string
  onQueryChange: (query: string) => void
  onSubmit: () => void
  onCancel: () => void
  onArrowDown: () => void
  onArrowUp: () => void
  className?: string
}

const InlineQuickFile = ({
  query,
  onQueryChange,
  onSubmit,
  onCancel,
  onArrowDown,
  onArrowUp,
  className,
}: InlineQuickFileProps): React.JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input when mounted
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    switch (e.key) {
      case "Enter":
        e.preventDefault()
        onSubmit()
        break
      case "Escape":
        e.preventDefault()
        onCancel()
        break
      case "ArrowDown":
        e.preventDefault()
        onArrowDown()
        break
      case "ArrowUp":
        e.preventDefault()
        onArrowUp()
        break
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onQueryChange(e.target.value)
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 flex-1 min-w-0",
        "animate-in fade-in-0 slide-in-from-left-2 duration-[var(--duration-fast)]",
        "motion-reduce:animate-none",
        className
      )}
    >
      {/* Arrow separator */}
      <span className="text-muted-foreground text-sm shrink-0">→</span>

      {/* Folder icon */}
      <Folder
        className="size-4 text-muted-foreground shrink-0"
        aria-hidden="true"
      />

      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type folder name..."
        className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none border-none"
        aria-label="Quick file folder search"
        autoComplete="off"
        spellCheck={false}
      />

      {/* Enter hint */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <CornerDownLeft className="size-3" aria-hidden="true" />
      </div>
    </div>
  )
}

export { InlineQuickFile }

