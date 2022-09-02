import { Request, RequestHandler } from 'express'
import { Recipe, RecipeWithOwner } from './Recipe'
import { ApiError } from '../misc/ApiError'
import { StatusCode } from '../misc/StatusCode'
import { requestFullUrl } from '../misc/util'
import * as RecipeDatabase from './RecipeDatabase'
import { isError } from '../misc/result'
import { User } from '../user/User'
import { getAuthTokenPayloadFromHeader } from '../auth/authtoken'

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
  { recipe: RecipeWithOwner } | ApiError,
  undefined
> = async (req, res) => {
  try {
    const recipeId = Number(req.params.recipeId)
    if (isNaN(recipeId) || recipeId <= 0) {
      res.sendStatus(StatusCode.NOT_FOUND_404)
      return
    }

    const getRecipeResult = await RecipeDatabase.getRecipeById(recipeId)
    if (getRecipeResult === 'recipe-not-found') {
      res
        .status(StatusCode.NOT_FOUND_404)
        .json(ApiError.recipeNotFound(recipeId))
    } else if (isError(getRecipeResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    } else {
      const recipe: Recipe = getRecipeResult
      const getPayloadResult = getAuthTokenPayloadFromHeader(req.headers)
      const userIsOwner = isError(getPayloadResult)
        ? false
        : getPayloadResult.uid === recipe.user_id
      const recipeWithOwner: RecipeWithOwner = {
        ...recipe,
        user_is_owner: userIsOwner,
      }
      res.json({
        recipe: recipeWithOwner,
      })
    }
  } catch (e) {
    console.error('Unexpected error at RecipeController.getRecipe:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}

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
  Partial<Omit<Recipe, 'id'>>
> = async (req, res) => {
  try {
    // TODO validate title type string and length <= 255
    // TODO validate cooking_time_minutes type number and length 0 > 0 and <= 3*24*60
    const title = req.body.title
    if (!title) {
      res.status(StatusCode.BAD_REQUEST_400).json(ApiError.titleRequired())
      return
    }
    const cooking_time_minutes = req.body.cooking_time_minutes
    if (!cooking_time_minutes) {
      res
        .status(StatusCode.BAD_REQUEST_400)
        .json(ApiError.cookingTimeRequired())
      return
    }

    if (!req.user) {
      // This should never happen
      console.error(`Missing req.user at updateRecipe`)
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    }
    const user: User = req.user

    const insertResult = await RecipeDatabase.insertNewRecipe(
      user.id,
      title,
      cooking_time_minutes
    )
    if (isError(insertResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    } else {
      const recipe: Recipe = insertResult
      res
        .status(StatusCode.CREATED_201)
        .location(`${requestFullUrl(req as unknown as Request)}/${recipe.id}`)
        .json({ id: recipe.id })
    }
  } catch (e) {
    console.error('Unexpected error at RecipeController.createRecipe:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}

/**
 * PATCH /api/recipes/:recipeId
 *
 * curl http://localhost:5000/api/recipes/1 -X PATCH -H "Content-Type: application/json"
 * -H "Authorization: Bearer auth_token" -d '{"title":"Something"}'
 */
export const updateRecipe: RequestHandler<
  { recipeId: string },
  { recipe: Recipe } | ApiError,
  Partial<Omit<Recipe, 'id'>>
> = async (req, res) => {
  try {
    const recipeId = Number(req.params.recipeId)
    if (isNaN(recipeId) || recipeId <= 0) {
      res.sendStatus(StatusCode.NOT_FOUND_404)
      return
    }

    let recipe: Recipe
    const getRecipeResult = await RecipeDatabase.getRecipeById(recipeId)
    if (getRecipeResult === 'recipe-not-found') {
      res
        .status(StatusCode.NOT_FOUND_404)
        .json(ApiError.recipeNotFound(recipeId))
      return
    } else if (isError(getRecipeResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    } else {
      recipe = getRecipeResult
    }

    // Validate that the logged user is the recipe owner
    if (!req.user) {
      // This should never happen
      console.error(`Missing req.user at updateRecipe`)
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    }
    const user: User = req.user
    if (user.id !== recipe.user_id) {
      res.sendStatus(StatusCode.FORBIDDEN_403)
      return
    }

    // TODO validate title type string and length <= 255
    // TODO validate cooking_time_minutes type number and length 0 > 0 and <= 3*24*60
    if (req.body.title) {
      recipe.title = req.body.title
    }
    if (req.body.cooking_time_minutes) {
      recipe.cooking_time_minutes = req.body.cooking_time_minutes
    }

    const updateRecipeResult = await RecipeDatabase.updateRecipe(recipe)
    if (isError(updateRecipeResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    } else {
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
    if (isNaN(recipeId) || recipeId <= 0) {
      res.sendStatus(StatusCode.NO_CONTENT_204)
      return
    }

    // Validate that the logged user is the recipe owner
    if (!req.user) {
      // This should never happen
      console.error(`Missing req.user at updateRecipe`)
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    }
    const user: User = req.user

    // Here we could grab the recipe from the database with
    // RecipeDatabase.getRecipeById (like we do above in updateRecipe()) and then
    // validate that the user is the owner of the recipe, but this would mean
    // hitting the database twice (one time to get the recipe and another to
    // delete it). Instead, we do a DELETE with the user id, which will fail to
    // delete the recipe if the user is not the owner.

    const deleteRecipeResult = await RecipeDatabase.deleteRecipe(
      recipeId,
      user.id
    )
    if (isError(deleteRecipeResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    } else if (deleteRecipeResult === 'user-not-owner') {
      res.sendStatus(StatusCode.FORBIDDEN_403)
    } else {
      res.sendStatus(StatusCode.NO_CONTENT_204)
    }
  } catch (e) {
    console.error('Unexpected error at RecipeController.deleteRecipe:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}
