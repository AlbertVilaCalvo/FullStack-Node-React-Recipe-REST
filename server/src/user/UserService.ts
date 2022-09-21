import { PublicUser, removeEmailPassword, User } from './User'
import {
  checkIfPasswordsMatch,
  hashPassword,
  validatePassword,
} from '../auth/password'
import * as UserDatabase from '../user/UserDatabase'
import { isError } from '../misc/result'

export async function getUserById(
  userId: number
): Promise<PublicUser | 'user-not-found' | 'unrecoverable-error'> {
  const getUserResult = await UserDatabase.getUserById(userId)
  if (isError(getUserResult)) {
    return 'unrecoverable-error'
  } else if (getUserResult === 'user-not-found') {
    return 'user-not-found'
  } else {
    const publicUser: PublicUser = removeEmailPassword(getUserResult)
    return publicUser
  }
}

/**
 * @param user the user to whom we want the change the email
 * @param plainPassword the plain text password (from the request body)
 * @param newEmail the new email (from the request body)
 */
export async function updateUserEmail(
  user: User,
  plainPassword: string,
  newEmail: string
): Promise<
  'success' | 'invalid-password' | 'user-not-found' | 'unrecoverable-error'
> {
  let passwordsMatch: boolean
  try {
    passwordsMatch = await checkIfPasswordsMatch(plainPassword, user.password)
  } catch (error) {
    return 'unrecoverable-error'
  }

  if (!passwordsMatch) {
    return 'invalid-password'
  }

  const updateEmailResult = await UserDatabase.updateUserEmail(
    user.id,
    newEmail
  )

  if (updateEmailResult === 'user-not-found') {
    return 'user-not-found'
  } else if (isError(updateEmailResult)) {
    return 'unrecoverable-error'
  } else {
    return 'success'
  }
}

/**
 * @param user the user to whom we want the change the password
 * @param currentPassword the current plain text password (from the request body)
 * @param newPassword the new plain text password (from the request body)
 */
export async function updateUserPassword(
  user: User,
  currentPassword: string,
  newPassword: string
): Promise<
  'success' | 'invalid-password' | 'user-not-found' | 'unrecoverable-error'
> {
  let passwordsMatch: boolean
  try {
    passwordsMatch = await checkIfPasswordsMatch(currentPassword, user.password)
  } catch (error) {
    return 'unrecoverable-error'
  }

  if (!passwordsMatch) {
    return 'invalid-password'
  }

  let newPasswordHash: string
  try {
    newPasswordHash = await hashPassword(newPassword)
  } catch (error) {
    return 'unrecoverable-error'
  }

  const updateEmailResult = await UserDatabase.updateUserPassword(
    user.id,
    newPasswordHash
  )

  if (updateEmailResult === 'user-not-found') {
    return 'user-not-found'
  } else if (isError(updateEmailResult)) {
    return 'unrecoverable-error'
  } else {
    return 'success'
  }
}

/**
 * @param user the user we want to delete
 * @param plainPassword the plain text password (from the request body)
 */
export async function deleteUser(
  user: User,
  plainPassword: string
): Promise<
  'success' | 'invalid-password' | 'user-not-found' | 'unrecoverable-error'
> {
  const validatePasswordResult = await validatePassword(
    plainPassword,
    user.password
  )
  if (validatePasswordResult === 'invalid-password') {
    return 'invalid-password'
  } else if (isError(validatePasswordResult)) {
    return 'unrecoverable-error'
  }

  const deleteUserResult = await UserDatabase.deleteUser(user.id)

  if (deleteUserResult === 'user-not-found') {
    return 'user-not-found'
  } else if (isError(deleteUserResult)) {
    return 'unrecoverable-error'
  } else {
    return 'success'
  }
}
