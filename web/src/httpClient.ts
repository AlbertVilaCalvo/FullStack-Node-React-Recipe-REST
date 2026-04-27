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
    requestConfig.headers = requestConfig.headers ?? {}
    requestConfig.headers.Authorization = 'Bearer ' + token
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
  return !!value && typeof value === 'object'
}

export function isApiError(arg: unknown): arg is ApiError {
  if (!isRecord(arg)) {
    return false
  }

  const error = arg.error
  if (!isRecord(error)) {
    return false
  }

  return typeof error.code === 'string' && typeof error.message === 'string'
}

/**
 * @param error the error of an axios request catch.
 */
export function extractApiError(error?: unknown): ApiError | undefined {
  if (!isRecord(error)) {
    return undefined
  }

  const response = error.response
  if (!isRecord(response)) {
    return undefined
  }

  if (isApiError(response.data)) {
    return response.data
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

  return 'Unexpected error'
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
  if (!isRecord(error)) {
    return false
  }

  const response = error.response
  return isRecord(response) && response.status === 404
}
