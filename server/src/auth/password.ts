import * as bcrypt from 'bcrypt'

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
