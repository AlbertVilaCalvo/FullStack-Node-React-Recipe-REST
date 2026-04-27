import axios from 'axios'
import { userStore } from './user/userStore'

if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error(`Missing required environment variable VITE_API_BASE_URL`)
}

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
axios.defaults.timeout = 10_000
axios.defaults.headers.common['Content-Type'] = 'application/json'

export const httpClient = axios.create()

httpClient.interceptors.request.use((requestConfig) => {
  const token = userStore.authToken
  if (token) {
    // @ts-expect-error -- axios headers type does not include string index signature
    requestConfig.headers['Authorization'] = 'Bearer ' + token
  }
  return requestConfig
})

// ApiError

export type ApiError = {
  error: {
    code: string
    message: string
  }
}

export function isApiError(arg: unknown): arg is ApiError {
  if (!arg || typeof arg !== 'object') return false
  const obj = arg as Record<string, unknown>
  if (!obj['error'] || typeof obj['error'] !== 'object') return false
  const err = obj['error'] as Record<string, unknown>
  return typeof err['code'] === 'string' && typeof err['message'] === 'string'
}

/**
 * @param error the error of an axios request catch.
 */
export function extractApiError(error?: unknown): ApiError | undefined {
  if (!error || typeof error !== 'object') return undefined
  const err = error as Record<string, unknown>
  if (!err['response'] || typeof err['response'] !== 'object') return undefined
  const response = err['response'] as Record<string, unknown>
  if (isApiError(response['data'])) {
    return response['data']
  }
  return undefined
}

/**
 * @param error the error of an axios request catch.
 */
export function extractApiErrorMessage(error?: unknown): string {
  const apiError = extractApiError(error)
  if (apiError) {
    return apiError.error.message
  } else if (error instanceof Error) {
    return error.message
  } else {
    return String(error)
  }
}

/**
 * Use it to set a specific ApiError like 'duplicate_email'.
 */
export type AnApiError<ErrorCode extends string> = {
  error: {
    code: ErrorCode
    message: string
  }
}

// Utils

/**
 * @param error the error of an axios request catch.
 */
export function is404NotFound(error?: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const err = error as Record<string, unknown>
  if (!err['response'] || typeof err['response'] !== 'object') return false
  const response = err['response'] as Record<string, unknown>
  return response['status'] === 404
}
