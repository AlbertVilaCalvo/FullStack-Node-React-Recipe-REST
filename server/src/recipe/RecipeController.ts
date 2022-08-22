import { RequestHandler } from 'express'
import { Recipe } from './Recipe'
import { StatusCode } from '../misc/StatusCode'
import { requestFullUrl } from '../misc/util'
import { database } from '../database'
import * as RecipeDatabase from './RecipeDatabase'

/**
 * GET /api/recipes
 *
 * curl http://localhost:5000/api/recipes
 */
export const getAllRecipes: RequestHandler = async (req, res) => {
  const getRecipesResult = await RecipeDatabase.getAllRecipes()
  if (getRecipesResult instanceof Error) {
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
  } else if (getRecipeResult instanceof Error) {
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
export const createRecipe: RequestHandler = (req, res) => {
  // TODO validate title length and 0 < cooking_time_minutes <= 3*24*60
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

  database
    .query(
      'INSERT INTO recipe (title, cooking_time_minutes) VALUES($1, $2) RETURNING *',
      [title, cooking_time_minutes]
    )
    .then((result) => {
      const recipe: Recipe = result.rows[0]
      res
        .status(StatusCode.CREATED_201)
        .location(`${requestFullUrl(req)}/${recipe.id}`)
        .json({ id: recipe.id })
    })
    .catch((error) => {
      console.error(`createRecipe INSERT error`, error)
      res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    })
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
  } else if (getRecipeResult instanceof Error) {
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    return
  } else {
    recipe = getRecipeResult
  }

  if (req.body.title) {
    recipe.title = req.body.title
  }
  if (req.body.cooking_time_minutes) {
    recipe.cooking_time_minutes = req.body.cooking_time_minutes
  }

  try {
    const result = await database.query(
      'UPDATE recipe SET title = $1, cooking_time_minutes = $2 WHERE id = $3 RETURNING *',
      [recipe.title, recipe.cooking_time_minutes, recipe.id]
    )
    res.status(StatusCode.OK_200).json({ recipe: result.rows[0] })
    return
  } catch (error) {
    console.error(`updateRecipe UPDATE error`, error)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    return
  }
}

/**
 * DELETE /api/recipes/:recipeId
 *
 * curl http://localhost:5000/api/recipes/1 -X DELETE
 */
export const deleteRecipe: RequestHandler = async (req, res) => {
  const recipeId = Number(req.params.recipeId)
  if (isNaN(recipeId) || recipeId <= 0) {
    res.sendStatus(StatusCode.NO_CONTENT_204)
    return
  }

  await RecipeDatabase.deleteRecipe(recipeId)
  res.sendStatus(StatusCode.NO_CONTENT_204)
}
