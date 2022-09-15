import {
  ApiError,
  extractApiError,
  httpClient,
  isApiError,
} from '../httpClient'
import { AxiosResponse } from 'axios'

export function changeEmail(
  newEmail: string,
  password: string
): Promise<void | ApiError> {
  return httpClient
    .post(`/my-account/email`, {
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
