import { z } from 'zod'
import {
  EMAIL_MAX_LENGTH,
  isValidData,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  toApiError,
} from '../validation/validations'
import { RequestHandler } from 'express'
import { ApiError } from '../misc/ApiError'
import { StatusCode } from '../misc/StatusCode'
import { User } from '../user/User'
import { checkIfPasswordsMatch } from '../auth/password'
import * as UserDatabase from '../user/UserDatabase'
import { isError } from '../misc/result'
import { assertUser } from '../auth/AuthMiddleware'

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
  { name?: string }
> = async (req, res) => {
  try {
    const name = req.body.name
    if (!name) {
      res.status(StatusCode.BAD_REQUEST_400).json(ApiError.nameRequired())
      return
    }

    assertUser(req.user, 'MyAccountController.updateProfile')
    const user: User = req.user

    const updateProfileResult = await UserDatabase.updateUserProfile(
      user.id,
      name
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

const ChangeEmailReqBodySchema = z.object({
  new_email: z.string().email().max(EMAIL_MAX_LENGTH),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
})
type ChangeEmailReqBody = z.infer<typeof ChangeEmailReqBodySchema>

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
    const reqBody: ChangeEmailReqBody = validateBodyResult.data

    assertUser(req.user, 'MyAccountController.updateEmail')
    const user: User = req.user

    let passwordsMatch: boolean
    try {
      passwordsMatch = await checkIfPasswordsMatch(
        reqBody.password,
        user.password
      )
    } catch (error) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    }

    if (!passwordsMatch) {
      res.status(StatusCode.OK_200).json(ApiError.invalidPassword())
      return
    }

    const updateEmailResult = await UserDatabase.updateUserEmail(
      user.id,
      reqBody.new_email
    )
    if (updateEmailResult === 'user-not-found' || isError(updateEmailResult)) {
      // 'user-not-found' should never happen since we grab the user from the
      // database in AuthMiddleware.requireLoggedUser.
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    } else {
      res.sendStatus(StatusCode.NO_CONTENT_204)
    }
  } catch (e) {
    console.error('Unexpected error at AuthController.changePassword:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}
