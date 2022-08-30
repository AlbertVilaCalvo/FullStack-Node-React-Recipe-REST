import { Request } from 'express'

// From https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
export function requestFullUrl(req: Request): string {
  return `${req.protocol}://${req.get('host')}${req.originalUrl}`
}

/**
 * Check if the given string can ve converted to a number with `parseFloat()`
 * or `Number()`.
 * From https://stackoverflow.com/a/1421988/4034572.
 */
export function isNumber(n: string): boolean {
  return !isNaN(parseFloat(n))
}
