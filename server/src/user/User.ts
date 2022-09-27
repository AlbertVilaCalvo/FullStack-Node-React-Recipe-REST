import { z } from 'zod'
import { pick } from '../misc/util'

export type User = {
  readonly id: number
  email: string
  /** The hashed password. */
  password: string
  name: string
  email_verified: boolean
}

export type UserNoPassword = Omit<User, 'password'>

export function removePassword(user: User): UserNoPassword {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user
  return rest
}

export type PublicUser = Pick<User, 'id' | 'name'>

export function toPublicUser(user: User): PublicUser {
  return pick(user, ['id', 'name'])
}

// Validation

export const USER_NAME_MIN_LENGTH = 1
export const USER_NAME_MAX_LENGTH = 100
export const PASSWORD_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 60
export const EMAIL_MAX_LENGTH = 254

export const UserNameSchema = z.object({
  name: z.string().min(USER_NAME_MIN_LENGTH).max(USER_NAME_MAX_LENGTH),
})

export const PlainPasswordSchema = z.object({
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
})

export const NewPlainPasswordSchema = z.object({
  new_password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
})

export const EmailSchema = z.object({
  email: z.string().email().max(EMAIL_MAX_LENGTH),
})

// Helper functions

/**
 * For the Location header. Returns the relative URL of the user at the
 * frontend website.
 */
export function userFrontendUrl(userId: number): string {
  return `/users/${userId}`
}
