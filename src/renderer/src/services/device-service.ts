/**
 * T050e: Device Service for Renderer
 *
 * Provides device management operations in the renderer process.
 * Communicates with main process via IPC for actual operations.
 */

import type { Device, DevicePlatform } from '@shared/contracts/sync-api'
import type {
  SetupFirstDeviceRequest,
  SetupFirstDeviceResponse,
  GetDevicesResponse,
  RenameDeviceResponse,
  RevokeDeviceResponse
} from '@shared/contracts/ipc-sync'

export interface DeviceService {
  setupFirstDevice(params: SetupFirstDeviceRequest): Promise<SetupFirstDeviceResponse>
  getCurrentDevice(): Promise<Device | null>
  listDevices(): Promise<GetDevicesResponse>
  renameDevice(deviceId: string, newName: string): Promise<RenameDeviceResponse>
  revokeDevice(deviceId: string): Promise<RevokeDeviceResponse>
}

export const deviceService: DeviceService = {
  async setupFirstDevice(params: SetupFirstDeviceRequest): Promise<SetupFirstDeviceResponse> {
    return window.api.sync.setupFirstDevice(params)
  },

  async getCurrentDevice(): Promise<Device | null> {
    return window.api.sync.getCurrentDevice()
  },

  async listDevices(): Promise<GetDevicesResponse> {
    return window.api.sync.getDevices()
  },

  async renameDevice(deviceId: string, newName: string): Promise<RenameDeviceResponse> {
    return window.api.sync.renameDevice({ deviceId, newName })
  },

  async revokeDevice(deviceId: string): Promise<RevokeDeviceResponse> {
    return window.api.sync.revokeDevice({ deviceId })
  }
}

export type { Device, DevicePlatform }
