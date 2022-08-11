import { Request } from 'express'

// From https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
export function requestFullUrl(req: Request): string {
  return `${req.protocol}://${req.get('host')}${req.originalUrl}`
}
