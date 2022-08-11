import { RequestHandler } from 'express'
import { Recipe } from './Recipe'
import { StatusCode } from '../misc/StatusCode'
import { requestFullUrl } from '../misc/util'

const recipes: Recipe[] = [
  {
    id: 1,
    title: 'Escalivada',
    cookingTimeMinutes: 60,
  },
  {
    id: 2,
    title: 'Amanida',
    cookingTimeMinutes: 20,
  },
]

/**
 * GET /api/recipes
 *
 * curl http://localhost:5000/api/recipes
 */
export const getAllRecipes: RequestHandler = (req, res) => {
  res.json({
    recipes: recipes,
  })
}

/**
 * GET /api/recipes/:recipeId
 *
 * curl http://localhost:5000/api/recipes/1
 */
export const getRecipe: RequestHandler = (req, res) => {
  const recipeId = Number(req.params.recipeId)
  const recipe = recipes.find((recipe) => recipe.id === recipeId)
  if (recipe) {
    res.json({
      recipe: recipe,
    })
  } else {
    res.status(StatusCode.NOT_FOUND_404).json({
      error: `Recipe with id ${recipeId} not found`,
    })
  }
}

/**
 * POST /api/recipes
 *
 * curl http://localhost:5000/api/recipes -H "Content-Type: application/json" -d '{"title":"Something", "cookingTimeMinutes":22}'
 */
export const createRecipe: RequestHandler = (req, res) => {
  const lastRecipeId = recipes[recipes.length - 1].id
  const recipeId = lastRecipeId + 1
  const recipe: Recipe = {
    id: recipeId,
    title: req.body.title,
    cookingTimeMinutes: req.body.cookingTimeMinutes,
  }
  recipes.push(recipe)
  res
    .status(StatusCode.CREATED_201)
    .location(`${requestFullUrl(req)}/${recipeId}`)
    .json({ id: recipeId })
}
