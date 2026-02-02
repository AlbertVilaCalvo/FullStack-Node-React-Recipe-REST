import morgan from 'morgan'
import { IncomingMessage, ServerResponse } from 'http'
import { config } from '../config'

// Do not log health check requests in production, it's a lot of noise
const shouldSkipLogging = (
  req: IncomingMessage,
  res: ServerResponse
): boolean => {
  return req.url !== undefined && req.url.includes('/health')
}

export const loggingMiddleware = config.isDevelopment
  ? morgan('dev')
  : morgan('combined', { skip: shouldSkipLogging })
