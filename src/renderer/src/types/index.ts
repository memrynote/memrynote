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
  customIcon?: string      // Kullanıcının seçtiği ikon adı (lucide icon name)
  inheritedIcon?: string   // Parent'tan gelen ikon adı
}
