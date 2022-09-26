/**
 * Check if the given string can ve converted to a number with `parseFloat()`
 * or `Number()`.
 * From https://stackoverflow.com/a/1421988/4034572.
 */
export function isNumber(n: string): boolean {
  return !isNaN(parseFloat(n))
}

/**
 * For try-catch, to convert the error (which has type unknown) to an Error.
 */
export function toError(error: unknown, where: string): Error {
  if (error instanceof Error) {
    return error
  } else {
    console.error(`${where} - Not an instanceof error`, error)
    return Error('Unknown error')
  }
}
