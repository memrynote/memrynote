import { Check } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { priorityConfig, type Priority } from "@/data/sample-tasks"

// ============================================================================
// TYPES
// ============================================================================

interface PrioritySelectProps {
  value: Priority
  onChange: (value: Priority) => void
  className?: string
}

// ============================================================================
// PRIORITY OPTIONS
// ============================================================================

const priorityOptions: { value: Priority; label: string; color: string | null }[] = [
  { value: "none", label: "None", color: null },
  { value: "low", label: "Low", color: priorityConfig.low.color },
  { value: "medium", label: "Medium", color: priorityConfig.medium.color },
  { value: "high", label: "High", color: priorityConfig.high.color },
  { value: "urgent", label: "Urgent", color: priorityConfig.urgent.color },
]

// ============================================================================
// PRIORITY DOT COMPONENT
// ============================================================================

const PriorityDot = ({
  color,
  className,
}: {
  color: string | null
  className?: string
}): React.JSX.Element => {
  if (!color) {
    // Empty circle for "none"
    return (
      <span
        className={cn(
          "size-3 shrink-0 rounded-full border-2 border-text-tertiary",
          className
        )}
        aria-hidden="true"
      />
    )
  }

  return (
    <span
      className={cn("size-3 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}

// ============================================================================
// PRIORITY SELECT COMPONENT
// ============================================================================

export const PrioritySelect = ({
  value,
  onChange,
  className,
}: PrioritySelectProps): React.JSX.Element => {
  const currentOption = priorityOptions.find((opt) => opt.value === value)

  const handleValueChange = (newValue: string): void => {
    onChange(newValue as Priority)
  }

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger
        className={cn("w-full", className)}
        aria-label="Select priority"
      >
        <SelectValue>
          <div className="flex items-center gap-2">
            <PriorityDot color={currentOption?.color || null} />
            <span>{currentOption?.label || "None"}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {priorityOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <PriorityDot color={option.color} />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default PrioritySelect

