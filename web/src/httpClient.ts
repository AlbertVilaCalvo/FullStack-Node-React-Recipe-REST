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

function isRecord(value: unknown): value is Record<string, unknown> {
  // Exclude null since typeof null === 'object' is true
  return typeof value === 'object' && value !== null
}

export function isApiError(arg: unknown): arg is ApiError {
  if (!isRecord(arg)) return false
  if (!isRecord(arg.error)) return false
  return (
    typeof arg.error.code === 'string' && typeof arg.error.message === 'string'
  )
}

/**
 * @param error the error of an axios request catch.
 */
export function extractApiError(error?: unknown): ApiError | undefined {
  if (!isRecord(error)) return undefined
  if (!isRecord(error.response)) return undefined
  if (isApiError(error.response.data)) {
    return error.response.data
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
  }
  if (isRecord(error) && typeof error.message === 'string') {
    return error.message
  }
  return String(error)
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
  if (!isRecord(error)) return false
  if (!isRecord(error.response)) return false
  return error.response.status === 404
}
