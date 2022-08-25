import { ApiError, httpClient, isAipError, AnApiError } from '../httpClient'
import { AxiosResponse } from 'axios'

export function registerNewUser(
  name: string,
  email: string,
  password: string
): Promise<{ userId: number } | AnApiError<'duplicate_email' | string>> {
  return httpClient
    .post(`/auth/register`, {
      name,
      email,
      password,
    })
    .then((response: AxiosResponse<{ id: number }>) => {
      return { userId: response.data.id }
    })
    .catch((error) => {
      if (
        error.response &&
        error.response.data &&
        isAipError(error.response.data)
      ) {
        return error.response.data
      }
      throw error
    })
}

export function login(
  email: string,
  password: string
): Promise<void | AnApiError<'invalid_login_credentials' | string>> {
  return httpClient
    .post(`/auth/login`, {
      email,
      password,
    })
    .then((response: AxiosResponse<void | ApiError>) => {
      return response.data
    })
}
