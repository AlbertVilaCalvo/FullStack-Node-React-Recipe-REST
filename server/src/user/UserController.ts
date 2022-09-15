import { RequestHandler } from 'express'
import { ApiError } from '../misc/ApiError'
import { StatusCode } from '../misc/StatusCode'
import { PublicUser, removeEmailPassword } from './User'
import * as UserDatabase from './UserDatabase'
import { isValidId } from '../misc/validations'
import { isError } from '../misc/result'

/**
 * GET /api/users/:userId
 *
 * curl http://localhost:5000/api/users/1
 */
export const getUser: RequestHandler<
  { userId: string },
  { user: PublicUser } | ApiError,
  undefined
> = async (req, res) => {
  try {
    const userId = Number(req.params.userId)
    if (!isValidId(userId)) {
      res
        .status(StatusCode.NOT_FOUND_404)
        .json(ApiError.userNotFound(req.params.userId))
      return
    }

    const getUserResult = await UserDatabase.getUserById(userId)
    if (isError(getUserResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    } else if (getUserResult === 'user-not-found') {
      res.status(StatusCode.NOT_FOUND_404).json(ApiError.userNotFound(userId))
    } else {
      const publicUser = removeEmailPassword(getUserResult)
      res.json({
        user: publicUser,
      })
    }
  } catch (e) {
    console.error('Unexpected error at UserController.getUser:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}
