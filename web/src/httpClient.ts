import axios from 'axios'
import { userStore } from './user/userStore'

axios.defaults.baseURL = 'http://localhost:5000/api'
axios.defaults.timeout = 10_000

export const httpClient = axios.create()

httpClient.interceptors.request.use((requestConfig) => {
  const token = userStore.authToken
  if (token) {
    // @ts-ignore
    requestConfig.headers['Authorization'] = 'Bearer ' + token
  }
  return requestConfig
})

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
 * Use it to set a specific ApiError like 'duplicate_email'.
 */
export type AnApiError<ErrorCode extends string> = {
  error: {
    code: ErrorCode
    message: string
  }
}
