import { Request, RequestHandler } from 'express'
import { StatusCode } from '../misc/StatusCode'
import * as UserDatabase from '../user/UserDatabase'
import { checkIfPasswordsMatch, hashPassword } from './password'
import { isError } from '../misc/result'
import {
  EmailSchema,
  PlainPasswordSchema,
  removePassword,
  User,
  UserNameSchema,
  UserNoPassword,
} from '../user/User'
import { requestFullUrl } from '../misc/util'
import { ApiError } from '../misc/ApiError'
import { generateAuthToken } from './authtoken'
import { isValidData, toApiError } from '../validation/validations'

type RegisterLoginResponse = {
  user: UserNoPassword
  auth_token: string
}
const RegisterRequestSchema =
  UserNameSchema.merge(EmailSchema).merge(PlainPasswordSchema)
type RegisterRequest = { name: string; email: string; password: string }

/**
 * POST /api/auth/register
 *
 * curl http://localhost:5000/api/auth/register -H "Content-Type: application/json"
 * -d '{"name":"Peter", "email":"a@a.com", "password":"123456"}'
 */
export const register: RequestHandler<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  RegisterLoginResponse | ApiError,
  RegisterRequest
> = async (req, res) => {
  try {
    const validateBodyResult = RegisterRequestSchema.safeParse(req.body)
    if (!isValidData(validateBodyResult)) {
      const apiError = toApiError(validateBodyResult.error)
      res.status(StatusCode.BAD_REQUEST_400).json(apiError)
      return
    }
    const requestBody: RegisterRequest = validateBodyResult.data

    let passwordHash: string
    try {
      passwordHash = await hashPassword(requestBody.password)
    } catch (error) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    }

    const insertUserResult = await UserDatabase.insertNewUser(
      requestBody.name,
      requestBody.email,
      passwordHash
    )

    if (isError(insertUserResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    } else if (insertUserResult === 'duplicate-email-error') {
      res.status(StatusCode.CONFLICT_409).json(ApiError.duplicateEmail())
      return
    }

    const user: User = insertUserResult
    const generateAuthTokenResult = await generateAuthToken(user.id)

    if (isError(generateAuthTokenResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    }

    const registerResponse: RegisterLoginResponse = {
      user: removePassword(user),
      auth_token: generateAuthTokenResult,
    }
    res
      .status(StatusCode.CREATED_201)
      .location(`${requestFullUrl(req as unknown as Request)}/users/${user.id}`)
      .json(registerResponse)
  } catch (e) {
    console.error('Unexpected error at AuthController.register:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}

const LoginRequestSchema = EmailSchema.merge(PlainPasswordSchema)
type LoginRequest = { email: string; password: string }

/**
 * POST /api/auth/login
 *
 * curl http://localhost:5000/api/auth/login -H "Content-Type: application/json"
 * -d '{"email":"a@a.com", "password":"123456"}' -v
 */
export const login: RequestHandler<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  RegisterLoginResponse | ApiError,
  LoginRequest
> = async (req, res) => {
  try {
    const validateBodyResult = LoginRequestSchema.safeParse(req.body)
    if (!isValidData(validateBodyResult)) {
      const apiError = toApiError(validateBodyResult.error)
      res.status(StatusCode.BAD_REQUEST_400).json(apiError)
      return
    }
    const requestBody: LoginRequest = validateBodyResult.data

    const getUserResult = await UserDatabase.getUserByEmail(requestBody.email)

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
      passwordsMatch = await checkIfPasswordsMatch(
        requestBody.password,
        user.password
      )
    } catch (error) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    }

    if (!passwordsMatch) {
      res.status(StatusCode.OK_200).json(ApiError.invalidLoginCredentials())
      return
    }

    const generateAuthTokenResult = await generateAuthToken(user.id)

    if (isError(generateAuthTokenResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    }

    const loginResponse: RegisterLoginResponse = {
      user: removePassword(user),
      auth_token: generateAuthTokenResult,
    }
    res
      .status(StatusCode.OK_200)
      .location(`${requestFullUrl(req as unknown as Request)}/users/${user.id}`)
      .json(loginResponse)
  } catch (e) {
    console.error('Unexpected error at AuthController.login:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}
