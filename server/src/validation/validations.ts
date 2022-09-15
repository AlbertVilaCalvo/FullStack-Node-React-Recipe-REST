import {
  SafeParseError,
  SafeParseReturnType,
  SafeParseSuccess,
  ZodError,
} from 'zod'
import { ApiError } from '../misc/ApiError'

export const USER_NAME_MAX_LENGTH = 100
export const PASSWORD_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 60
export const EMAIL_MAX_LENGTH = 254

export function isValidId(id: number): boolean {
  return !isNaN(id) && id > 0
}

// Type definitions for safeParse return types are here:
// https://github.com/colinhacks/zod/blob/3b75ae584e31d8bd06f7298247cd3d27520cf881/src/types.ts#L127-L132
/**
 * Use it to discriminate the result of `safeParse` between success or error.
 */
export function isValidData<Input, Output>(
  arg: SafeParseReturnType<Input, Output>
): arg is SafeParseSuccess<Output> {
  return arg.success
}

/**
 * Use it to discriminate the result of `safeParse` between success or error.
 */
export function invalidData<Input, Output>(
  arg: SafeParseReturnType<Input, Output>
): arg is SafeParseError<Input> {
  return !arg.success
}

export function toApiError(zodError: ZodError): ApiError {
  const firstIssue = zodError.issues[0]
  const code = firstIssue.code
  const message = `${firstIssue.path[0]} - ${firstIssue.message}`
  return new ApiError(code, message)
}
