import { RequestHandler } from 'express'
import { StatusCode } from '../misc/StatusCode'
import { ApiError } from '../misc/ApiError'
import { isValidId } from './validations'

/**
 * Middleware that ensures that the param recipeId is valid.
 * Use it for routes like '/recipes/:recipeId'.
 */
export const validateParamRecipeId: RequestHandler = async (req, res, next) => {
  const recipeId = Number(req.params.recipeId)
  if (!isValidId(recipeId)) {
    res
      .status(StatusCode.NOT_FOUND_404)
      .json(ApiError.recipeNotFound(req.params.recipeId))
    return
  }
  next()
}
