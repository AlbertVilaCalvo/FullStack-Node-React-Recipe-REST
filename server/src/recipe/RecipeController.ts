import { RequestHandler } from 'express'
import { Recipe } from './Recipe'
import { StatusCode } from '../misc/StatusCode'

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
