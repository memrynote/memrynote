import { useState, useCallback, useRef, useEffect, memo } from 'react'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DocumentInfoTab, type DocumentStats } from './document-info-tab'

export interface HeadingItem {
  id: string
  level: number
  text: string
  position: number
}

export interface OutlineInfoPanelProps {
  headings?: HeadingItem[]
  onHeadingClick?: (headingId: string) => void
  className?: string
  activeHeadingId?: string
  stats?: DocumentStats
}

function getLineWidth(level: number): number {
  switch (level) {
    case 1:
      return 24
    case 2:
      return 16
    case 3:
    default:
      return 10
  }
}

export const OutlineInfoPanel = memo(function OutlineInfoPanel({
  headings = [],
  onHeadingClick,
  className,
  activeHeadingId,
  stats
}: OutlineInfoPanelProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('outline')
  const containerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleClick = useCallback(
    (headingId: string) => {
      onHeadingClick?.(headingId)
    },
    [onHeadingClick]
  )

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 150)
  }, [])

  useEffect(() => {
    if (isHovered && activeHeadingId && popupRef.current && activeTab === 'outline') {
      requestAnimationFrame(() => {
        const activeElement = popupRef.current?.querySelector(
          `[data-heading-id="${activeHeadingId}"]`
        )
        if (activeElement) {
          activeElement.scrollIntoView({ block: 'center', behavior: 'instant' })
        }
      })
    }
  }, [isHovered, activeHeadingId, activeTab])

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  if (headings.length === 0 && !stats) {
    return null
  }

  const verticalLineHeight = headings.length > 0 ? Math.max(0, (headings.length - 1) * 14 + 4) : 0
  const hasOutline = headings.length > 0
  const hasInfo = !!stats

  return (
    <div
      ref={containerRef}
      className={cn(
        'outline-indicator',
        'absolute right-4 top-32',
        'hidden md:block z-40',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!isHovered ? (
        <div className="flex items-start gap-0 cursor-pointer">
          {headings.length > 0 && (
            <div className="flex flex-col items-end gap-2.5 py-1">
              {headings.map((heading) => {
                const isActive = heading.id === activeHeadingId
                const width = getLineWidth(heading.level)

                return (
                  <div
                    key={heading.id}
                    className="outline-line rounded-full transition-all duration-200"
                    style={{
                      width: `${width}px`,
                      height: isActive ? '2px' : '1px',
                      backgroundColor: isActive ? '#C45D3E' : '#B5B0A6',
                      opacity: isActive ? 1 : 0.4
                    }}
                  />
                )
              })}
            </div>
          )}

          {headings.length > 0 && (
            <div
              className="vertical-connector ml-1.5 mt-1"
              style={{
                width: '1px',
                height: `${verticalLineHeight}px`,
                background:
                  'linear-gradient(to bottom, transparent 0%, rgb(214, 211, 209) 8%, rgb(214, 211, 209) 92%, transparent 100%)'
              }}
              aria-hidden="true"
            />
          )}

          {headings.length === 0 && hasInfo && (
            <div
              className="w-2 h-2 rounded-full bg-stone-400/40 hover:bg-stone-400/60 transition-colors"
              aria-label="Document info available"
            />
          )}
        </div>
      ) : (
        <div
          ref={popupRef}
          className={cn(
            'bg-white dark:bg-[#1c1b19] border border-[#E8E5DF] dark:border-[#3a3935]',
            'shadow-lg rounded-lg',
            'min-w-[240px] max-w-[300px]',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-8 p-0.5 bg-[#F5F3EE] dark:bg-[#252420] rounded-t-lg rounded-b-none">
              <TabsTrigger
                value="outline"
                className={cn(
                  'flex-1 h-7 text-xs font-medium rounded-md',
                  'data-[state=active]:bg-white data-[state=active]:dark:bg-[#1c1b19]',
                  'data-[state=active]:shadow-sm',
                  !hasOutline && 'opacity-50 cursor-not-allowed'
                )}
                disabled={!hasOutline}
              >
                Outline
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className={cn(
                  'flex-1 h-7 text-xs font-medium rounded-md',
                  'data-[state=active]:bg-white data-[state=active]:dark:bg-[#1c1b19]',
                  'data-[state=active]:shadow-sm',
                  !hasInfo && 'opacity-50 cursor-not-allowed'
                )}
                disabled={!hasInfo}
              >
                Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="outline" className="mt-0 max-h-[70vh] overflow-y-auto">
              {hasOutline ? (
                <nav
                  aria-label="Document outline"
                  className="[font-synthesis:none] text-[12px] leading-4 flex flex-col gap-1 antialiased p-2"
                >
                  {headings.map((heading) => {
                    const isActive = heading.id === activeHeadingId
                    const isSubHeading = heading.level >= 3

                    return (
                      <button
                        key={heading.id}
                        data-heading-id={heading.id}
                        onClick={() => handleClick(heading.id)}
                        className={cn(
                          'flex items-center rounded-md py-1.5 gap-2 text-left',
                          'transition-colors duration-150',
                          'focus:outline-none',
                          isSubHeading ? 'pr-2 pl-6' : 'px-2',
                          isActive ? 'bg-[#C45D3E14]' : 'hover:bg-[var(--surface-active)]/50'
                        )}
                      >
                        <div
                          className={cn(
                            'w-[3px] h-3.5 shrink-0 rounded-xs transition-colors duration-150',
                            isActive ? 'bg-[#C45D3E]' : 'bg-transparent'
                          )}
                        />
                        <span
                          className={cn(
                            'text-[12px] font-sans leading-4 truncate',
                            isActive
                              ? 'text-[#C45D3E] font-medium'
                              : isSubHeading
                                ? 'text-[#8A857A]'
                                : 'text-[#5C5850]'
                          )}
                        >
                          {heading.text}
                        </span>
                      </button>
                    )
                  })}
                </nav>
              ) : (
                <div className="py-6 text-center text-sm text-[#B5B0A6]">No headings found</div>
              )}
            </TabsContent>

            <TabsContent value="info" className="mt-0">
              {hasInfo && stats ? (
                <DocumentInfoTab stats={stats} />
              ) : (
                <div className="py-6 text-center text-sm text-[#B5B0A6]">No info available</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
})

export type { DocumentStats }
