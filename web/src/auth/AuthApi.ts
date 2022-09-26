import {
  ApiError,
  httpClient,
  isApiError,
  AnApiError,
  extractApiError,
} from '../httpClient'
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
      const apiError = extractApiError(error)
      if (apiError) {
        return apiError
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

export function sendEmailVerificationEmail() {
  return httpClient.post<void>(`/auth/verify-email/send`)
}

type VerifyEmailData = { verify_email_token: string }
type VerifyEmailResponse = void | AnApiError<'validate_email_token_expired'>

export function verifyEmail(
  verifyEmailToken: string
): Promise<VerifyEmailResponse> {
  return httpClient
    .post<
      VerifyEmailResponse,
      AxiosResponse<VerifyEmailResponse, VerifyEmailData>,
      VerifyEmailData
    >(`/auth/verify-email`, {
      verify_email_token: verifyEmailToken,
    })
    .then((response: AxiosResponse<VerifyEmailResponse>) => {
      return response.data
    })
}
