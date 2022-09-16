import { User } from './User'
import { checkIfPasswordsMatch } from '../auth/password'
import * as UserDatabase from '../user/UserDatabase'
import { isError } from '../misc/result'

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
