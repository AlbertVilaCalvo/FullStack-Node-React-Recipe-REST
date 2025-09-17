import { extractApiError, httpClient, isApiError } from '../httpClient'
import type { ApiError } from '../httpClient'
import type { AxiosResponse } from 'axios'

export function updateProfile(name: string) {
  return httpClient.put<void>(`/my-account/profile`, {
    name,
  })
}

export function updateEmail(
  newEmail: string,
  password: string
): Promise<void | ApiError> {
  return httpClient
    .put(`/my-account/email`, {
      new_email: newEmail,
      password,
    })
    .then((response: AxiosResponse<void | ApiError>) => {
      if (isApiError(response.data)) {
        return response.data
      }
    })
    .catch((error) => {
      const apiError = extractApiError(error)
      if (apiError) {
        return apiError
      }
      throw error
    })
}

export function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<void | ApiError> {
  return httpClient
    .put(`/my-account/password`, {
      current_password: currentPassword,
      new_password: newPassword,
    })
    .then((response: AxiosResponse<void | ApiError>) => {
      if (isApiError(response.data)) {
        return response.data
      }
    })
    .catch((error) => {
      const apiError = extractApiError(error)
      if (apiError) {
        return apiError
      }
      throw error
    })
}

export function deleteAccount(password: string): Promise<void | ApiError> {
  return httpClient
    .post(`/my-account/delete`, {
      password: password,
    })
    .then((response: AxiosResponse<void | ApiError>) => {
      if (isApiError(response.data)) {
        return response.data
      }
    })
    .catch((error) => {
      const apiError = extractApiError(error)
      if (apiError) {
        return apiError
      }
      throw error
    })
}
