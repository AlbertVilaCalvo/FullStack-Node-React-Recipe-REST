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
    // @ts-expect-error Adding custom header
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
  const a = arg as
    | { error?: { code?: unknown; message?: unknown } }
    | undefined
    | null
  return (
    !!a && // This is necessary because typeof null === 'object' is true
    typeof a === 'object' &&
    !!a.error &&
    !!a.error.code &&
    typeof a.error.code === 'string' &&
    !!a.error.message &&
    typeof a.error.message === 'string'
  )
}

/**
 * @param error the error of an axios request catch.
 */
export function extractApiError(error?: unknown): ApiError | undefined {
  const e = error as { response?: { data?: unknown } } | undefined | null
  if (e && e.response && e.response.data && isApiError(e.response.data)) {
    return e.response.data
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
  } else {
    const e = error as { message?: string } | undefined | null
    return e?.message ?? 'Unknown error'
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
  const e = error as { response?: { status?: unknown } } | undefined | null
  return !!e && !!e.response && e.response.status === 404
}
