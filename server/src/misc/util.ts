import { Request } from 'express'

// From https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
export function requestFullUrl(req: Request): string {
  return `${req.protocol}://${req.get('host')}${req.originalUrl}`
}

/**
 * Check if the argument is a number or a string that contains a number.
 * Important: if the argument is a string, you need to convert it to a number
 * with `parseFloat()` or `Number()`.
 * From https://stackoverflow.com/a/1421988/4034572.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNumber(n: any): boolean {
  return !isNaN(parseFloat(n)) && !isNaN(n - 0)
}
