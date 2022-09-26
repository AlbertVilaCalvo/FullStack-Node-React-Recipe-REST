import { checkIfPasswordsMatch, hashPassword } from './password'
import * as UserDatabase from '../user/UserDatabase'
import { isError } from '../misc/result'
import { removePassword, User, UserNoPassword } from '../user/User'
import { generateAuthToken } from './authtoken'
import { sendLoginEmail } from '../misc/email'

/**
 * @param name user full name (from the request body)
 * @param email user email (from the request body)
 * @param password user plain text password (from the request body)
 */
export async function register(
  name: string,
  email: string,
  password: string
): Promise<
  | { user: UserNoPassword; authToken: string }
  | 'unrecoverable-error'
  | 'duplicate-email'
> {
  let passwordHash: string
  try {
    passwordHash = await hashPassword(password)
  } catch (error) {
    return 'unrecoverable-error'
  }

  const insertUserResult = await UserDatabase.insertNewUser(
    name,
    email,
    passwordHash
  )

  if (isError(insertUserResult)) {
    return 'unrecoverable-error'
  } else if (insertUserResult === 'duplicate-email-error') {
    return 'duplicate-email'
  }

  const user: User = insertUserResult
  const generateAuthTokenResult = generateAuthToken(user.id)

  if (isError(generateAuthTokenResult)) {
    return 'unrecoverable-error'
  }

  return {
    user: removePassword(user),
    authToken: generateAuthTokenResult,
  }
}

/**
 * @param email user email (from the request body)
 * @param password user plain text password (from the request body)
 */
export async function login(
  email: string,
  password: string
): Promise<
  | { user: UserNoPassword; authToken: string }
  | 'unrecoverable-error'
  | 'user-not-found'
  | 'invalid-password'
> {
  const getUserResult = await UserDatabase.getUserByEmail(email)

  if (isError(getUserResult)) {
    return 'unrecoverable-error'
  } else if (getUserResult === 'user-not-found') {
    return 'user-not-found'
  }

  const user: User = getUserResult

  let passwordsMatch: boolean
  try {
    passwordsMatch = await checkIfPasswordsMatch(password, user.password)
  } catch (error) {
    return 'unrecoverable-error'
  }

  if (!passwordsMatch) {
    return 'invalid-password'
  }

  const generateAuthTokenResult = generateAuthToken(user.id)

  if (isError(generateAuthTokenResult)) {
    return 'unrecoverable-error'
  }

  sendLoginEmail(user)

  return {
    user: removePassword(user),
    authToken: generateAuthTokenResult,
  }
}
