import { useState } from "react"
import { LayoutGrid, List } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type ViewMode = "list" | "card"

const InboxPage = (): React.JSX.Element => {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const itemCount = 14

  const handleViewChange = (value: string): void => {
    if (value === "list" || value === "card") {
      setViewMode(value)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header Section - fixed, non-scrolling */}
      <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Inbox
          </h1>
          <Badge variant="secondary" className="text-[var(--muted-foreground)]">
            {itemCount} items
          </Badge>
        </div>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={handleViewChange}
          className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-1"
          aria-label="View mode"
        >
          <ToggleGroupItem
            value="list"
            aria-label="List view"
            className="rounded-md px-3 py-1.5 text-sm font-medium data-[state=on]:bg-[var(--background)] data-[state=on]:shadow-sm"
          >
            <List className="mr-1.5 size-4" />
            List
          </ToggleGroupItem>
          <ToggleGroupItem
            value="card"
            aria-label="Card view"
            className="rounded-md px-3 py-1.5 text-sm font-medium data-[state=on]:bg-[var(--background)] data-[state=on]:shadow-sm"
          >
            <LayoutGrid className="mr-1.5 size-4" />
            Card
          </ToggleGroupItem>
        </ToggleGroup>
      </header>

      {/* Content Area - scrollable */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex h-full items-center justify-center">
          <p className="text-lg text-[var(--muted-foreground)]">
            {viewMode === "list" ? "List View Content" : "Card View Content"}
          </p>
        </div>
      </main>
    </div>
  )
}

export { InboxPage }

