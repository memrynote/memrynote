import { ElectronAPI } from '@electron-toolkit/preload'

interface WindowAPI {
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: WindowAPI
  }
}
