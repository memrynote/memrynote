import { useState, useMemo, useRef, useEffect } from "react"
import { Search, FileText, Folder, Link2, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { LinkedNote } from "@/types"

interface LinkedItemProps {
  note: LinkedNote
  onRemove: (id: string) => void
}

const LinkedItem = ({ note, onRemove }: LinkedItemProps): React.JSX.Element => {
  const handleRemove = (): void => {
    onRemove(note.id)
  }

  const Icon = note.type === "folder" ? Folder : FileText

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--muted)]/50 group">
      <Link2 className="size-3.5 text-[var(--muted-foreground)]" aria-hidden="true" />
      <Icon className="size-3.5 text-[var(--muted-foreground)]" aria-hidden="true" />
      <span className="flex-1 text-sm truncate">{note.title}</span>
      <button
        type="button"
        onClick={handleRemove}
        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[var(--muted)] rounded transition-opacity"
        aria-label={`Remove link to ${note.title}`}
      >
        <X className="size-3.5 text-[var(--muted-foreground)]" aria-hidden="true" />
      </button>
    </div>
  )
}

interface SearchResultProps {
  note: LinkedNote
  onSelect: (note: LinkedNote) => void
  isHighlighted: boolean
}

const SearchResult = ({
  note,
  onSelect,
  isHighlighted,
}: SearchResultProps): React.JSX.Element => {
  const handleClick = (): void => {
    onSelect(note)
  }

  const Icon = note.type === "folder" ? Folder : FileText

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
        isHighlighted ? "bg-[var(--muted)]" : "hover:bg-[var(--muted)]/50"
      )}
      onClick={handleClick}
      role="option"
      aria-selected={isHighlighted}
    >
      <Icon className="size-4 text-[var(--muted-foreground)]" aria-hidden="true" />
      <span className="text-sm">{note.title}</span>
    </div>
  )
}

interface LinkSearchProps {
  availableNotes: LinkedNote[]
  linkedNotes: LinkedNote[]
  onLinkedNotesChange: (notes: LinkedNote[]) => void
}

const LinkSearch = ({
  availableNotes,
  linkedNotes,
  onLinkedNotesChange,
}: LinkSearchProps): React.JSX.Element => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter notes based on search query and exclude already linked ones
  const filteredNotes = useMemo(() => {
    const linkedIds = new Set(linkedNotes.map((n) => n.id))
    const available = availableNotes.filter((note) => !linkedIds.has(note.id))

    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    return available.filter((note) =>
      note.title.toLowerCase().includes(query)
    )
  }, [availableNotes, linkedNotes, searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Reset highlighted index when filtered results change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredNotes])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value)
    setIsDropdownOpen(true)
  }

  const handleInputFocus = (): void => {
    if (searchQuery.trim()) {
      setIsDropdownOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (!isDropdownOpen || filteredNotes.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredNotes.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case "Enter":
        e.preventDefault()
        if (filteredNotes[highlightedIndex]) {
          handleSelectNote(filteredNotes[highlightedIndex])
        }
        break
      case "Escape":
        setIsDropdownOpen(false)
        break
    }
  }

  const handleSelectNote = (note: LinkedNote): void => {
    onLinkedNotesChange([...linkedNotes, note])
    setSearchQuery("")
    setIsDropdownOpen(false)
    inputRef.current?.focus()
  }

  const handleRemoveNote = (id: string): void => {
    onLinkedNotesChange(linkedNotes.filter((note) => note.id !== id))
  }

  return (
    <div className="space-y-3">
      {/* Section Label */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-[var(--foreground)]">Link to</h3>
        <span className="text-xs text-[var(--muted-foreground)]">(optional)</span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-foreground)]"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search notes to link..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="pl-9"
          aria-label="Search notes to link"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
        />

        {/* Dropdown Results */}
        {isDropdownOpen && filteredNotes.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 py-1 bg-[var(--background)] border border-[var(--border)] rounded-md shadow-lg z-10 max-h-48 overflow-y-auto"
            role="listbox"
          >
            {filteredNotes.map((note, index) => (
              <SearchResult
                key={note.id}
                note={note}
                onSelect={handleSelectNote}
                isHighlighted={index === highlightedIndex}
              />
            ))}
          </div>
        )}

        {/* No results message */}
        {isDropdownOpen && searchQuery.trim() && filteredNotes.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 py-2 px-3 bg-[var(--background)] border border-[var(--border)] rounded-md shadow-lg z-10">
            <p className="text-sm text-[var(--muted-foreground)]">No notes found</p>
          </div>
        )}
      </div>

      {/* Linked Notes List */}
      {linkedNotes.length > 0 ? (
        <div className="space-y-1" role="list" aria-label="Linked notes">
          {linkedNotes.map((note) => (
            <LinkedItem key={note.id} note={note} onRemove={handleRemoveNote} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]/70 italic">
          No links added
        </p>
      )}
    </div>
  )
}

export { LinkSearch }

