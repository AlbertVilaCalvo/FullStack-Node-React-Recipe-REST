import { z } from 'zod'
import {
  EMAIL_MAX_LENGTH,
  isValidData,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../misc/validations'
import { RequestHandler } from 'express'
import { ApiError } from '../misc/ApiError'
import { StatusCode } from '../misc/StatusCode'
import { User } from '../user/User'
import { checkIfPasswordsMatch } from '../auth/password'
import * as UserDatabase from '../user/UserDatabase'
import { isError } from '../misc/result'

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

    if (!req.user) {
      // This should never happen
      console.error(`Missing req.user at UserController.updateProfile`)
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    }
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

const ChangeEmailBodySchema = z.object({
  new_email: z.string().email().max(EMAIL_MAX_LENGTH),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
})

type ChangeEmailBody = z.infer<typeof ChangeEmailBodySchema>

/**
 * POST /api/my-account/email
 *
 * curl http://localhost:5000/api/my-account/email -H "Content-Type: application/json"
 * -H "Authorization: Bearer auth_token" -d '{"new_email":"a@a.com", "password":"123456"}' -v
 */
export const updateEmail: RequestHandler<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  void | ApiError,
  ChangeEmailBody
> = async (req, res) => {
  try {
    const parsedBody = ChangeEmailBodySchema.safeParse(req.body)

    if (!isValidData(parsedBody)) {
      console.log(`parsedBody.error`, parsedBody.error)
      const firstIssue = parsedBody.error.issues[0]
      const code = firstIssue.code
      const message = `${firstIssue.path[0]} - ${firstIssue.message}`
      res.status(StatusCode.BAD_REQUEST_400).json(new ApiError(code, message))
      return
    }

    const body = parsedBody.data

    if (!req.user) {
      // This should never happen since we set req.user at
      // AuthMiddleware.requireLoggedUser
      console.error(`Missing req.user at AuthController.updateEmail`)
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    }
    const user: User = req.user

    let passwordsMatch: boolean
    try {
      passwordsMatch = await checkIfPasswordsMatch(body.password, user.password)
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
      body.new_email
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
