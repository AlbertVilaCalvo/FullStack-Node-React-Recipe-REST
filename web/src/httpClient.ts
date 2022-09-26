import axios from 'axios'
import { userStore } from './user/userStore'

axios.defaults.baseURL = 'http://localhost:5000/api'
axios.defaults.timeout = 10_000
axios.defaults.headers.common['Content-Type'] = 'application/json'

export const httpClient = axios.create()

httpClient.interceptors.request.use((requestConfig) => {
  const token = userStore.authToken
  if (token) {
    // @ts-ignore
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

export function isApiError(arg: any): arg is ApiError {
  return (
    !!arg && // This is necessary because typeof null === 'object' is true
    typeof arg === 'object' &&
    arg.error &&
    arg.error.code &&
    typeof arg.error.code === 'string' &&
    arg.error.message &&
    typeof arg.error.message === 'string'
  )
}

/**
 * @param error the error of an axios request catch.
 */
export function extractApiError(error?: any): ApiError | undefined {
  if (
    error &&
    error.response &&
    error.response.data &&
    isApiError(error.response.data)
  ) {
    return error.response.data
  }
  return undefined
}

/**
 * @param error the error of an axios request catch.
 */
export function extractApiErrorMessage(error?: any): string {
  const apiError = extractApiError(error)
  if (apiError) {
    return apiError.error.message
  } else {
    return error.message
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
export function is404NotFound(error?: any): boolean {
  return error && error.response && error.response.status === 404
}
