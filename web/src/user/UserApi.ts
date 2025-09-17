import { httpClient } from '../httpClient'
import type { AxiosResponse } from 'axios'
import type { PublicUser } from './User'

export function getUser(userId: number): Promise<PublicUser> {
  return httpClient
    .get(`/users/${userId}`)
    .then((response: AxiosResponse<{ user: PublicUser }>) => {
      return response.data.user
    })
}
