import { useState, useCallback, useEffect, useRef } from "react"
import { Plus, X, Check, Loader2 } from "lucide-react"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { suggestedTags } from "@/data/filing-data"
import { cn } from "@/lib/utils"

interface BulkTagPopoverProps {
    isOpen: boolean
    itemCount: number
    trigger: React.ReactNode
    onOpenChange: (open: boolean) => void
    onApplyTags: (tags: string[]) => void
}

const BulkTagPopover = ({
    isOpen,
    itemCount,
    trigger,
    onOpenChange,
    onApplyTags,
}: BulkTagPopoverProps): React.JSX.Element => {
    const [tags, setTags] = useState<string[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isApplying, setIsApplying] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Reset state when popover opens
    useEffect(() => {
        if (isOpen) {
            setTags([])
            setInputValue("")
            // Focus input after a short delay to ensure popover is mounted
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        }
    }, [isOpen])

    const handleAddTag = useCallback((tag: string): void => {
        const trimmedTag = tag.trim().toLowerCase()
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags((prev) => [...prev, trimmedTag])
            setInputValue("")
        }
    }, [tags])

    const handleRemoveTag = useCallback((tagToRemove: string): void => {
        setTags((prev) => prev.filter((t) => t !== tagToRemove))
    }, [])

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault()
            handleAddTag(inputValue)
        } else if (e.key === "," && inputValue.trim()) {
            e.preventDefault()
            handleAddTag(inputValue)
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            // Remove last tag on backspace when input is empty
            setTags((prev) => prev.slice(0, -1))
        }
    }

    const handleApplyTags = async (): Promise<void> => {
        if (tags.length === 0) return

        setIsApplying(true)

        // Simulate brief delay
        await new Promise((resolve) => setTimeout(resolve, 300))

        onApplyTags(tags)
        setIsApplying(false)
        onOpenChange(false)
    }

    const availableSuggestions = suggestedTags.filter((t) => !tags.includes(t))
    const canApply = tags.length > 0 && !isApplying

    return (
        <Popover open={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                {trigger}
            </PopoverTrigger>
            <PopoverContent
                className="w-[320px] p-0"
                align="center"
                side="top"
                sideOffset={8}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-[var(--border)]">
                    <h3 className="font-semibold text-sm">
                        Tag {itemCount} Item{itemCount !== 1 ? "s" : ""}
                    </h3>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Tag Input */}
                    <div className="space-y-2">
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Add tags..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            className="h-9"
                        />
                    </div>

                    {/* Suggested Tags */}
                    {availableSuggestions.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-[var(--muted-foreground)]">Suggested:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {availableSuggestions.slice(0, 5).map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleAddTag(tag)}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                                    >
                                        <Plus className="size-3" aria-hidden="true" />
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Added Tags */}
                    {tags.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-[var(--muted-foreground)]">Added tags:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="gap-1 pr-1"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 hover:bg-[var(--muted)] rounded-full p-0.5"
                                        >
                                            <X className="size-3" aria-hidden="true" />
                                            <span className="sr-only">Remove {tag}</span>
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-[var(--border)]">
                    <Button
                        onClick={handleApplyTags}
                        disabled={!canApply}
                        className="w-full"
                        size="sm"
                    >
                        {isApplying ? (
                            <>
                                <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
                                Applying...
                            </>
                        ) : (
                            <>
                                Apply to {itemCount} item{itemCount !== 1 ? "s" : ""}
                            </>
                        )}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export { BulkTagPopover }

