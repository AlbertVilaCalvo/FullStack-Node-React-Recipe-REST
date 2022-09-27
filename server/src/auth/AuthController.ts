import { RequestHandler } from 'express'
import { StatusCode } from '../misc/StatusCode'
import * as AuthService from './AuthService'
import {
  EmailSchema,
  PlainPasswordSchema,
  User,
  UserNameSchema,
  UserNoPassword,
  userFrontendUrl,
  NewPlainPasswordSchema,
} from '../user/User'
import { ApiError } from '../misc/ApiError'
import { isValidData, toApiError } from '../validation/validations'
import { assertUser } from './AuthMiddleware'
import { assertUnreachable } from '../misc/assertUnreachable'
import { z } from 'zod'

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

/**
 * POST /api/auth/email-verification/email
 *
 * curl http://localhost:5000/api/auth/email-verification/email -H "Content-Type: application/json"
 * -H "Authorization: Bearer auth_token" -d '{"verify_token":"token"}' -v
 */
export const sendVerifyEmail: RequestHandler<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  void,
  undefined
> = async (req, res) => {
  try {
    assertUser(req.user, 'AuthController.sendVerifyEmail')
    const user: User = req.user

    const sendEmailResult = await AuthService.sendVerifyEmail(user, false)
    switch (sendEmailResult) {
      case 'success':
        res.sendStatus(StatusCode.NO_CONTENT_204)
        return
      case 'email-already-verified':
        res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
        return
      case 'unrecoverable-error':
        res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
        return
      default:
        assertUnreachable(sendEmailResult)
    }
  } catch (e) {
    console.error('Unexpected error at AuthController.sendVerifyEmail:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}

const VerifyEmailSchema = z.object({ verify_email_token: z.string().min(1) })
type VerifyEmailRequest = { verify_email_token: string }

/**
 * POST /api/auth/email-verification
 *
 * curl http://localhost:5000/api/auth/email-verification -H "Content-Type: application/json"
 * -d '{"verify_email_token":"token"}' -v
 */
export const verifyEmail: RequestHandler<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  void | ApiError,
  VerifyEmailRequest
> = async (req, res) => {
  try {
    const validateBodyResult = VerifyEmailSchema.safeParse(req.body)
    if (!isValidData(validateBodyResult)) {
      const apiError = toApiError(validateBodyResult.error)
      res.status(StatusCode.BAD_REQUEST_400).json(apiError)
      return
    }
    const requestBody: VerifyEmailRequest = validateBodyResult.data

    const verifyEmailResult = await AuthService.verifyEmail(
      requestBody.verify_email_token
    )

    switch (verifyEmailResult) {
      case 'success':
        res.sendStatus(StatusCode.NO_CONTENT_204)
        return
      case 'token-expired':
        res.status(StatusCode.OK_200).json(ApiError.validateEmailTokenExpired())
        return
      case 'unrecoverable-error':
        res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
        return
      default:
        assertUnreachable(verifyEmailResult)
    }
  } catch (e) {
    console.error('Unexpected error at AuthController.verifyEmail:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}

type SendPasswordResetEmailRequest = { email: string }

/**
 * POST /api/auth/password-reset/email
 *
 * curl http://localhost:5000/api/auth/password-reset/email -H "Content-Type: application/json"
 * -d '{"email":a@a.com}' -v
 */
export const sendPasswordResetEmail: RequestHandler<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  void | ApiError,
  SendPasswordResetEmailRequest
> = async (req, res) => {
  try {
    const validateBodyResult = EmailSchema.safeParse(req.body)
    if (!isValidData(validateBodyResult)) {
      const apiError = toApiError(validateBodyResult.error)
      res.status(StatusCode.BAD_REQUEST_400).json(apiError)
      return
    }
    const requestBody: SendPasswordResetEmailRequest = validateBodyResult.data

    const sendEmailResult = await AuthService.sendPasswordResetEmail(
      requestBody.email
    )
    switch (sendEmailResult) {
      case 'success':
        res.sendStatus(StatusCode.NO_CONTENT_204)
        return
      case 'unrecoverable-error':
        res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
        return
      default:
        assertUnreachable(sendEmailResult)
    }
  } catch (e) {
    console.error(
      'Unexpected error at AuthController.sendPasswordResetEmail:',
      e
    )
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}

const ResetPasswordSchema = z
  .object({
    password_reset_token: z.string().min(1),
  })
  .merge(NewPlainPasswordSchema)
type ResetPasswordRequest = {
  password_reset_token: string
  new_password: string
}

/**
 * POST /api/auth/password-reset
 *
 * curl http://localhost:5000/api/auth/password-reset -H "Content-Type: application/json"
 * -d '{"password_reset_token":"token"}' -v
 */
export const resetPassword: RequestHandler<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  void | ApiError,
  ResetPasswordRequest
> = async (req, res) => {
  try {
    const validateBodyResult = ResetPasswordSchema.safeParse(req.body)
    if (!isValidData(validateBodyResult)) {
      const apiError = toApiError(validateBodyResult.error)
      res.status(StatusCode.BAD_REQUEST_400).json(apiError)
      return
    }
    const requestBody: ResetPasswordRequest = validateBodyResult.data

    const resetPasswordResult = await AuthService.resetPassword(
      requestBody.password_reset_token,
      requestBody.new_password
    )
    switch (resetPasswordResult) {
      case 'success':
        res.sendStatus(StatusCode.NO_CONTENT_204)
        return
      case 'token-expired':
        res.status(StatusCode.OK_200).json(ApiError.passwordResetTokenExpired())
        return
      case 'unrecoverable-error':
        res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
        return
      default:
        assertUnreachable(resetPasswordResult)
    }
  } catch (e) {
    console.error('Unexpected error at AuthController.resetPassword:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}
