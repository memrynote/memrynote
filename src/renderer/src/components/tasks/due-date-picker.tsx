import { useState, useMemo } from "react"
import { Calendar as CalendarIcon, Star, X, Clock, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TimePicker } from "./time-picker"
import { cn } from "@/lib/utils"
import { startOfDay, addDays, formatDateShort, formatDayName } from "@/lib/task-utils"

// ============================================================================
// TYPES
// ============================================================================

interface DueDatePickerProps {
  date: Date | null
  time: string | null
  onDateChange: (date: Date | null) => void
  onTimeChange: (time: string | null) => void
  className?: string
}

// ============================================================================
// QUICK DATE OPTIONS
// ============================================================================

interface QuickDateOption {
  label: string
  icon: React.ReactNode
  getDate: () => Date
}

const getQuickDateOptions = (): QuickDateOption[] => {
  const today = startOfDay(new Date())
  const tomorrow = addDays(today, 1)
  const nextWeek = addDays(today, 7)

  // Get next Monday
  const dayOfWeek = today.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek
  const nextMonday = addDays(today, daysUntilMonday)

  return [
    {
      label: "Today",
      icon: <Star className="size-4" />,
      getDate: () => today,
    },
    {
      label: "Tomorrow",
      icon: <CalendarIcon className="size-4" />,
      getDate: () => tomorrow,
    },
    {
      label: "Next Monday",
      icon: <CalendarIcon className="size-4" />,
      getDate: () => nextMonday,
    },
    {
      label: "Next Week",
      icon: <CalendarIcon className="size-4" />,
      getDate: () => nextWeek,
    },
  ]
}

// ============================================================================
// DATE DISPLAY HELPERS
// ============================================================================

const formatSelectedDate = (date: Date): string => {
  const today = startOfDay(new Date())
  const selectedDate = startOfDay(date)

  // Check if today
  if (selectedDate.getTime() === today.getTime()) {
    return "Today"
  }

  // Check if tomorrow
  const tomorrow = addDays(today, 1)
  if (selectedDate.getTime() === tomorrow.getTime()) {
    return "Tomorrow"
  }

  // Check if within the next week (show day name)
  const weekFromNow = addDays(today, 7)
  if (selectedDate > today && selectedDate <= weekFromNow) {
    return formatDayName(date)
  }

  // Otherwise show date
  return formatDateShort(date)
}

// ============================================================================
// DUE DATE PICKER COMPONENT
// ============================================================================

export const DueDatePicker = ({
  date,
  time,
  onDateChange,
  onTimeChange,
  className,
}: DueDatePickerProps): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  const quickOptions = useMemo(() => getQuickDateOptions(), [])

  const handleQuickSelect = (getDate: () => Date): void => {
    onDateChange(getDate())
    setShowCalendar(false)
    setIsOpen(false)
  }

  const handleCalendarSelect = (selectedDate: Date | undefined): void => {
    if (selectedDate) {
      onDateChange(selectedDate)
      setShowCalendar(false)
      setIsOpen(false)
    }
  }

  const handleRemoveDate = (): void => {
    onDateChange(null)
    onTimeChange(null)
    setShowTimePicker(false)
    setIsOpen(false)
  }

  const handleToggleTimePicker = (): void => {
    setShowTimePicker(!showTimePicker)
    if (!showTimePicker) {
      // Default to 9:00 AM when adding time
      onTimeChange("09:00")
    } else {
      onTimeChange(null)
    }
  }

  // Format time for display
  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {date ? (
            <span>
              {formatSelectedDate(date)}
              {time && <span className="ml-1 text-muted-foreground">· {formatTime(time)}</span>}
            </span>
          ) : (
            <span>No date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {!showCalendar ? (
          <div className="flex flex-col">
            {/* Quick options */}
            <div className="flex flex-col p-1">
              {quickOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleQuickSelect(option.getDate)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent focus:bg-accent focus:outline-none"
                  )}
                >
                  <span className="text-muted-foreground">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>

            {/* Separator */}
            <div className="mx-1 h-px bg-border" />

            {/* Pick a date option */}
            <div className="p-1">
              <button
                type="button"
                onClick={() => setShowCalendar(true)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  "hover:bg-accent focus:bg-accent focus:outline-none"
                )}
              >
                <CalendarIcon className="size-4 text-muted-foreground" />
                <span>Pick a date...</span>
              </button>
            </div>

            {/* Selected date actions (if date is set) */}
            {date && (
              <>
                <div className="mx-1 h-px bg-border" />

                <div className="flex flex-col gap-1 p-3">
                  {/* Current selected date */}
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="size-4 text-muted-foreground" />
                    <span className="font-medium">
                      {date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Time picker toggle */}
                  {!showTimePicker ? (
                    <button
                      type="button"
                      onClick={handleToggleTimePicker}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors",
                        "hover:bg-accent hover:text-foreground focus:bg-accent focus:outline-none"
                      )}
                    >
                      <Plus className="size-4" />
                      <span>Add time</span>
                    </button>
                  ) : (
                    <div className="mt-2">
                      <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Clock className="size-3" />
                        <span>TIME</span>
                      </div>
                      <TimePicker
                        value={time}
                        onChange={onTimeChange}
                      />
                    </div>
                  )}
                </div>

                <div className="mx-1 h-px bg-border" />

                {/* Remove date option */}
                <div className="p-1">
                  <button
                    type="button"
                    onClick={handleRemoveDate}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors",
                      "hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none"
                    )}
                  >
                    <X className="size-4" />
                    <span>Remove date</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Back button */}
            <button
              type="button"
              onClick={() => setShowCalendar(false)}
              className={cn(
                "flex items-center gap-2 border-b border-border px-3 py-2 text-sm transition-colors",
                "hover:bg-accent focus:bg-accent focus:outline-none"
              )}
            >
              <span className="text-muted-foreground">←</span>
              <span>Back to options</span>
            </button>

            {/* Calendar */}
            <Calendar
              mode="single"
              selected={date || undefined}
              onSelect={handleCalendarSelect}
              initialFocus
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default DueDatePicker

