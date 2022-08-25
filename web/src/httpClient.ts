import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:5000/api'
axios.defaults.timeout = 10000

export const httpClient = axios.create()

export type ApiError = {
  error: {
    code: string
    message: string
  }
}

export function isAipError(arg: any): arg is ApiError {
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
 * Use it to set a specific ApiError like 'duplicate_email'.
 */
export type AnApiError<ErrorCode extends string> = {
  error: {
    code: ErrorCode
    message: string
  }
}
