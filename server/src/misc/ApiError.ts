import { ZodIssueCode } from 'zod'

type ApiErrorCode =
  | 'user_not_found'
  | 'recipe_not_found'
  | 'duplicate_email'
  | 'invalid_login_credentials'
  | 'valid_auth_token_required'
  | 'invalid_password'
  | 'validate_email_token_expired'
  | 'password_reset_token_expired'
  | ZodIssueCode

/**
 * The JSON body of an unsuccessful request, with this shape:
 * ```json
 * {
 *   error: {
 *     code: ApiErrorCode
 *     message: string
 *   }
 * }
 * ```
 */
export class ApiError {
  readonly error: {
    readonly code: ApiErrorCode
    readonly message: string
  }

  constructor(code: ApiErrorCode, message: string) {
    this.error = {
      code,
      message,
    }
  }

  static userNotFound(userId: number | string): ApiError {
    return makeApiError('user_not_found', `User with id ${userId} not found.`)
  }

  static recipeNotFound(recipeId: number | string): ApiError {
    return makeApiError(
      'recipe_not_found',
      `Recipe with id ${recipeId} not found.`
    )
  }

  static duplicateEmail(): ApiError {
    return makeApiError('duplicate_email', 'This email is already registered.')
  }

  static invalidLoginCredentials(): ApiError {
    return makeApiError(
      'invalid_login_credentials',
      'The credentials are not valid.'
    )
  }

  static validAuthTokenRequired(): ApiError {
    return makeApiError(
      'valid_auth_token_required',
      "An 'Authorization' header containing 'Bearer ${token}' with a valid token is required."
    )
  }

  static invalidPassword(): ApiError {
    return makeApiError(
      'invalid_password',
      'The provided password is not valid.'
    )
  }

  static validateEmailTokenExpired(): ApiError {
    return makeApiError(
      'validate_email_token_expired',
      'The token has expired. Please log in and request a new validation email at the Settings page.'
    )
  }

  static passwordResetTokenExpired(): ApiError {
    return makeApiError(
      'password_reset_token_expired',
      'The token has expired. Please request a new password reset email at the Login page.'
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
