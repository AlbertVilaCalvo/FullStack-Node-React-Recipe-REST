type ApiErrorCode =
  | 'user_not_found'
  | 'recipe_not_found'
  | 'title_required'
  | 'cooking_time_minutes_required'
  | 'name_required'
  | 'email_required'
  | 'password_required'
  | 'duplicate_email'
  | 'invalid_login_credentials'
  | 'valid_auth_token_required'

export class ApiError {
  readonly error: {
    readonly code: ApiErrorCode
    readonly message: string
  }

  constructor(error: { code: ApiErrorCode; message: string }) {
    this.error = error
  }

  static userNotFound(userId: number): ApiError {
    return makeApiError('user_not_found', `User with id ${userId} not found`)
  }

  static recipeNotFound(recipeId: number): ApiError {
    return makeApiError(
      'recipe_not_found',
      `Recipe with id ${recipeId} not found`
    )
  }

  static titleRequired(): ApiError {
    return makeApiError(
      'title_required',
      "The required field 'title' is missing"
    )
  }

  static cookingTimeRequired(): ApiError {
    return makeApiError(
      'cooking_time_minutes_required',
      "The required field 'cooking_time_minutes' is missing"
    )
  }

  static nameRequired(): ApiError {
    return makeApiError('name_required', "The required field 'name' is missing")
  }

  static emailRequired(): ApiError {
    return makeApiError(
      'email_required',
      "The required field 'email' is missing"
    )
  }

  static passwordRequired(): ApiError {
    return makeApiError(
      'password_required',
      "The required field 'password' is missing"
    )
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

  static validAuthTokenRequired(): ApiError {
    return makeApiError(
      'valid_auth_token_required',
      "An 'Authorization' header containing 'Bearer ${token}' with a valid token is required"
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
