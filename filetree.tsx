

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    FileText,
    FileCode,
    FileImage,
    MoreHorizontal,
    Hash,
    Search,
    X,
    Palette,
    Edit2,
    Trash2,
    Rocket,
    Book,
    Heart,
    Zap,
    Globe,
    Code,
    Box,
    Layout,
    Star,
    Music,
    Video,
    Image,
    Coffee,
    Briefcase,
    Home,
    Cloud,
    Sun,
    Moon,
    Smile,
    PenTool,
    Bookmark,
    Beaker,
    GraduationCap,
    FlaskConical,
    Atom,
    Calculator,
    Microscope,
    Brain
} from 'lucide-react';
import { FileSystemNode } from '../types';

// --- Constants & Config ---

const VIBRANT_PALETTE = [
    { name: 'Red', value: '#EF4444' },      // Chemistry
    { name: 'Orange', value: '#F97316' },   // Extra Files
    { name: 'Amber', value: '#F59E0B' },    // Warning/Note
    { name: 'Yellow', value: '#EAB308' },   // Extra Research
    { name: 'Lime', value: '#84CC16' },     // Growth
    { name: 'Green', value: '#22C55E' },    // Maths
    { name: 'Emerald', value: '#10B981' },  // Success
    { name: 'Teal', value: '#14B8A6' },     // Physics
    { name: 'Cyan', value: '#06B6D4' },     // Science
    { name: 'Sky', value: '#0EA5E9' },      // Air
    { name: 'Blue', value: '#3B82F6' },     // Textbooks
    { name: 'Indigo', value: '#6366F1' },   // TaskNotes
    { name: 'Violet', value: '#8B5CF6' },   // Magic
    { name: 'Purple', value: '#A855F7' },   // Templates
    { name: 'Fuchsia', value: '#D946EF' },  // Playful
    { name: 'Pink', value: '#EC4899' },     // To do
    { name: 'Rose', value: '#F43F5E' },     // Alert
    { name: 'Slate', value: '#64748B' },    // Neutral
    { name: 'Charcoal', value: '#374151' }  // Default
];

// Available icons for the picker
const ICON_MAP: Record<string, React.ElementType> = {
    Folder, FolderOpen, FileText, FileCode, FileImage, Hash,
    Rocket, Book, Heart, Zap, Globe, Code, Box, Layout,
    Star, Music, Video, Image, Coffee, Briefcase, Home,
    Cloud, Sun, Moon, Smile, PenTool, Bookmark,
    Beaker, GraduationCap, FlaskConical, Atom, Calculator,
    Microscope, Brain
};

const DEFAULT_ICON_COLOR = '#374151'; // Charcoal

interface FileTreeProps {
    data: FileSystemNode[];
    activeId?: string;
    onSelectNode: (node: FileSystemNode) => void;
    searchTerm?: string;
}

interface FileTreeItemProps {
    node: FileSystemNode;
    level: number;
    activeId?: string;
    onSelectNode: (node: FileSystemNode) => void;
    onContextMenu: (e: React.MouseEvent, node: FileSystemNode) => void;
}

// --- Utility: Recursive Filter ---
export const filterFileSystem = (nodes: FileSystemNode[], query: string): FileSystemNode[] => {
    if (!query) return nodes;
    const lowerQuery = query.toLowerCase();

    return nodes.reduce((acc: FileSystemNode[], node) => {
        // Check if current node matches
        const matchesName = node.name.toLowerCase().includes(lowerQuery);

        // Process children regardless
        let filteredChildren: FileSystemNode[] = [];
        if (node.type === 'folder' && node.children) {
            filteredChildren = filterFileSystem(node.children, query);
        }

        // Keep node if it matches OR if it has matching children
        if (matchesName || filteredChildren.length > 0) {
            acc.push({
                ...node,
                children: filteredChildren,
                // Auto-expand if children matched
                isOpen: filteredChildren.length > 0 ? true : node.isOpen
            });
        }

        return acc;
    }, []);
};

// --- Icon Helper ---
const DynamicIcon = ({ name, className, color }: { name: string, className?: string, color?: string }) => {
    const IconComponent = ICON_MAP[name] || FileText;
    return <IconComponent size={14} className={className} style={{ color }} />;
};

const getFileIcon = (node: FileSystemNode) => {
    // 1. Custom Icon
    if (node.iconName) {
        return <DynamicIcon name={node.iconName} className="opacity-90" color={node.iconColor} />;
    }

    // 2. Default Logic
    if (node.type === 'folder') {
        // Folders handle their own Open/Close icons in the component, this is just fallback type logic
        return null;
    }

    const name = node.name;
    if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.js') || name.endsWith('.json')) {
        return <FileCode size={14} className="text-blue-400" />;
    }
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg') || name.endsWith('.fig')) {
        return <FileImage size={14} className="text-purple-400" />;
    }
    if (name.endsWith('.md')) {
        return <Hash size={14} className="text-text-tertiary" />;
    }
    return <FileText size={14} className="text-text-tertiary" />;
};

// --- File Tree Item Component ---

const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, level, activeId, onSelectNode, onContextMenu }) => {
    const [isOpen, setIsOpen] = useState(node.isOpen || false);
    const isActive = activeId === node.id;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
            onSelectNode(node); // Also allow selecting folders
        } else {
            onSelectNode(node);
        }
    };

    const handleRightClick = (e: React.MouseEvent) => {
        onContextMenu(e, node);
    };

    // Sync internal state with props
    React.useEffect(() => {
        if (node.isOpen !== undefined) {
            setIsOpen(node.isOpen);
        }
    }, [node.isOpen]);

    // Determine styles
    const customColorStyle = node.iconColor ? { color: node.iconColor } : {};

    // Base classes
    let containerClasses = `group flex items-center gap-1.5 py-1.5 pr-2 pl-3 cursor-pointer transition-colors duration-150 rounded-r-md mr-2 relative select-none`;

    // State classes
    if (isActive) {
        containerClasses += ` bg-[#F2F0E9] dark:bg-surface-active font-medium`;
        // If no custom color, use default active text color
        if (!node.iconColor) containerClasses += ` text-gray-900 dark:text-text-primary`;
    } else {
        // If no custom color, use default inactive text color
        if (!node.iconColor) containerClasses += ` text-text-secondary hover:bg-surface-active/50 hover:text-text-primary`;
        else containerClasses += ` hover:bg-surface-active/50`;
    }

    return (
        <div className="relative">
            <div
                className={containerClasses}
                onClick={handleClick}
                onContextMenu={handleRightClick}
                style={customColorStyle}
            >
                {/* Active Indicator Bar */}
                {isActive && (
                    <div
                        className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full"
                        style={{ backgroundColor: node.iconColor || 'var(--color-text-primary)' }}
                    />
                )}

                {/* Toggle Icon or Spacer */}
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center opacity-60 transition-colors">
                    {node.type === 'folder' ? (
                        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                            <ChevronRight size={12} strokeWidth={2.5} style={{ color: node.iconColor }} />
                        </div>
                    ) : (
                        <span className="w-4" /> // Spacer
                    )}
                </span>

                {/* Type/Custom Icon */}
                <span className="flex-shrink-0 opacity-90">
                    {node.type === 'folder' ? (
                        node.iconName ? (
                            <DynamicIcon name={node.iconName} color={node.iconColor} />
                        ) : (
                            isOpen ? <FolderOpen size={14} style={{ color: node.iconColor }} className={!node.iconColor ? "text-text-secondary fill-text-tertiary/20" : ""} /> : <Folder size={14} style={{ color: node.iconColor }} className={!node.iconColor ? "text-text-tertiary fill-text-tertiary/10" : ""} />
                        )
                    ) : (
                        getFileIcon(node)
                    )}
                </span>

                {/* Label */}
                <span className="truncate text-sm leading-none pt-0.5 flex-1">{node.name}</span>

                {/* Hover Actions */}
                <button
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-paper/50 transition-all"
                    onClick={(e) => { e.stopPropagation(); onContextMenu(e, node); }}
                    aria-label="Options"
                    style={{ color: node.iconColor || undefined }} // Ensure ellipses match text color
                >
                    <MoreHorizontal size={14} />
                </button>
            </div>

            {/* Children */}
            {node.type === 'folder' && isOpen && node.children && (
                <div className="relative ml-4 border-l border-border-subtle/50">
                    {node.children.map((child) => (
                        <FileTreeItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            activeId={activeId}
                            onSelectNode={onSelectNode}
                            onContextMenu={onContextMenu}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Context Menus & Pickers ---

interface MenuState {
    isOpen: boolean;
    x: number;
    y: number;
    nodeId: string | null;
    mode: 'main' | 'icon' | 'color';
}

const FileTree: React.FC<FileTreeProps> = ({ data, activeId, onSelectNode, searchTerm = '' }) => {
    // Local state to manage data updates (simulated for demo)
    const [treeData, setTreeData] = useState<FileSystemNode[]>(data);

    // Menu State
    const [menu, setMenu] = useState<MenuState>({ isOpen: false, x: 0, y: 0, nodeId: null, mode: 'main' });
    const [pickerSearch, setPickerSearch] = useState('');

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = () => setMenu(prev => ({ ...prev, isOpen: false }));
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // Sync props data to state
    useEffect(() => {
        setTreeData(data);
    }, [data]);

    // Recursively update a node in the tree
    const updateNode = (nodes: FileSystemNode[], id: string, updates: Partial<FileSystemNode>): FileSystemNode[] => {
        return nodes.map(node => {
            if (node.id === id) {
                return { ...node, ...updates };
            }
            if (node.children) {
                return { ...node, children: updateNode(node.children, id, updates) };
            }
            return node;
        });
    };

    const handleContextMenu = (e: React.MouseEvent, node: FileSystemNode) => {
        e.preventDefault();
        e.stopPropagation();
        setMenu({
            isOpen: true,
            x: e.clientX,
            y: e.clientY,
            nodeId: node.id,
            mode: 'main'
        });
        setPickerSearch(''); // Reset search
    };

    const handleMenuAction = (action: string, payload?: any) => {
        if (!menu.nodeId) return;

        if (action === 'open_icon_picker') {
            setMenu(prev => ({ ...prev, mode: 'icon' }));
            return; // Don't close menu yet
        }

        if (action === 'open_color_picker') {
            setMenu(prev => ({ ...prev, mode: 'color' }));
            return;
        }

        // Data Updates
        if (action === 'set_icon') {
            setTreeData(prev => updateNode(prev, menu.nodeId!, { iconName: payload }));
        } else if (action === 'set_color') {
            setTreeData(prev => updateNode(prev, menu.nodeId!, { iconColor: payload }));
        } else if (action === 'delete') {
            // Logic to delete would go here (filter out node)
            console.log("Delete", menu.nodeId);
        }

        setMenu(prev => ({ ...prev, isOpen: false }));
    };

    // Filtered Tree for rendering
    const filteredData = useMemo(() => {
        return filterFileSystem(treeData, searchTerm);
    }, [treeData, searchTerm]);

    return (
        <div className="flex flex-col pb-4 pt-1 relative h-full">
            {filteredData.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-text-tertiary italic">
                    No results found.
                </div>
            ) : (
                filteredData.map((node) => (
                    <FileTreeItem
                        key={node.id}
                        node={node}
                        level={0}
                        activeId={activeId}
                        onSelectNode={onSelectNode}
                        onContextMenu={handleContextMenu}
                    />
                ))
            )}

            {/* --- Context Menu Overlay --- */}
            {menu.isOpen && (
                <div
                    className="fixed z-50 bg-white dark:bg-surface border border-gray-200 dark:border-border-subtle shadow-xl rounded-lg p-1 animate-in fade-in zoom-in-95 duration-100 min-w-[180px]"
                    style={{ top: Math.min(menu.y, window.innerHeight - 300), left: Math.min(menu.x, window.innerWidth - 200) }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Main Menu Mode */}
                    {menu.mode === 'main' && (
                        <div className="flex flex-col gap-1">
                            <button onClick={() => console.log('Rename')} className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-text-primary hover:bg-gray-100 dark:hover:bg-surface-active rounded-md text-left">
                                <Edit2 size={14} className="text-text-tertiary" />
                                Rename
                            </button>
                            <button onClick={() => handleMenuAction('open_icon_picker')} className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-text-primary hover:bg-gray-100 dark:hover:bg-surface-active rounded-md text-left">
                                <Smile size={14} className="text-text-tertiary" />
                                Change Icon...
                            </button>
                            <button onClick={() => handleMenuAction('open_color_picker')} className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-text-primary hover:bg-gray-100 dark:hover:bg-surface-active rounded-md text-left">
                                <Palette size={14} className="text-text-tertiary" />
                                Change Color...
                            </button>
                            <div className="h-px bg-gray-100 dark:bg-border-subtle my-0.5" />
                            <button onClick={() => handleMenuAction('delete')} className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-left">
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>
                    )}

                    {/* Icon Picker Mode */}
                    {menu.mode === 'icon' && (
                        <div className="w-64 h-64 flex flex-col">
                            <div className="px-2 py-2 border-b border-gray-100 dark:border-border-subtle">
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-surface-active px-2 py-1.5 rounded-md border border-gray-200 dark:border-border-subtle">
                                    <Search size={12} className="text-gray-400" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search icons..."
                                        className="bg-transparent border-none outline-none text-xs w-full"
                                        value={pickerSearch}
                                        onChange={(e) => setPickerSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 grid grid-cols-5 gap-1 content-start">
                                {Object.keys(ICON_MAP)
                                    .filter(key => key.toLowerCase().includes(pickerSearch.toLowerCase()))
                                    .map(iconName => (
                                        <button
                                            key={iconName}
                                            onClick={() => handleMenuAction('set_icon', iconName)}
                                            className="aspect-square flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-surface-active text-text-secondary hover:text-text-primary transition-colors"
                                            title={iconName}
                                        >
                                            <DynamicIcon name={iconName} />
                                        </button>
                                    ))
                                }
                            </div>
                            <div className="p-2 border-t border-gray-100 dark:border-border-subtle">
                                <button onClick={() => setMenu(prev => ({ ...prev, mode: 'main' }))} className="text-xs text-text-tertiary hover:text-text-primary w-full text-center">Back</button>
                            </div>
                        </div>
                    )}

                    {/* Color Picker Mode */}
                    {menu.mode === 'color' && (
                        <div className="p-3 w-56">
                            <p className="text-xs font-medium text-text-tertiary mb-3 uppercase tracking-wider">Select Color</p>
                            <div className="grid grid-cols-5 gap-2 justify-items-center">
                                {/* Option to clear color */}
                                <button
                                    onClick={() => handleMenuAction('set_color', undefined)}
                                    className="w-6 h-6 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform relative group bg-white flex items-center justify-center"
                                    title="Default"
                                >
                                    <span className="w-6 h-0.5 bg-red-400 rotate-45 absolute" />
                                </button>

                                {VIBRANT_PALETTE.map(color => (
                                    <button
                                        key={color.name}
                                        onClick={() => handleMenuAction('set_color', color.value)}
                                        className="w-6 h-6 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform relative group"
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    >
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-border-subtle">
                                <button onClick={() => setMenu(prev => ({ ...prev, mode: 'main' }))} className="text-xs text-text-tertiary hover:text-text-primary w-full text-center">Back</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileTree;
