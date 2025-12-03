import type { InboxItem, NotePreviewContent } from "@/types"

interface NotePreviewProps {
  item: InboxItem
}

const NotePreview = ({ item }: NotePreviewProps): React.JSX.Element => {
  const content = item.previewContent as NotePreviewContent | undefined
  const fullText = content?.fullText || item.content || ""

  // Simple markdown-like rendering
  const renderText = (text: string): React.JSX.Element[] => {
    const lines = text.split("\n")
    const elements: React.JSX.Element[] = []

    lines.forEach((line, index) => {
      // Handle bullet points
      if (line.startsWith("- ")) {
        elements.push(
          <li key={index} className="ml-4 text-[var(--foreground)]">
            {renderInlineFormatting(line.slice(2))}
          </li>
        )
        return
      }

      // Handle numbered lists
      const numberedMatch = line.match(/^(\d+)\.\s(.*)$/)
      if (numberedMatch) {
        elements.push(
          <li key={index} className="ml-4 text-[var(--foreground)] list-decimal">
            {renderInlineFormatting(numberedMatch[2])}
          </li>
        )
        return
      }

      // Handle headers (simple ## style)
      if (line.startsWith("## ")) {
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-[var(--foreground)] mt-4 mb-2">
            {line.slice(3)}
          </h3>
        )
        return
      }

      if (line.startsWith("# ")) {
        elements.push(
          <h2 key={index} className="text-xl font-semibold text-[var(--foreground)] mt-4 mb-2">
            {line.slice(2)}
          </h2>
        )
        return
      }

      // Empty line = paragraph break
      if (line.trim() === "") {
        elements.push(<div key={index} className="h-4" aria-hidden="true" />)
        return
      }

      // Regular paragraph
      elements.push(
        <p key={index} className="text-[var(--foreground)] leading-relaxed">
          {renderInlineFormatting(line)}
        </p>
      )
    })

    return elements
  }

  // Handle **bold** and *italic*
  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Simple regex for bold and italic
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0

    // Process bold (**text**)
    const boldRegex = /\*\*([^*]+)\*\*/g
    let lastIndex = 0
    let match

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      parts.push(
        <strong key={`bold-${key++}`} className="font-semibold">
          {match[1]}
        </strong>
      )
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    if (parts.length === 0) {
      return text
    }

    return parts
  }

  return (
    <div className="space-y-2">
      {renderText(fullText)}
    </div>
  )
}

export { NotePreview }

