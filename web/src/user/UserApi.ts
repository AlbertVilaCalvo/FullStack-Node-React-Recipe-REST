import { httpClient } from '../httpClient'
import { AxiosResponse } from 'axios'
import { PublicUser } from './User'

export function getUser(userId: number): Promise<PublicUser> {
  return httpClient
    .get(`/users/${userId}`)
    .then((response: AxiosResponse<{ user: PublicUser }>) => {
      return response.data.user
    })
}

export function updateUserProfile(name: string): Promise<void> {
  return httpClient
    .put(`/me/profile`, {
      name,
    })
    .then((response: AxiosResponse<void>) => {
      return response.data
    })
}
