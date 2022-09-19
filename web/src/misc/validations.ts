// User
export const USER_NAME_MAX_LENGTH = 100
export const PASSWORD_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 60
export const EMAIL_MAX_LENGTH = 254

// Recipe
export const TITLE_MIN_LENGTH = 2
export const TITLE_MAX_LENGTH = 250
export const MIN_COOKING_TIME_MINUTES = 1
export const MAX_COOKING_TIME_MINUTES = 3 * 24 * 60 // 3 days

// Regex from https://stackoverflow.com/a/9204568/4034572.
// This is just a simple check. To truly verify the email, send an email to the
// address and ask the user for validation.
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function isValidId(id: number): boolean {
  return !isNaN(id) && id > 0
}

export const ValidationError = {
  EMAIL_FORMAT: 'This is not a valid email.',
  PASSWORDS_DONT_MATCH: "Passwords don't match",
}
