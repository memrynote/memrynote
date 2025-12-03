import { useState } from "react"
import { List, Grid } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

type ViewMode = "list" | "card"

interface InboxPageProps {
  className?: string
}

export function InboxPage({ className }: InboxPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const itemCount = 14

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header: Title + Badge + View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-foreground">Inbox</h1>
          <Badge variant="secondary" className="text-muted-foreground">
            {itemCount} items
          </Badge>
        </div>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => {
            if (value) setViewMode(value as ViewMode)
          }}
          className="gap-1"
        >
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="card" aria-label="Grid view">
            <Grid className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Content: Scrollable area with view-based rendering */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === "list" ? (
          <div className="space-y-2">
            {Array.from({ length: itemCount }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="size-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">
                  Inbox item {i + 1}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: itemCount }).map((_, i) => (
              <div
                key={i}
                className="aspect-video rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm text-muted-foreground">
                  Card {i + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
