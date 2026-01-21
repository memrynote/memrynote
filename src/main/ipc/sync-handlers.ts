/**
 * Sync IPC handlers.
 * Handles all sync-related IPC communication from renderer.
 *
 * T050c: Device registration IPC
 * T050d: Persist device_id locally
 * T050f: Wire into setup flow
 *
 * @module ipc/sync-handlers
 */

import { ipcMain, BrowserWindow, app } from 'electron'
import os from 'node:os'
import { SyncChannels } from '@shared/contracts/ipc-sync'
import type {
  GetSyncStatusResponse,
  TriggerSyncResponse,
  GetDevicesResponse,
  CreateLinkingSessionResponse,
  ScanLinkingQRResponse,
  ApproveLinkingResponse,
  CompleteLinkingResponse,
  GetLinkingStatusResponse,
  RenameDeviceResponse,
  RevokeDeviceResponse,
  GetConflictsResponse,
  ResolveConflictResponse,
  SetupFirstDeviceResponse,
  SetupFirstDeviceRequest,
  VerifyRecoveryPhraseResponse
} from '@shared/contracts/ipc-sync'
import type { Device, UserPublic, SyncState, DevicePlatform } from '@shared/contracts/sync-api'
import {
  TriggerSyncRequestSchema,
  SetupFirstDeviceRequestSchema,
  VerifyRecoveryPhraseRequestSchema,
  ScanLinkingQRRequestSchema,
  RenameDeviceRequestSchema,
  RevokeDeviceRequestSchema,
  ResolveConflictRequestSchema
} from '@shared/contracts/ipc-sync'
import { createValidatedHandler, createHandler, createStringHandler } from './validate'
import { z } from 'zod'
import {
  generateDeviceSigningKeyPair,
  storeDeviceKeyPair,
  retrieveDeviceKeyPair,
  hasDeviceKeyPair,
  uint8ArrayToBase64,
  generateRecoveryPhrase,
  phraseToEntropy,
  deriveMasterKey,
  deriveAllKeys,
  generateSalt,
  storeKeyMaterial,
  secureZero,
  isCryptoError
} from '../crypto'

function emitSyncEvent(channel: string, data: unknown): void {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(channel, data)
  })
}

function createNotImplementedResponse(): { success: false; error: string } {
  return { success: false, error: 'Sync not yet implemented' }
}

function getDefaultSyncState(): SyncState {
  return {
    syncStatus: 'idle',
    pendingCount: 0,
    serverCursor: 0,
    deviceClock: {}
  }
}

export function registerSyncHandlers(): void {
  // ============================================================================
  // Status & Control
  // ============================================================================

  ipcMain.handle(
    SyncChannels.invoke.GET_SYNC_STATUS,
    createHandler(
      (): GetSyncStatusResponse => ({
        state: getDefaultSyncState(),
        isOnline: false
      })
    )
  )

  ipcMain.handle(
    SyncChannels.invoke.TRIGGER_SYNC,
    createValidatedHandler(
      TriggerSyncRequestSchema.optional(),
      (): TriggerSyncResponse => ({
        success: false,
        itemsSynced: 0,
        errors: ['Sync not yet implemented']
      })
    )
  )

  ipcMain.handle(
    SyncChannels.invoke.PAUSE_SYNC,
    createHandler(() => createNotImplementedResponse())
  )

  ipcMain.handle(
    SyncChannels.invoke.RESUME_SYNC,
    createHandler(() => createNotImplementedResponse())
  )

  ipcMain.handle(
    SyncChannels.invoke.GET_SYNC_HISTORY,
    createHandler(() => ({ history: [] }))
  )

  ipcMain.handle(
    SyncChannels.invoke.CLEAR_SYNC_QUEUE,
    createHandler(() => createNotImplementedResponse())
  )

  // ============================================================================
  // First Device Setup (T050c, T050d, T050f)
  // ============================================================================

  ipcMain.handle(
    SyncChannels.invoke.SETUP_FIRST_DEVICE,
    createValidatedHandler(
      SetupFirstDeviceRequestSchema,
      async (input: SetupFirstDeviceRequest): Promise<SetupFirstDeviceResponse> => {
        let entropy: Uint8Array | null = null
        let masterKey: Uint8Array | null = null
        let derivedKeys: Awaited<ReturnType<typeof deriveAllKeys>> | null = null

        try {
          const recoveryPhrase = generateRecoveryPhrase()

          entropy = phraseToEntropy(recoveryPhrase)
          const kdfSaltBuffer = await generateSalt()
          masterKey = deriveMasterKey(entropy, kdfSaltBuffer)
          derivedKeys = await deriveAllKeys(masterKey)

          const deviceId = crypto.randomUUID()
          const deviceKeyPair = await generateDeviceSigningKeyPair(deviceId)

          await storeDeviceKeyPair(deviceKeyPair)

          await storeKeyMaterial({
            masterKey: uint8ArrayToBase64(masterKey),
            deviceSigningKey: uint8ArrayToBase64(deviceKeyPair.privateKey),
            devicePublicKey: uint8ArrayToBase64(deviceKeyPair.publicKey),
            deviceId,
            userId: ''
          })

          const authPublicKey = uint8ArrayToBase64(deviceKeyPair.publicKey)
          const now = Date.now()

          const device: Device = {
            id: deviceId,
            name: input.deviceName,
            platform: input.platform as DevicePlatform,
            osVersion: input.osVersion,
            appVersion: input.appVersion,
            authPublicKey,
            linkedAt: now,
            isCurrentDevice: true
          }

          const user: UserPublic = {
            id: '',
            email: '',
            emailVerified: false,
            authMethod: 'email',
            storageUsed: 0,
            storageLimit: 1024 * 1024 * 1024,
            createdAt: now,
            updatedAt: now
          }

          return {
            recoveryPhrase,
            device,
            user
          }
        } catch (error) {
          console.error('[Sync] SETUP_FIRST_DEVICE error:', error)
          const message = isCryptoError(error) ? error.message : 'First device setup failed'
          throw new Error(message)
        } finally {
          if (entropy) await secureZero(entropy)
          if (masterKey) await secureZero(masterKey)
          if (derivedKeys) {
            await secureZero(derivedKeys.vaultKey)
            await secureZero(derivedKeys.signingKeyPair.publicKey)
            await secureZero(derivedKeys.signingKeyPair.privateKey)
            await secureZero(derivedKeys.verifyKey)
          }
        }
      }
    )
  )

  ipcMain.handle(
    SyncChannels.invoke.VERIFY_RECOVERY_PHRASE,
    createValidatedHandler(
      VerifyRecoveryPhraseRequestSchema,
      (): VerifyRecoveryPhraseResponse => ({ valid: false, error: 'Not implemented' })
    )
  )

  ipcMain.handle(
    SyncChannels.invoke.GET_RECOVERY_PHRASE,
    createHandler(() => ({ phrase: [] as string[] }))
  )

  // ============================================================================
  // Device Linking
  // ============================================================================

  ipcMain.handle(
    SyncChannels.invoke.CREATE_LINKING_SESSION,
    createHandler(
      (): CreateLinkingSessionResponse => ({
        sessionId: '',
        qrCodeDataUrl: '',
        expiresAt: 0
      })
    )
  )

  ipcMain.handle(
    SyncChannels.invoke.SCAN_LINKING_QR,
    createValidatedHandler(
      ScanLinkingQRRequestSchema,
      (): ScanLinkingQRResponse => createNotImplementedResponse()
    )
  )

  ipcMain.handle(
    SyncChannels.invoke.APPROVE_LINKING,
    createValidatedHandler(
      z.object({ sessionId: z.string().uuid() }),
      (): ApproveLinkingResponse => createNotImplementedResponse()
    )
  )

  ipcMain.handle(
    SyncChannels.invoke.COMPLETE_LINKING,
    createValidatedHandler(
      z.object({ sessionId: z.string().uuid() }),
      (): CompleteLinkingResponse => createNotImplementedResponse()
    )
  )

  ipcMain.handle(
    SyncChannels.invoke.CANCEL_LINKING,
    createStringHandler(() => createNotImplementedResponse())
  )

  ipcMain.handle(
    SyncChannels.invoke.GET_LINKING_STATUS,
    createValidatedHandler(
      z.object({ sessionId: z.string().uuid() }),
      (): GetLinkingStatusResponse => ({ session: null })
    )
  )

  // ============================================================================
  // Device Management
  // ============================================================================

  ipcMain.handle(
    SyncChannels.invoke.GET_DEVICES,
    createHandler(
      (): GetDevicesResponse => ({
        devices: [],
        currentDeviceId: ''
      })
    )
  )

  ipcMain.handle(
    SyncChannels.invoke.GET_CURRENT_DEVICE,
    createHandler(async (): Promise<Device | null> => {
      try {
        const hasKeys = await hasDeviceKeyPair()
        if (!hasKeys) {
          return null
        }

        const keyPair = await retrieveDeviceKeyPair()
        if (!keyPair) {
          return null
        }

        const platform = os.platform()
        const devicePlatform: DevicePlatform =
          platform === 'darwin' ? 'macos' : platform === 'win32' ? 'windows' : 'linux'

        return {
          id: keyPair.deviceId,
          name: os.hostname(),
          platform: devicePlatform,
          osVersion: os.release(),
          appVersion: app.getVersion(),
          authPublicKey: uint8ArrayToBase64(keyPair.publicKey),
          linkedAt: Date.now(),
          isCurrentDevice: true
        }
      } catch (error) {
        console.error('[Sync] GET_CURRENT_DEVICE error:', error)
        return null
      }
    })
  )

  ipcMain.handle(
    SyncChannels.invoke.RENAME_DEVICE,
    createValidatedHandler(
      RenameDeviceRequestSchema,
      (): RenameDeviceResponse => createNotImplementedResponse()
    )
  )

  ipcMain.handle(
    SyncChannels.invoke.REVOKE_DEVICE,
    createValidatedHandler(
      RevokeDeviceRequestSchema,
      (): RevokeDeviceResponse => createNotImplementedResponse()
    )
  )

  // ============================================================================
  // User Account
  // ============================================================================

  ipcMain.handle(
    SyncChannels.invoke.GET_USER,
    createHandler((): UserPublic | null => null)
  )

  ipcMain.handle(
    SyncChannels.invoke.DELETE_ACCOUNT,
    createHandler(() => createNotImplementedResponse())
  )

  // ============================================================================
  // Conflict Resolution
  // ============================================================================

  ipcMain.handle(
    SyncChannels.invoke.GET_CONFLICTS,
    createHandler((): GetConflictsResponse => ({ conflicts: [] }))
  )

  ipcMain.handle(
    SyncChannels.invoke.RESOLVE_CONFLICT,
    createValidatedHandler(
      ResolveConflictRequestSchema,
      (): ResolveConflictResponse => createNotImplementedResponse()
    )
  )

  console.log('[IPC] Sync handlers registered')
}

export function unregisterSyncHandlers(): void {
  Object.values(SyncChannels.invoke).forEach((channel) => {
    ipcMain.removeHandler(channel)
  })
  console.log('[IPC] Sync handlers unregistered')
}

// Exported for use by sync engine (T074+) to emit events to renderer
export { emitSyncEvent }
