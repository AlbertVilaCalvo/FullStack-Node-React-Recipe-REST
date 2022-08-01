import { RequestHandler } from 'express'
import { Recipe } from './Recipe'

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
