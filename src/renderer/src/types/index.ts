export interface TreeDataItem {
  id: string
  name: string
  type?: 'file' | 'folder'
  children?: TreeDataItem[]
  isOpen?: boolean
  iconName?: string
  iconColor?: string
  disabled?: boolean
  draggable?: boolean
}
