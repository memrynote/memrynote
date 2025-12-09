/**
 * Journal Editor Component
 * Tiptap-based rich text editor for journal entries
 */

import { useEffect, memo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'
import { EditorToolbar } from './editor-toolbar'

// =============================================================================
// TYPES
// =============================================================================

export interface JournalEditorProps {
    /** Initial content (HTML) */
    content?: string
    /** Placeholder text */
    placeholder?: string
    /** Whether the editor is active/focused */
    isActive?: boolean
    /** Callback when content changes */
    onContentChange?: (content: string) => void
    /** Additional CSS classes */
    className?: string
    /** Read-only mode */
    readOnly?: boolean
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Journal Editor - Tiptap-based rich text editor
 */
export const JournalEditor = memo(function JournalEditor({
    content = '',
    placeholder = 'Start writing...',
    isActive = false,
    onContentChange,
    className,
    readOnly = false,
}: JournalEditorProps): React.JSX.Element {

    // Initialize Tiptap editor
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline underline-offset-2 hover:text-primary/80',
                },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            onContentChange?.(html)
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm dark:prose-invert max-w-none',
                    'focus:outline-none',
                    'min-h-[120px] px-4 py-3',
                    // Typography
                    'text-[15px] leading-relaxed',
                    // Headings
                    'prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2',
                    'prose-h1:text-xl prose-h2:text-lg prose-h3:text-base',
                    // Lists
                    'prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5',
                    // Blockquote
                    'prose-blockquote:border-l-2 prose-blockquote:border-primary/40 prose-blockquote:pl-4 prose-blockquote:italic',
                    // Code
                    'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
                    'prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg',
                ),
            },
        },
    }, [placeholder, readOnly])

    // Update content when prop changes
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    // Handle focus
    useEffect(() => {
        if (isActive && editor && !editor.isFocused) {
            // Optional: auto-focus when day becomes active
            // editor.commands.focus()
        }
    }, [isActive, editor])

    return (
        <div
            className={cn(
                "rounded-lg border bg-background overflow-hidden",
                isActive ? "border-border ring-1 ring-primary/20" : "border-border/50",
                className
            )}
        >
            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className="[&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:pointer-events-none"
            />

            {/* Toolbar */}
            <EditorToolbar editor={editor} />
        </div>
    )
})

export default JournalEditor
