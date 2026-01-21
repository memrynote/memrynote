/**
 * Auth IPC handlers.
 * Handles OTP, OAuth, and session management IPC communication.
 *
 * T054: Request OTP handler
 * T055: Verify OTP handler
 * T056: Resend OTP handler
 * T056a: OTP clipboard detection
 *
 * @module ipc/auth-handlers
 */

import { ipcMain, clipboard } from 'electron'
import { AuthChannels } from '@shared/contracts/ipc-sync'
import type {
  RequestOtpResponse,
  VerifyOtpResponse,
  ResendOtpResponse,
  DetectOtpClipboardResponse
} from '@shared/contracts/ipc-sync'
import {
  RequestOtpRequestSchema,
  VerifyOtpRequestSchema,
  ResendOtpRequestSchema
} from '@shared/contracts/ipc-sync'
import { createValidatedHandler, createHandler } from './validate'
import { getSyncApiClient, isSyncApiError } from '../sync/api-client'
import { storeAuthTokens, retrieveAuthTokens } from '../crypto/keychain'

export function registerAuthHandlers(): void {
  // ==========================================================================
  // T054: Request OTP Handler
  // ==========================================================================
  ipcMain.handle(
    AuthChannels.invoke.REQUEST_OTP,
    createValidatedHandler(
      RequestOtpRequestSchema,
      async ({ email }): Promise<RequestOtpResponse> => {
        try {
          const client = getSyncApiClient()
          const response = await client.requestOtp(email)
          return {
            success: response.success,
            expiresAt: response.expiresAt
          }
        } catch (error) {
          console.error('[Auth] REQUEST_OTP error:', error)
          const message = isSyncApiError(error)
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Failed to request OTP'
          return { success: false, expiresAt: 0, error: message }
        }
      }
    )
  )

  // ==========================================================================
  // T055: Verify OTP Handler
  // ==========================================================================
  ipcMain.handle(
    AuthChannels.invoke.VERIFY_OTP,
    createValidatedHandler(
      VerifyOtpRequestSchema,
      async ({ email, code }): Promise<VerifyOtpResponse> => {
        try {
          const client = getSyncApiClient()
          const response = await client.verifyOtp(email, code)

          await storeAuthTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            userId: response.user.id,
            email: response.user.email
          })

          const needsSetup = !response.user.emailVerified || response.device === undefined

          return {
            success: true,
            isNewUser: needsSetup,
            needsSetup
          }
        } catch (error) {
          console.error('[Auth] VERIFY_OTP error:', error)
          const message = isSyncApiError(error)
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Failed to verify OTP'
          return { success: false, error: message }
        }
      }
    )
  )

  // ==========================================================================
  // T056: Resend OTP Handler
  // ==========================================================================
  ipcMain.handle(
    AuthChannels.invoke.RESEND_OTP,
    createValidatedHandler(
      ResendOtpRequestSchema,
      async ({ email }): Promise<ResendOtpResponse> => {
        try {
          const client = getSyncApiClient()
          const response = await client.resendOtp(email)
          return {
            success: response.success,
            expiresAt: response.expiresAt
          }
        } catch (error) {
          console.error('[Auth] RESEND_OTP error:', error)
          const message = isSyncApiError(error)
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Failed to resend OTP'
          return { success: false, expiresAt: 0, error: message }
        }
      }
    )
  )

  // ==========================================================================
  // T056a: OTP Clipboard Detection Handler
  // ==========================================================================
  ipcMain.handle(
    AuthChannels.invoke.DETECT_OTP_CLIPBOARD,
    createHandler((): DetectOtpClipboardResponse => {
      const clipboardText = clipboard.readText().trim()
      if (/^\d{6}$/.test(clipboardText)) {
        return { code: clipboardText }
      }
      return { code: null }
    })
  )

  // ==========================================================================
  // Session Management (Stub handlers for now)
  // ==========================================================================
  ipcMain.handle(
    AuthChannels.invoke.GET_SESSION,
    createHandler(async () => {
      const tokens = await retrieveAuthTokens()
      if (!tokens) {
        return { isAuthenticated: false }
      }
      return {
        isAuthenticated: true,
        user: {
          id: tokens.userId,
          email: tokens.email
        }
      }
    })
  )

  ipcMain.handle(
    AuthChannels.invoke.GET_ACCESS_TOKEN,
    createHandler(async () => {
      const tokens = await retrieveAuthTokens()
      return tokens?.accessToken ?? null
    })
  )

  ipcMain.handle(
    AuthChannels.invoke.GET_REFRESH_TOKEN,
    createHandler(async () => {
      const tokens = await retrieveAuthTokens()
      return tokens?.refreshToken ?? null
    })
  )

  console.log('[IPC] Auth handlers registered')
}

export function unregisterAuthHandlers(): void {
  Object.values(AuthChannels.invoke).forEach((channel) => {
    ipcMain.removeHandler(channel)
  })
  console.log('[IPC] Auth handlers unregistered')
}
