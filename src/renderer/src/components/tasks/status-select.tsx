import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Status } from "@/data/tasks-data"

// ============================================================================
// TYPES
// ============================================================================

interface StatusSelectProps {
  value: string
  onChange: (value: string) => void
  statuses: Status[]
  className?: string
}

// ============================================================================
// STATUS DOT COMPONENT
// ============================================================================

const StatusDot = ({
  color,
  className,
}: {
  color: string
  className?: string
}): React.JSX.Element => {
  return (
    <span
      className={cn("size-3 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}

// ============================================================================
// STATUS SELECT COMPONENT
// ============================================================================

export const StatusSelect = ({
  value,
  onChange,
  statuses,
  className,
}: StatusSelectProps): React.JSX.Element => {
  // Sort statuses by order
  const sortedStatuses = [...statuses].sort((a, b) => a.order - b.order)

  // Find current status
  const currentStatus = sortedStatuses.find((s) => s.id === value)

  const handleValueChange = (newValue: string): void => {
    onChange(newValue)
  }

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger
        className={cn("w-full", className)}
        aria-label="Select status"
      >
        <SelectValue>
          {currentStatus ? (
            <div className="flex items-center gap-2">
              <StatusDot color={currentStatus.color} />
              <span className="truncate">{currentStatus.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select status</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {sortedStatuses.map((status) => (
          <SelectItem
            key={status.id}
            value={status.id}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <StatusDot color={status.color} />
              <span className="truncate">{status.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default StatusSelect

