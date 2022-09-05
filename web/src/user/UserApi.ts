import { httpClient } from '../httpClient'
import { AxiosResponse } from 'axios'

export function updateUserProfile(name: string): Promise<void> {
  return httpClient
    .put(`/me/profile`, {
      name,
    })
    .then((response: AxiosResponse<void>) => {
      return response.data
    })
}
