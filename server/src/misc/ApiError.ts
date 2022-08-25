type ApiErrorCode =
  | 'name_required'
  | 'email_required'
  | 'password_required'
  | 'duplicate_email'
  | 'invalid_login_credentials'

export class ApiError {
  error: {
    code: ApiErrorCode
    message: string
  }

  constructor(error: { code: ApiErrorCode; message: string }) {
    this.error = error
  }

  static nameRequired(): ApiError {
    return makeApiError('name_required', 'The name field is required')
  }

  static emailRequired(): ApiError {
    return makeApiError('email_required', 'The email field is required')
  }

  static passwordRequired(): ApiError {
    return makeApiError('password_required', 'The password field is required')
  }

  static duplicateEmail(): ApiError {
    return makeApiError('duplicate_email', 'This email is already registered')
  }

  static invalidLoginCredentials(): ApiError {
    return makeApiError(
      'invalid_login_credentials',
      'The credentials are not valid'
    )
  }
}

function makeApiError(code: ApiErrorCode, message: string): ApiError {
  return {
    error: {
      code,
      message,
    },
  }
}
