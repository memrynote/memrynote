import React, { useState } from 'react'
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
} from 'lucide-react'
import { TreeDataItem } from '@/types'
import { cn } from '@/lib/utils'

interface FileTreeProps {
  data?: TreeDataItem[]
  activeId?: string
  onSelectNode?: (node: TreeDataItem) => void
}

interface FileTreeItemProps {
  node: TreeDataItem
  level: number
  activeId?: string
  onSelectNode?: (node: TreeDataItem) => void
}

// File Tree Item Component (recursive)
const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  level,
  activeId,
  onSelectNode
}) => {
  const [isOpen, setIsOpen] = useState(node.isOpen || false)
  const isActive = activeId === node.id
  const hasChildren = node.children && node.children.length > 0
  const isFolder = node.type === 'folder' || hasChildren

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFolder) {
      setIsOpen(!isOpen)
    }
    if (onSelectNode && !node.disabled) {
      onSelectNode(node)
    }
  }

  // Sync internal state with props
  React.useEffect(() => {
    if (node.isOpen !== undefined) {
      setIsOpen(node.isOpen)
    }
  }, [node.isOpen])

  return (
    <div className="relative">
      <div
        className={cn(
          'group flex items-center gap-1.5 py-1.5 pr-2 pl-3 cursor-pointer transition-colors duration-150 rounded-r-md mr-2 relative select-none',
          isActive && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
          !isActive && 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
          node.disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={handleClick}
        style={node.iconColor ? { color: node.iconColor } : undefined}
      >
        {/* Active Indicator Bar */}
        {isActive && (
          <div
            className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-sidebar-primary"
            style={node.iconColor ? { backgroundColor: node.iconColor } : undefined}
          />
        )}

        {/* Toggle Chevron or Spacer */}
        <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center opacity-60">
          {isFolder ? (
            <div className={cn(
              'transform transition-transform duration-200',
              isOpen && 'rotate-90'
            )}>
              <ChevronRight size={12} strokeWidth={2.5} />
            </div>
          ) : (
            <span className="w-4" />
          )}
        </span>

        {/* Folder/File Icon */}
        <span className="flex-shrink-0 opacity-90">
          {isFolder ? (
            isOpen ? (
              <FolderOpen size={14} className="text-sidebar-foreground/70" />
            ) : (
              <Folder size={14} className="text-sidebar-foreground/60" />
            )
          ) : (
            <FileText size={14} className="text-sidebar-foreground/60" />
          )}
        </span>

        {/* Label */}
        <span className="truncate text-sm leading-none pt-0.5 flex-1">
          {node.name}
        </span>
      </div>

      {/* Children with vertical line */}
      {isFolder && isOpen && hasChildren && (
        <div className="relative ml-4 border-l border-sidebar-border/50">
          {node.children!.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              activeId={activeId}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Main File Tree Component
export const FileTree: React.FC<FileTreeProps> = ({
  data = [],
  activeId,
  onSelectNode
}) => {
  if (data.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-xs text-sidebar-foreground/50 italic">
        No items to display
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-4 pt-1 relative">
      {data.map((node) => (
        <FileTreeItem
          key={node.id}
          node={node}
          level={0}
          activeId={activeId}
          onSelectNode={onSelectNode}
        />
      ))}
    </div>
  )
}
