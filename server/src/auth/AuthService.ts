import { checkIfPasswordsMatch, hashPassword } from './password'
import * as UserDatabase from '../user/UserDatabase'
import { isError } from '../misc/result'
import { removePassword, User, UserNoPassword } from '../user/User'
import {
  generateAuthToken,
  generatePasswordResetToken,
  generateVerifyEmailToken,
  getPayloadFromPasswordResetToken,
  getPayloadFromVerifyEmailToken,
  PasswordResetTokenPayload,
  VerifyEmailTokenPayload,
} from './token'
import {
  sendLoginAlertEmail,
  sendEmailVerificationEmail,
  sendResetPasswordEmail,
} from '../misc/email'
import { assertUnreachable } from '../misc/assertUnreachable'

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
  sendVerifyEmail(user, true)

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

  sendLoginAlertEmail(user)

  return {
    user: removePassword(user),
    authToken: generateAuthTokenResult,
  }
}

/**
 * Sends a 'verify email' email to the user.
 */
export async function sendVerifyEmail(
  user: User,
  isRegister: boolean
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
    verifyEmailLink,
    isRegister
  )
  if (sendEmailResult === 'success') {
    return 'success'
  } else if (isError(sendEmailResult)) {
    return 'unrecoverable-error'
  }
  assertUnreachable(sendEmailResult)
}

export async function verifyEmail(
  verifyEmailToken: string
): Promise<'success' | 'token-expired' | 'unrecoverable-error'> {
  const getPayloadResult = getPayloadFromVerifyEmailToken(verifyEmailToken)

  if (isError(getPayloadResult)) {
    return 'unrecoverable-error'
  } else if (getPayloadResult === 'token-expired') {
    return 'token-expired'
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

/**
 * Sends a password reset email to the user.
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<'success' | 'unrecoverable-error'> {
  const getUserResult = await UserDatabase.getUserByEmail(email)

  if (isError(getUserResult)) {
    return 'unrecoverable-error'
  } else if (getUserResult === 'user-not-found') {
    // We don't want to reveal the user that this email does not exist
    return 'success'
  }

  const user: User = getUserResult

  const generateTokenResult = generatePasswordResetToken(user.id)
  if (isError(generateTokenResult)) {
    return 'unrecoverable-error'
  }
  const passwordResetToken: string = generateTokenResult

  // TODO we'll need to change 'localhost:3000' when deployed
  const passwordResetLink = `http://localhost:3000/password-reset?token=${passwordResetToken}`
  const sendEmailResult = await sendResetPasswordEmail(user, passwordResetLink)

  if (sendEmailResult === 'success') {
    return 'success'
  } else if (isError(sendEmailResult)) {
    return 'unrecoverable-error'
  }
  assertUnreachable(sendEmailResult)
}

/**
 * Set a new password for a user. This is part of the password reset via email flow.
 * @param passwordResetToken a JWT token of type 'password-reset' (from the request body)
 * @param newPassword new plain text password (from the request body)
 */
export async function resetPassword(
  passwordResetToken: string,
  newPassword: string
): Promise<'success' | 'token-expired' | 'unrecoverable-error'> {
  const getPayloadResult = getPayloadFromPasswordResetToken(passwordResetToken)

  if (isError(getPayloadResult)) {
    return 'unrecoverable-error'
  } else if (getPayloadResult === 'token-expired') {
    return 'token-expired'
  }

  const payload: PasswordResetTokenPayload = getPayloadResult
  const userId = payload.uid

  let newPasswordHash: string
  try {
    newPasswordHash = await hashPassword(newPassword)
  } catch (error) {
    return 'unrecoverable-error'
  }

  const updatePasswordResult = await UserDatabase.updateUserPassword(
    userId,
    newPasswordHash
  )

  if (isError(updatePasswordResult)) {
    return 'unrecoverable-error'
  } else if (updatePasswordResult === 'success') {
    return 'success'
  } else if (updatePasswordResult === 'user-not-found') {
    // Unlikely. This can only happen if the user is deleted a few minutes
    // after triggering the reset password. We can return 'success' or
    // 'unrecoverable-error'.
    return 'success'
  }
  assertUnreachable(updatePasswordResult)
}
