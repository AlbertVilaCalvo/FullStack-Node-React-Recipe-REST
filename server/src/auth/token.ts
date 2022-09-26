import { IncomingHttpHeaders } from 'http'
import * as jwt from 'jsonwebtoken'
import { config } from '../config'
import { toError } from '../misc/util'
import { isError } from '../misc/result'
import { TokenExpiredError } from 'jsonwebtoken'

const TOKEN_VALIDITY_TIME = '1h'

type TokenType = 'auth' | 'verify-email'

/**
 * Our data added to the payload.
 * Note that the resulting payload will have more fields, added by the library.
 */
interface TokenPayloadCustomData {
  type: TokenType
  /** User ID. */
  uid: number
}

interface AuthTokenPayloadCustomData extends TokenPayloadCustomData {
  type: 'auth'
}

interface VerifyEmailTokenPayloadCustomData extends TokenPayloadCustomData {
  type: 'verify-email'
}

/**
 * The fields added by the library to the payload.
 */
type TokenPayloadLibraryData = {
  /** Issued at */
  iat: number
  /** Expiration Time */
  exp: number
}

/**
 * The fields added by the library plus our data.
 */
export type AuthTokenPayload = TokenPayloadLibraryData &
  AuthTokenPayloadCustomData

/**
 * The fields added by the library plus our data.
 */
export type VerifyEmailTokenPayload = TokenPayloadLibraryData &
  VerifyEmailTokenPayloadCustomData

type TokenPayload = AuthTokenPayload | VerifyEmailTokenPayload

function isTokenPayload(arg: string | jwt.JwtPayload): arg is TokenPayload {
  if (typeof arg === 'string') {
    return false
  }
  if (!arg.iat) {
    return false
  }
  if (!arg.exp) {
    return false
  }
  if (
    'uid' in arg &&
    typeof arg.uid === 'number' &&
    'type' in arg &&
    (arg.type === 'auth' || arg.type === 'verify-email')
  ) {
    return true
  }
  return false
}

function isAuthTokenPayload(
  arg: string | jwt.JwtPayload
): arg is AuthTokenPayload {
  return isTokenPayload(arg) && arg.type === 'auth'
}

function isVerifyEmailTokenPayload(
  arg: string | jwt.JwtPayload
): arg is VerifyEmailTokenPayload {
  return isTokenPayload(arg) && arg.type === 'verify-email'
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

  const authToken = parts[1]

  if (!authToken) {
    return Error('Authorization token is empty')
  }

  return authToken
}

/**
 * It will return Error if the token has expired, if the signature is not valid,
 * or the payload does not have the expected shape.
 */
function getPayloadFromToken(
  token: string
): TokenPayload | 'token-expired' | Error {
  try {
    const decodedPayload = jwt.verify(token, config.jwtSecret, {
      // This is redundant since we also set 'expiresIn' when create the token
      maxAge: TOKEN_VALIDITY_TIME,
    })
    if (isTokenPayload(decodedPayload)) {
      return decodedPayload
    } else {
      return Error(`Unexpected payload format: ${decodedPayload}`)
    }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return 'token-expired'
    }
    console.error(`jwt.verify error:`, error)
    return toError(error, 'getPayloadFromToken')
  }
}

/**
 * It will return Error if the token has expired, if the signature is not valid,
 * or the payload does not have the expected shape.
 */
export function getPayloadFromAuthToken(
  authToken: string
): AuthTokenPayload | 'token-expired' | Error {
  const getPayloadResult = getPayloadFromToken(authToken)
  if (isError(getPayloadResult) || getPayloadResult === 'token-expired') {
    return getPayloadResult
  }
  if (getPayloadResult.type === 'auth') {
    return getPayloadResult
  } else {
    return Error(
      `Incorrect payload type ${getPayloadResult.type}. It should be 'auth'.`
    )
  }
}

/**
 * It will return Error if the token has expired, if the signature is not valid,
 * or the payload does not have the expected shape.
 */
export function getPayloadFromVerifyEmailToken(
  verifyEmailToken: string
): VerifyEmailTokenPayload | 'token-expired' | Error {
  const getPayloadResult = getPayloadFromToken(verifyEmailToken)
  if (isError(getPayloadResult) || getPayloadResult === 'token-expired') {
    return getPayloadResult
  }
  if (getPayloadResult.type === 'verify-email') {
    return getPayloadResult
  } else {
    return Error(
      `Incorrect payload type ${getPayloadResult.type}. It should be 'verify-email'.`
    )
  }
}

/**
 * A combination of `getAuthTokenFromHeader` and `getPayloadFromAuthToken` in a
 * single function.
 */
export function getAuthTokenPayloadFromHeader(
  headers: IncomingHttpHeaders
): AuthTokenPayload | 'token-expired' | Error {
  try {
    const getAuthTokenResult = getAuthTokenFromHeader(headers)
    if (isError(getAuthTokenResult)) {
      return getAuthTokenResult
    }
    const authToken: string = getAuthTokenResult
    return getPayloadFromAuthToken(authToken)
  } catch (error) {
    console.error(`getAuthTokenPayloadFromHeader error:`, error)
    return toError(error, 'getAuthTokenPayloadFromHeader')
  }
}

function generateToken(tokenType: TokenType, userId: number): string | Error {
  try {
    const payloadCustomData: TokenPayloadCustomData = {
      type: tokenType,
      uid: userId,
    }
    const authToken = jwt.sign(payloadCustomData, config.jwtSecret, {
      expiresIn: TOKEN_VALIDITY_TIME,
    })
    return authToken
  } catch (error) {
    console.error(`generateToken error`, error, tokenType, userId)
    return toError(error, 'generateToken')
  }
}

export function generateAuthToken(userId: number): string | Error {
  return generateToken('auth', userId)
}

export function generateVerifyEmailToken(userId: number): string | Error {
  return generateToken('verify-email', userId)
}
