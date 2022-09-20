import * as bcrypt from 'bcrypt'
import { toError } from '../misc/util'

const ROUNDS = 15 // Default is 10

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS)
}

export function checkIfPasswordsMatch(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

export async function validatePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<'valid-password' | 'invalid-password' | Error> {
  let passwordsMatch: boolean
  try {
    passwordsMatch = await checkIfPasswordsMatch(plainPassword, hashedPassword)
  } catch (error) {
    return toError(error, 'validatePassword')
  }
  if (passwordsMatch) {
    return 'valid-password'
  } else {
    return 'invalid-password'
  }
}
