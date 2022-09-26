import { RequestHandler } from 'express'
import { StatusCode } from '../misc/StatusCode'
import * as AuthService from './AuthService'
import {
  EmailSchema,
  PlainPasswordSchema,
  UserNameSchema,
  UserNoPassword,
  userFrontendUrl,
} from '../user/User'
import { ApiError } from '../misc/ApiError'
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

    const registerResult = await AuthService.register(
      requestBody.name,
      requestBody.email,
      requestBody.password
    )

    if (registerResult === 'unrecoverable-error') {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    } else if (registerResult === 'duplicate-email') {
      res.status(StatusCode.CONFLICT_409).json(ApiError.duplicateEmail())
      return
    }

    const locationHeaderUrl = userFrontendUrl(registerResult.user.id)
    const registerResponse: RegisterLoginResponse = {
      user: registerResult.user,
      auth_token: registerResult.authToken,
    }
    res
      .status(StatusCode.CREATED_201)
      .location(locationHeaderUrl)
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

    const loginResult = await AuthService.login(
      requestBody.email,
      requestBody.password
    )

    if (loginResult === 'unrecoverable-error') {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    } else if (loginResult === 'user-not-found') {
      res.status(StatusCode.OK_200).json(ApiError.invalidLoginCredentials())
      return
    } else if (loginResult === 'invalid-password') {
      res.status(StatusCode.OK_200).json(ApiError.invalidLoginCredentials())
      return
    }

    const locationHeaderUrl = userFrontendUrl(loginResult.user.id)
    const loginResponse: RegisterLoginResponse = {
      user: loginResult.user,
      auth_token: loginResult.authToken,
    }
    res
      .status(StatusCode.OK_200)
      .location(locationHeaderUrl)
      .json(loginResponse)
  } catch (e) {
    console.error('Unexpected error at AuthController.login:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}
