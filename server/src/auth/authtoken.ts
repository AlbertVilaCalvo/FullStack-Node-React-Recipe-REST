import { IncomingHttpHeaders } from 'http'
import * as jwt from 'jsonwebtoken'
import { config } from '../config'
import { toError } from '../misc/util'

const TOKEN_VALIDITY_TIME = '1h'

/**
 * Our data added to the payload.
 * Note that the resulting payload will have more fields, added by the library.
 */
type AuthTokenPayloadCustomData = {
  /** User ID */
  uid: number
}

/**
 * The fields added by the library plus our data.
 */
export type AuthTokenPayload = {
  /** Issued at */
  iat: number
  /** Expiration Time */
  exp: number
} & AuthTokenPayloadCustomData

function isAuthTokenPayload(
  arg: string | jwt.JwtPayload
): arg is AuthTokenPayload {
  if (typeof arg === 'string') {
    return false
  }
  arg.iat
  if (!arg.iat) {
    return false
  }
  if ('uid' in arg && typeof arg.uid === 'number') {
    return true
  }
  return false
}

export function getAuthTokenFromHeader(
  headers: IncomingHttpHeaders
): string | Error {
  if (!headers.authorization) {
    return Error('Authorization header is missing')
  }

  const parts = headers.authorization.split(' ')

  if (parts.length !== 2) {
    return Error('Authorization header format is not correct')
  }

  if (parts[0].toLowerCase() !== 'bearer') {
    return Error('Authorization header format is not correct')
  }

  return parts[1]
}

/**
 * It will return Error if the token has expired, if the signature is not valid,
 * or the payload does not have the expected shape.
 */
export function getPayloadFromAuthToken(
  authToken: string
): AuthTokenPayload | Error {
  try {
    const decodedPayload = jwt.verify(authToken, config.jwtSecret, {
      // This is redundant since we also set 'expiresIn' when create the token
      maxAge: TOKEN_VALIDITY_TIME,
    })
    console.log(`jwt.verify result:`, decodedPayload)
    if (isAuthTokenPayload(decodedPayload)) {
      return decodedPayload
    } else {
      return Error(`Unexpected payload format: ${decodedPayload}`)
    }
  } catch (error) {
    console.error(`jwt.verify error:`, error)
    return toError(error, 'getAuthTokenPayload')
  }
}

export async function generateAuthToken(
  userId: number
): Promise<string | Error> {
  try {
    const payloadCustomData: AuthTokenPayloadCustomData = {
      uid: userId,
    }
    const authToken = jwt.sign(payloadCustomData, config.jwtSecret, {
      expiresIn: TOKEN_VALIDITY_TIME,
    })
    return authToken
  } catch (error) {
    console.error(`generateAuthToken error`, error)
    return toError(error, 'generateAuthToken')
  }
}
