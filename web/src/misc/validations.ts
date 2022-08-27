export const USER_NAME_MAX_LENGTH = 100
export const PASSWORD_MAX_LENGTH = 60
export const EMAIL_MAX_LENGTH = 254

// Regex from https://stackoverflow.com/a/9204568/4034572.
// This is just a simple check. To truly verify the email, send an email to the
// address and ask the user for validation.
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}