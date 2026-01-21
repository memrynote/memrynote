/**
 * Sync Server API Client
 *
 * HTTP client for communicating with the sync server.
 * Handles authentication, token refresh, and all sync-related API calls.
 *
 * @module sync/api-client
 */

import type {
  OtpRequest,
  OtpRequestResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  OtpResendRequest,
  OtpResendResponse,
  FirstDeviceSetupRequest,
  FirstDeviceSetupResponse,
  DeviceRegisterRequest,
  DeviceRegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RecoveryInfoResponse
} from '@shared/contracts/auth-api'

export class SyncApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'SyncApiError'
  }
}

function getSyncServerUrl(): string {
  return process.env.SYNC_SERVER_URL || 'http://localhost:8787'
}

interface ErrorBody {
  error?: string
  message?: string
  code?: string
}

function isErrorBody(value: unknown): value is ErrorBody {
  return typeof value === 'object' && value !== null
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`
    let errorCode: string | undefined
    try {
      const errorBody: unknown = await response.json()
      if (isErrorBody(errorBody)) {
        errorMessage = errorBody.error ?? errorBody.message ?? errorMessage
        errorCode = errorBody.code
      }
    } catch {
      errorMessage = response.statusText || errorMessage
    }
    throw new SyncApiError(errorMessage, response.status, errorCode)
  }
  return response.json() as Promise<T>
}

export interface SyncApiClient {
  requestOtp(email: string): Promise<OtpRequestResponse>
  verifyOtp(email: string, code: string): Promise<OtpVerifyResponse>
  resendOtp(email: string): Promise<OtpResendResponse>
  setupFirstDevice(
    token: string,
    request: FirstDeviceSetupRequest
  ): Promise<FirstDeviceSetupResponse>
  registerDevice(token: string, request: DeviceRegisterRequest): Promise<DeviceRegisterResponse>
  refreshToken(refreshToken: string): Promise<RefreshTokenResponse>
  getRecoveryInfo(token: string): Promise<RecoveryInfoResponse>
}

let clientInstance: SyncApiClient | null = null

function createApiClient(): SyncApiClient {
  const baseUrl = getSyncServerUrl()

  return {
    async requestOtp(email: string): Promise<OtpRequestResponse> {
      const request: OtpRequest = { email }
      const response = await fetch(`${baseUrl}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      return handleResponse<OtpRequestResponse>(response)
    },

    async verifyOtp(email: string, code: string): Promise<OtpVerifyResponse> {
      const request: OtpVerifyRequest = { email, code }
      const response = await fetch(`${baseUrl}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      return handleResponse<OtpVerifyResponse>(response)
    },

    async resendOtp(email: string): Promise<OtpResendResponse> {
      const request: OtpResendRequest = { email }
      const response = await fetch(`${baseUrl}/auth/otp/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      return handleResponse<OtpResendResponse>(response)
    },

    async setupFirstDevice(
      token: string,
      request: FirstDeviceSetupRequest
    ): Promise<FirstDeviceSetupResponse> {
      const response = await fetch(`${baseUrl}/auth/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(request)
      })
      return handleResponse<FirstDeviceSetupResponse>(response)
    },

    async registerDevice(
      token: string,
      request: DeviceRegisterRequest
    ): Promise<DeviceRegisterResponse> {
      const response = await fetch(`${baseUrl}/auth/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(request)
      })
      return handleResponse<DeviceRegisterResponse>(response)
    },

    async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
      const request: RefreshTokenRequest = { refreshToken }
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      return handleResponse<RefreshTokenResponse>(response)
    },

    async getRecoveryInfo(token: string): Promise<RecoveryInfoResponse> {
      const response = await fetch(`${baseUrl}/auth/recovery`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return handleResponse<RecoveryInfoResponse>(response)
    }
  }
}

export function getSyncApiClient(): SyncApiClient {
  if (!clientInstance) {
    clientInstance = createApiClient()
  }
  return clientInstance
}

export function isSyncApiError(error: unknown): error is SyncApiError {
  return error instanceof SyncApiError
}
