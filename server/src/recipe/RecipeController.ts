import { RequestHandler } from 'express'
import { Recipe } from './Recipe'
import { StatusCode } from '../misc/StatusCode'
import { requestFullUrl } from '../misc/util'
import * as RecipeDatabase from './RecipeDatabase'
import { isError } from '../misc/result'

/**
 * GET /api/recipes
 *
 * curl http://localhost:5000/api/recipes
 */
export const getAllRecipes: RequestHandler = async (req, res) => {
  const getRecipesResult = await RecipeDatabase.getAllRecipes()
  if (isError(getRecipesResult)) {
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  } else {
    res.json({
      recipes: getRecipesResult,
    })
  }
}

/**
 * GET /api/recipes/:recipeId
 *
 * curl http://localhost:5000/api/recipes/1
 */
export const getRecipe: RequestHandler = async (req, res) => {
  const recipeId = Number(req.params.recipeId)
  if (isNaN(recipeId) || recipeId <= 0) {
    res.sendStatus(StatusCode.NOT_FOUND_404)
    return
  }

  const getRecipeResult = await RecipeDatabase.getRecipeById(recipeId)
  if (getRecipeResult === 'recipe-not-found') {
    res.status(StatusCode.NOT_FOUND_404).json({
      error: `Recipe with id ${recipeId} not found`,
    })
  } else if (isError(getRecipeResult)) {
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  } else {
    res.json({
      recipe: getRecipeResult,
    })
  }
}

/**
 * POST /api/recipes
 *
 * curl http://localhost:5000/api/recipes -H "Content-Type: application/json" -d '{"title":"Salad", "cooking_time_minutes":22}'
 */
export const createRecipe: RequestHandler = async (req, res) => {
  // TODO validate title type string and length <= 255
  // TODO validate cooking_time_minutes type number and length 0 > 0 and <= 3*24*60
  const title = req.body.title
  if (!title) {
    res.status(StatusCode.BAD_REQUEST_400).json({ error: 'title is missing' })
    return
  }
  const cooking_time_minutes = req.body.cooking_time_minutes
  if (!cooking_time_minutes) {
    res
      .status(StatusCode.BAD_REQUEST_400)
      .json({ error: 'cooking_time_minutes is missing' })
    return
  }

  const insertResult = await RecipeDatabase.insertNewRecipe(
    title,
    cooking_time_minutes
  )
  if (isError(insertResult)) {
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  } else {
    const recipe: Recipe = insertResult
    res
      .status(StatusCode.CREATED_201)
      .location(`${requestFullUrl(req)}/${recipe.id}`)
      .json({ id: recipe.id })
  }
}

/**
 * PATCH /api/recipes/:recipeId
 *
 * curl http://localhost:5000/api/recipes/1 -X PATCH -H "Content-Type: application/json" -d '{"title":"Something"}'
 */
export const updateRecipe: RequestHandler = async (req, res) => {
  const recipeId = Number(req.params.recipeId)
  if (isNaN(recipeId) || recipeId <= 0) {
    res.sendStatus(StatusCode.NOT_FOUND_404)
    return
  }

  let recipe: Recipe
  const getRecipeResult = await RecipeDatabase.getRecipeById(recipeId)
  if (getRecipeResult === 'recipe-not-found') {
    res.status(StatusCode.NOT_FOUND_404).json({
      error: `Recipe with id ${recipeId} not found`,
    })
    return
  } else if (isError(getRecipeResult)) {
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    return
  } else {
    recipe = getRecipeResult
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
}

/**
 * DELETE /api/recipes/:recipeId
 *
 * curl http://localhost:5000/api/recipes/1 -X DELETE -v
 *
 * Note that it returns 204 'No Content' if the recipe doesn't exist.
 */
export const deleteRecipe: RequestHandler = async (req, res) => {
  const recipeId = Number(req.params.recipeId)
  if (isNaN(recipeId) || recipeId <= 0) {
    res.sendStatus(StatusCode.NO_CONTENT_204)
    return
  }

  const deleteRecipeResult = await RecipeDatabase.deleteRecipe(recipeId)
  if (isError(deleteRecipeResult)) {
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
  } else {
    res.sendStatus(StatusCode.NO_CONTENT_204)
  }
}
