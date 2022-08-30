import { Request, RequestHandler } from 'express'
import { StatusCode } from '../misc/StatusCode'
import * as UserDatabase from '../user/UserDatabase'
import { checkIfPasswordsMatch, hashPassword } from './password'
import { isError } from '../misc/result'
import { User } from '../user/User'
import { requestFullUrl } from '../misc/util'
import { ApiError } from '../misc/ApiError'

/**
 * POST /api/auth/register
 *
 * curl http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Peter", "email":"a@a.com", "password":"123456"}'
 */
export const register: RequestHandler<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  { id: number } | ApiError,
  { name?: string; email?: string; password?: string }
> = async (req, res) => {
  const name = req.body.name
  if (!name) {
    res.status(StatusCode.BAD_REQUEST_400).json(ApiError.nameRequired())
    return
  }
  const email = req.body.email
  if (!email) {
    res.status(StatusCode.BAD_REQUEST_400).json(ApiError.emailRequired())
    return
  }
  const password = req.body.password
  if (!password) {
    res.status(StatusCode.BAD_REQUEST_400).json(ApiError.passwordRequired())
    return
  }
  // TODO validate name length
  // TODO validate email format
  // TODO validate password length

  let passwordHash: string
  try {
    passwordHash = await hashPassword(password)
  } catch (error) {
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    return
  }

  const insertUserResult = await UserDatabase.insertNewUser(
    name,
    email,
    passwordHash
  )

  if (isError(insertUserResult)) {
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  } else if (insertUserResult === 'duplicate-email-error') {
    res.status(StatusCode.CONFLICT_409).json(ApiError.duplicateEmail())
  } else {
    const user: User = insertUserResult
    res
      .status(StatusCode.CREATED_201)
      .location(`${requestFullUrl(req)}/users/${user.id}`)
      .json({ id: user.id })
  }
}

/**
 * POST /api/auth/login
 *
 * curl http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"a@a.com", "password":"123456"}' -v
 */
export const login: RequestHandler<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  ApiError,
  { email?: string; password?: string }
> = async (req, res) => {
  const email = req.body.email
  if (!email) {
    res.status(StatusCode.BAD_REQUEST_400).json(ApiError.emailRequired())
    return
  }
  const password = req.body.password
  if (!password) {
    res.status(StatusCode.BAD_REQUEST_400).json(ApiError.passwordRequired())
    return
  }
  // TODO validate email format
  // TODO validate password length

  const getUserResult = await UserDatabase.getUserByEmail(email)

  if (isError(getUserResult)) {
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    return
  } else if (getUserResult === 'user-not-found') {
    res.status(StatusCode.OK_200).json(ApiError.invalidLoginCredentials())
    return
  }

  const user: User = getUserResult

  let passwordsMatch: boolean
  try {
    passwordsMatch = await checkIfPasswordsMatch(password, user.password)
  } catch (error) {
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    return
  }

  if (passwordsMatch) {
    res.sendStatus(StatusCode.OK_200)
  } else {
    res.status(StatusCode.OK_200).json(ApiError.invalidLoginCredentials())
  }
}
