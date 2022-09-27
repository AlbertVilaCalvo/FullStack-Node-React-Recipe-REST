import { RequestHandler } from 'express'
import {
  Recipe,
  recipeFrontendUrl,
  RecipeSchema,
  RecipeWithUser,
} from './Recipe'
import { ApiError } from '../misc/ApiError'
import { StatusCode } from '../misc/StatusCode'
import * as RecipeDatabase from './RecipeDatabase'
import * as RecipeService from './RecipeService'
import { isValidData, isValidId, toApiError } from '../validation/validations'
import { isError } from '../misc/result'
import { User } from '../user/User'
import { assertUser } from '../auth/AuthMiddleware'
import { assertUnreachable } from '../misc/assertUnreachable'

/**
 * GET /api/recipes
 *
 * curl http://localhost:5000/api/recipes
 */
export const getAllRecipes: RequestHandler<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  { recipes: Recipe[] },
  undefined
> = async (req, res) => {
  try {
    const getRecipesResult = await RecipeDatabase.getAllRecipes()
    if (isError(getRecipesResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    } else {
      res.json({
        recipes: getRecipesResult,
      })
    }
  } catch (e) {
    console.error('Unexpected error at RecipeController.getAllRecipes:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}

/**
 * GET /api/recipes/:recipeId
 *
 * curl http://localhost:5000/api/recipes/1
 */
export const getRecipe: RequestHandler<
  { recipeId: string },
  { recipe: RecipeWithUser } | ApiError,
  undefined
> = async (req, res) => {
  try {
    const recipeId = Number(req.params.recipeId)
    const getRecipeResult = await RecipeService.getRecipeById(recipeId)
    if (getRecipeResult === 'recipe-not-found') {
      res
        .status(StatusCode.NOT_FOUND_404)
        .json(ApiError.recipeNotFound(recipeId))
    } else if (getRecipeResult === 'unrecoverable-error') {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    } else {
      res.json({
        recipe: getRecipeResult,
      })
    }
  } catch (e) {
    console.error('Unexpected error at RecipeController.getRecipe:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}

const CreateRecipeRequestSchema = RecipeSchema.omit({
  id: true,
  user_id: true,
})
type CreateRecipeRequest = Omit<Recipe, 'id' | 'user_id'>
// We could also do:
// type CreateRecipeRequest = z.infer<typeof CreateRecipeRequestSchema>

/**
 * POST /api/recipes
 *
 * curl http://localhost:5000/api/recipes -H "Content-Type: application/json"
 * -H "Authorization: Bearer auth_token" -d '{"title":"Salad", "cooking_time_minutes":22}'
 */
export const createRecipe: RequestHandler<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  { id: number } | ApiError,
  CreateRecipeRequest
> = async (req, res) => {
  try {
    const validateBodyResult = CreateRecipeRequestSchema.safeParse(req.body)
    if (!isValidData(validateBodyResult)) {
      const apiError = toApiError(validateBodyResult.error)
      res.status(StatusCode.BAD_REQUEST_400).json(apiError)
      return
    }
    const requestBody: CreateRecipeRequest = validateBodyResult.data

    assertUser(req.user, 'RecipeController.createRecipe')
    const user: User = req.user

    const insertResult = await RecipeDatabase.insertNewRecipe(
      user.id,
      requestBody.title,
      requestBody.cooking_time_minutes
    )
    if (isError(insertResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    } else {
      const recipe: Recipe = insertResult
      res
        .status(StatusCode.CREATED_201)
        .location(recipeFrontendUrl(recipe.id))
        .json({ id: recipe.id })
    }
  } catch (e) {
    console.error('Unexpected error at RecipeController.createRecipe:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}

const UpdateRecipeRequestSchema = CreateRecipeRequestSchema.partial()
type UpdateRecipeRequest = Partial<CreateRecipeRequest>

/**
 * PATCH /api/recipes/:recipeId
 *
 * curl http://localhost:5000/api/recipes/1 -X PATCH -H "Content-Type: application/json"
 * -H "Authorization: Bearer auth_token" -d '{"title":"Something"}'
 */
export const updateRecipe: RequestHandler<
  { recipeId: string },
  { recipe: Recipe } | ApiError,
  UpdateRecipeRequest
> = async (req, res) => {
  try {
    const validateBodyResult = UpdateRecipeRequestSchema.safeParse(req.body)
    if (!isValidData(validateBodyResult)) {
      const apiError = toApiError(validateBodyResult.error)
      res.status(StatusCode.BAD_REQUEST_400).json(apiError)
      return
    }
    const requestBody: UpdateRecipeRequest = validateBodyResult.data

    const recipeId = Number(req.params.recipeId)

    assertUser(req.user, 'RecipeController.updateRecipe')
    const user: User = req.user

    const updateRecipeResult = await RecipeService.updateRecipe(
      recipeId,
      requestBody,
      user
    )
    if (updateRecipeResult === 'recipe-not-found') {
      res
        .status(StatusCode.NOT_FOUND_404)
        .json(ApiError.recipeNotFound(recipeId))
    } else if (updateRecipeResult === 'user-not-owner') {
      res.sendStatus(StatusCode.FORBIDDEN_403)
    } else if (updateRecipeResult === 'unrecoverable-error') {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    } else {
      const recipe: Recipe = updateRecipeResult
      res.status(StatusCode.OK_200).json({ recipe: recipe })
    }
  } catch (e) {
    console.error('Unexpected error at RecipeController.updateRecipe:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}

/**
 * DELETE /api/recipes/:recipeId
 *
 * curl http://localhost:5000/api/recipes/1 -X DELETE -H "Authorization: Bearer auth_token" -v
 *
 * Note that it returns 204 'No Content' if the recipe doesn't exist.
 */
export const deleteRecipe: RequestHandler<
  { recipeId: string },
  undefined,
  undefined
> = async (req, res) => {
  try {
    const recipeId = Number(req.params.recipeId)
    if (!isValidId(recipeId)) {
      res.sendStatus(StatusCode.NO_CONTENT_204)
      return
    }

    assertUser(req.user, 'RecipeController.deleteRecipe')
    const user: User = req.user

    // To validate that the logged user is the recipe owner we could grab the
    // recipe from the database with RecipeDatabase.getRecipeById (like we do
    // above in updateRecipe()) and then check user.id === recipe.user_id,
    // but this requires hitting the database twice (one time to get the
    // recipe and another to delete it). Instead, we do a DELETE with the user
    // id, which will fail to delete the recipe if the user is not the owner.

    const deleteRecipeResult = await RecipeDatabase.deleteRecipe(
      recipeId,
      user.id
    )
    if (isError(deleteRecipeResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    } else if (deleteRecipeResult === 'user-not-owner-or-recipe-not-found') {
      res.sendStatus(StatusCode.FORBIDDEN_403)
      return
    } else if (deleteRecipeResult === 'success') {
      res.sendStatus(StatusCode.NO_CONTENT_204)
      return
    }
    assertUnreachable(deleteRecipeResult)
  } catch (e) {
    console.error('Unexpected error at RecipeController.deleteRecipe:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}
