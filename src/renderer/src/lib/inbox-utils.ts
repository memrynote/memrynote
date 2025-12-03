import type { InboxItem } from "@/types"

// Time period groups
export type TimePeriod = "TODAY" | "YESTERDAY" | "OLDER"

export interface GroupedItems {
  period: TimePeriod
  items: InboxItem[]
}

// Helper to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// Helper to group items by time period
export const groupItemsByTimePeriod = (items: InboxItem[]): GroupedItems[] => {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  const groups: Record<TimePeriod, InboxItem[]> = {
    TODAY: [],
    YESTERDAY: [],
    OLDER: [],
  }

  items.forEach((item) => {
    if (isSameDay(item.timestamp, now)) {
      groups.TODAY.push(item)
    } else if (isSameDay(item.timestamp, yesterday)) {
      groups.YESTERDAY.push(item)
    } else {
      groups.OLDER.push(item)
    }
  })

  // Return only non-empty groups in order
  const result: GroupedItems[] = []
  if (groups.TODAY.length > 0) result.push({ period: "TODAY", items: groups.TODAY })
  if (groups.YESTERDAY.length > 0) result.push({ period: "YESTERDAY", items: groups.YESTERDAY })
  if (groups.OLDER.length > 0) result.push({ period: "OLDER", items: groups.OLDER })

  return result
}

// Helper to format timestamp based on time period
export const formatTimestamp = (timestamp: Date, period: TimePeriod): string => {
  if (period === "TODAY" || period === "YESTERDAY") {
    // Show time like "2:34 PM"
    return timestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }
  // For OLDER items, show date like "Dec 24"
  return timestamp.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

// Helper to format voice memo duration
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Helper to extract domain from URL
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace("www.", "")
  } catch {
    return url
  }
}

