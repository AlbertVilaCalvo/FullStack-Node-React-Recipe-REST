import { z } from 'zod'
import { isValidData, toApiError } from '../validation/validations'
import { RequestHandler } from 'express'
import { ApiError } from '../misc/ApiError'
import { StatusCode } from '../misc/StatusCode'
import {
  EMAIL_MAX_LENGTH,
  PlainPasswordSchema,
  User,
  UserNameSchema,
} from '../user/User'
import * as UserService from '../user/UserService'
import * as UserDatabase from '../user/UserDatabase'
import { isError } from '../misc/result'
import { assertUser } from '../auth/AuthMiddleware'
import { assertUnreachable } from '../misc/assertUnreachable'

const UpdateProfileRequestSchema = UserNameSchema
type UpdateProfileRequest = { name: string }

/**
 * PUT /api/my-account/profile
 *
 * Update the logged user's name.
 *
 * curl http://localhost:5000/api/my-account/profile -X PUT -H "Content-Type: application/json"
 * -H "Authorization: Bearer auth_token" -d '{"name":"Peter"}'
 */
export const updateProfile: RequestHandler<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  undefined | ApiError,
  UpdateProfileRequest
> = async (req, res) => {
  try {
    const validateBodyResult = UpdateProfileRequestSchema.safeParse(req.body)
    if (!isValidData(validateBodyResult)) {
      const apiError = toApiError(validateBodyResult.error)
      res.status(StatusCode.BAD_REQUEST_400).json(apiError)
      return
    }
    const requestBody: UpdateProfileRequest = validateBodyResult.data

    assertUser(req.user, 'MyAccountController.updateProfile')
    const user: User = req.user

    const updateProfileResult = await UserDatabase.updateUserProfile(
      user.id,
      requestBody.name
    )
    if (
      updateProfileResult === 'user-not-found' ||
      isError(updateProfileResult)
    ) {
      // 'user-not-found' should never happen since we grab the user from the
      // database in AuthMiddleware.requireLoggedUser.
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    } else {
      res.sendStatus(StatusCode.NO_CONTENT_204)
    }
  } catch (e) {
    console.error('Unexpected error at UserController.updateProfile:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}

const ChangeEmailReqBodySchema = z
  .object({
    new_email: z.string().email().max(EMAIL_MAX_LENGTH),
  })
  .merge(PlainPasswordSchema)
type ChangeEmailReqBody = { new_email: string; password: string }

/**
 * PUT /api/my-account/email
 *
 * curl http://localhost:5000/api/my-account/email -X PUT -H "Content-Type: application/json"
 * -H "Authorization: Bearer auth_token" -d '{"new_email":"a@a.com", "password":"123456"}' -v
 */
export const updateEmail: RequestHandler<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  void | ApiError,
  ChangeEmailReqBody
> = async (req, res) => {
  try {
    const validateBodyResult = ChangeEmailReqBodySchema.safeParse(req.body)
    if (!isValidData(validateBodyResult)) {
      const apiError = toApiError(validateBodyResult.error)
      res.status(StatusCode.BAD_REQUEST_400).json(apiError)
      return
    }
    const requestBody: ChangeEmailReqBody = validateBodyResult.data

    assertUser(req.user, 'MyAccountController.updateEmail')
    const user: User = req.user

    const updateUserEmailResult = await UserService.updateUserEmail(
      user,
      requestBody.password,
      requestBody.new_email
    )

    switch (updateUserEmailResult) {
      case 'success':
        res.sendStatus(StatusCode.NO_CONTENT_204)
        return
      case 'invalid-password':
        res.status(StatusCode.OK_200).json(ApiError.invalidPassword())
        return
      case 'user-not-found':
        // 'user-not-found' should never happen since we grab the user from the
        // database in AuthMiddleware.requireLoggedUser.
        res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
        return
      case 'unrecoverable-error':
        res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
        return
      default:
        assertUnreachable(updateUserEmailResult)
    }
  } catch (e) {
    console.error('Unexpected error at AuthController.changePassword:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}
