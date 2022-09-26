import { checkIfPasswordsMatch, hashPassword } from './password'
import * as UserDatabase from '../user/UserDatabase'
import { isError } from '../misc/result'
import { removePassword, User, UserNoPassword } from '../user/User'
import {
  generateAuthToken,
  generateVerifyEmailToken,
  getPayloadFromVerifyEmailToken,
  VerifyEmailTokenPayload,
} from './authtoken'
import { sendLoginEmail, sendEmailVerificationEmail } from '../misc/email'

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

  // Since the user can manually trigger sending an email verification email
  // from the settings at any time, we don't wait to completion, nor we care
  // if it succeeds or fails.
  sendVerifyEmail(user)

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

/**
 * Sends a 'verify email' email to the user.
 */
export async function sendVerifyEmail(
  user: User
): Promise<'success' | 'email-already-verified' | 'unrecoverable-error'> {
  if (user.email_verified) {
    console.warn(`The user with id ${user.id} has already verified the email`)
    return 'email-already-verified'
  }

  const generateTokenResult = generateVerifyEmailToken(user.id)
  if (isError(generateTokenResult)) {
    return 'unrecoverable-error'
  }
  const verifyEmailToken: string = generateTokenResult

  // TODO we'll need to change 'localhost:3000' when deployed
  const verifyEmailLink = `http://localhost:3000/verify-email?token=${verifyEmailToken}`
  const sendEmailResult = await sendEmailVerificationEmail(
    user,
    verifyEmailLink
  )
  if (sendEmailResult === 'success') {
    return 'success'
  } else {
    return 'unrecoverable-error'
  }
}

export async function verifyEmail(
  verifyEmailToken: string
): Promise<'success' | 'unrecoverable-error'> {
  const getPayloadResult = getPayloadFromVerifyEmailToken(verifyEmailToken)

  if (isError(getPayloadResult)) {
    return 'unrecoverable-error'
  }

  const payload: VerifyEmailTokenPayload = getPayloadResult
  const userId = payload.uid

  const updateEmailVerifiedResult = await UserDatabase.updateUserEmailVerified(
    userId,
    true
  )

  if (updateEmailVerifiedResult === 'success') {
    return 'success'
  } else {
    return 'unrecoverable-error'
  }
}
