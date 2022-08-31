import { ApiError, httpClient, isApiError, AnApiError } from '../httpClient'
import { AxiosResponse } from 'axios'
import { User } from '../user/User'

// What the API returns
type RegisterLoginResponseJson = {
  user: User
  auth_token: string
}

// What we use here on the client
type RegisterLoginResponse = {
  user: User
  authToken: string
}

export function registerNewUser(
  name: string,
  email: string,
  password: string
): Promise<RegisterLoginResponse | AnApiError<'duplicate_email' | string>> {
  return httpClient
    .post(`/auth/register`, {
      name,
      email,
      password,
    })
    .then((response: AxiosResponse<RegisterLoginResponseJson>) => {
      return { user: response.data.user, authToken: response.data.auth_token }
    })
    .catch((error) => {
      if (
        error.response &&
        error.response.data &&
        isApiError(error.response.data)
      ) {
        return error.response.data
      }
      throw error
    })
}

export function login(
  email: string,
  password: string
): Promise<
  RegisterLoginResponse | AnApiError<'invalid_login_credentials' | string>
> {
  return httpClient
    .post(`/auth/login`, {
      email,
      password,
    })
    .then((response: AxiosResponse<RegisterLoginResponseJson | ApiError>) => {
      if (isApiError(response.data)) {
        return response.data
      } else {
        return { user: response.data.user, authToken: response.data.auth_token }
      }
    })
}
