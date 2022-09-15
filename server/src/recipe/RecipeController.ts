import { Request, RequestHandler } from 'express'
import { Recipe, RecipeSchema, RecipeWithUser } from './Recipe'
import { ApiError } from '../misc/ApiError'
import { StatusCode } from '../misc/StatusCode'
import { requestFullUrl } from '../misc/util'
import * as RecipeDatabase from './RecipeDatabase'
import * as UserDatabase from '../user/UserDatabase'
import { isValidData, isValidId, toApiError } from '../validation/validations'
import { isError } from '../misc/result'
import { User } from '../user/User'
import { assertUser } from '../auth/AuthMiddleware'

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

    const getRecipeResult = await RecipeDatabase.getRecipeById(recipeId)
    if (getRecipeResult === 'recipe-not-found') {
      res
        .status(StatusCode.NOT_FOUND_404)
        .json(ApiError.recipeNotFound(recipeId))
      return
    } else if (isError(getRecipeResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    }

    const recipe: Recipe = getRecipeResult
    const getUserResult = await UserDatabase.getUserById(recipe.user_id)
    if (isError(getUserResult)) {
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    } else if (getUserResult === 'user-not-found') {
      // This should never happen. If it happens then there's a recipe with a
      // user_id of a user that does not exist!
      console.error(
        `RecipeController.getRecipe - found recipe owned by a user that does not exist`,
        recipe
      )
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
      return
    }

    const recipeOwner: User = getUserResult
    const recipeWithUser: RecipeWithUser = {
      ...recipe,
      user: {
        id: recipeOwner.id,
        name: recipeOwner.name,
      },
    }
    res.json({
      recipe: recipeWithUser,
    })
  } catch (e) {
    console.error('Unexpected error at RecipeController.getRecipe:', e)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  }
}

const CreateRecipeReqBodySchema = RecipeSchema.omit({
  id: true,
  user_id: true,
})
type CreateRecipeReqBody = Omit<Recipe, 'id' | 'user_id'>
// We could also do:
// type CreateRecipeReqBody = z.infer<typeof CreateRecipeReqBodySchema>

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
  CreateRecipeReqBody
> = async (req, res) => {
  try {
    const validateBodyResult = CreateRecipeReqBodySchema.safeParse(req.body)
    if (!isValidData(validateBodyResult)) {
      console.log(`parsedBody.error`, validateBodyResult.error)
      const apiError = toApiError(validateBodyResult.error)
      res.status(StatusCode.BAD_REQUEST_400).json(apiError)
      return
    }
    const reqBody: CreateRecipeReqBody = validateBodyResult.data

    assertUser(req.user, 'RecipeController.createRecipe')
    const user: User = req.user

    const insertResult = await RecipeDatabase.insertNewRecipe(
      user.id,
      reqBody.title,
      reqBody.cooking_time_minutes
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

const UpdateRecipeReqBodySchema = CreateRecipeReqBodySchema.partial()
type UpdateRecipeReqBody = Partial<CreateRecipeReqBody>

/**
 * PATCH /api/recipes/:recipeId
 *
 * curl http://localhost:5000/api/recipes/1 -X PATCH -H "Content-Type: application/json"
 * -H "Authorization: Bearer auth_token" -d '{"title":"Something"}'
 */
export const updateRecipe: RequestHandler<
  { recipeId: string },
  { recipe: Recipe } | ApiError,
  UpdateRecipeReqBody
> = async (req, res) => {
  try {
    const validateBodyResult = UpdateRecipeReqBodySchema.safeParse(req.body)
    if (!isValidData(validateBodyResult)) {
      const apiError = toApiError(validateBodyResult.error)
      res.status(StatusCode.BAD_REQUEST_400).json(apiError)
      return
    }
    const reqBody: UpdateRecipeReqBody = validateBodyResult.data

    const recipeId = Number(req.params.recipeId)

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

    assertUser(req.user, 'RecipeController.updateRecipe')
    const user: User = req.user

    // Validate that the logged user is the recipe owner
    if (user.id !== recipe.user_id) {
      res.sendStatus(StatusCode.FORBIDDEN_403)
      return
    }

    if (reqBody.title) {
      recipe.title = reqBody.title
    }
    if (reqBody.cooking_time_minutes) {
      recipe.cooking_time_minutes = reqBody.cooking_time_minutes
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
