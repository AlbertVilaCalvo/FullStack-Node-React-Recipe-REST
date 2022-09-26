import { RequestHandler } from 'express'
import {
  AuthTokenPayload,
  getAuthTokenFromHeader,
  getPayloadFromAuthToken,
} from './token'
import { isError } from '../misc/result'
import { StatusCode } from '../misc/StatusCode'
import { ApiError } from '../misc/ApiError'
import * as UserDatabase from '../user/UserDatabase'
import { User } from '../user/User'

// https://stackoverflow.com/q/37377731/4034572
declare module 'express-serve-static-core' {
  interface Request {
    user?: User
  }
}

/**
 * Middleware that verifies that an 'Authorization' header with a valid auth
 * token is present on the request.
 * If the Authorization header is present and contains valid auth token, it sets
 * the user to the request and calls the next middleware, otherwise it returns
 * 401 Unauthorized.
 */
export const requireLoggedUser: RequestHandler = async (req, res, next) => {
  try {
    const getAuthTokenResult = getAuthTokenFromHeader(req.headers)

    if (isError(getAuthTokenResult)) {
      res
        .status(StatusCode.UNAUTHORIZED_401)
        .json(ApiError.validAuthTokenRequired())
      return
    }

    const authToken: string = getAuthTokenResult
    const getPayloadResult = getPayloadFromAuthToken(authToken)

    if (isError(getPayloadResult)) {
      res
        .status(StatusCode.UNAUTHORIZED_401)
        .json(ApiError.validAuthTokenRequired())
      return
    }

    const payload: AuthTokenPayload = getPayloadResult
    const getUserResult = await UserDatabase.getUserById(payload.uid)

    if (isError(getUserResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    } else if (getUserResult === 'user-not-found') {
      // Either the user has been deleted, or the JWT has been tampered with
      console.error(`requireLoggedUser - user not found - payload: ${payload}`)
      res
        .status(StatusCode.UNAUTHORIZED_401)
        .json(ApiError.validAuthTokenRequired())
      return
    }

    const user: User = getUserResult
    req.user = user

    next()
  } catch (e) {
    console.error('Unexpected error at AuthMiddleware.requireLoggedUser:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}

/**
 * Since `req.user` is defined as `User | undefined`, every time you want to get
 * the user on a request handler you need to assert that is not `undefined`,
 * which is cumbersome. This assertion function allows you to get rid of
 * `undefined` quickly.
 *
 * Obviously, it should only be used on route handlers that have the middleware
 * `requireLoggedUser`.
 *
 * @param user `req.user`
 * @param where name of the function where `assertUser` is called
 */
export function assertUser(
  user: User | undefined,
  where: string
): asserts user is User {
  if (!user) {
    const message = `req.user is undefined at ${where}`
    console.error(message)
    throw new Error(message)
  }
}

export * as AuthMiddleware from './AuthMiddleware'
