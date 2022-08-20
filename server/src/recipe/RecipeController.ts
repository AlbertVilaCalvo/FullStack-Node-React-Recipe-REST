import { RequestHandler } from 'express'
import { Recipe } from './Recipe'
import { StatusCode } from '../misc/StatusCode'
import { requestFullUrl } from '../misc/util'
import { database } from '../database'

/**
 * GET /api/recipes
 *
 * curl http://localhost:5000/api/recipes
 */
export const getAllRecipes: RequestHandler = async (req, res) => {
  try {
    const result = await database.query<Recipe>('SELECT * FROM recipe')
    res.json({
      recipes: result.rows,
    })
  } catch (error) {
    console.error(`getAllRecipes 'SELECT * FROM recipe' error`, error)
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
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

  try {
    const result = await database.query<Recipe>(
      'SELECT * FROM recipe WHERE id = $1',
      [recipeId]
    )
    if (result.rows[0]) {
      res.json({
        recipe: result.rows[0],
      })
    } else {
      res.status(StatusCode.NOT_FOUND_404).json({
        error: `Recipe with id ${recipeId} not found`,
      })
    }
  } catch (error) {
    console.error(
      `getRecipe 'SELECT * FROM recipe WHERE id = ${recipeId}' error`,
      error
    )
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
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
  try {
    const result = await database.query<Recipe>(
      'SELECT * FROM recipe WHERE id = $1',
      [recipeId]
    )
    if (!result.rows[0]) {
      res.status(StatusCode.NOT_FOUND_404).json({
        error: `Recipe with id ${recipeId} not found`,
      })
      return
    }
    recipe = result.rows[0]
  } catch (error) {
    console.error(
      `updateRecipe 'SELECT * FROM recipe WHERE id = ${recipeId}' error`,
      error
    )
    res.sendStatus(StatusCode.INTERNAL_SERVER_ERROR_500)
    return
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
export const deleteRecipe: RequestHandler = (req, res) => {
  const recipeId = Number(req.params.recipeId)
  if (isNaN(recipeId) || recipeId <= 0) {
    res.sendStatus(StatusCode.NO_CONTENT_204)
    return
  }

  database
    .query('DELETE FROM recipe WHERE id = $1', [recipeId])
    .catch((error) => {
      console.error(
        `deleteRecipe 'DELETE FROM recipe WHERE id = ${recipeId}' error`,
        error
      )
    })
    .finally(() => {
      res.sendStatus(StatusCode.NO_CONTENT_204)
    })
}
