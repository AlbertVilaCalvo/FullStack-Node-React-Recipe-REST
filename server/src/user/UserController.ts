import { RequestHandler } from 'express'
import { ApiError } from '../misc/ApiError'
import { StatusCode } from '../misc/StatusCode'
import { User } from './User'
import * as UserDatabase from './UserDatabase'
import { isError } from '../misc/result'

/**
 * PUT /api/me/profile
 *
 * Update the logged user's name.
 *
 * curl http://localhost:5000/api/me/profile -X PUT -H "Content-Type: application/json"
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
    if (isError(updateProfileResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    } else {
      res.sendStatus(StatusCode.NO_CONTENT_204)
    }
  } catch (e) {
    console.error('Unexpected error at UserController.updateProfile:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}
