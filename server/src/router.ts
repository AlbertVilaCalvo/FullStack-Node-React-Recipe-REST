import { Router } from 'express'
import * as RecipeController from './recipe/RecipeController'

export const router = Router()

router.get('/recipes', RecipeController.getAllRecipes)
router.get('/recipes/:recipeId', RecipeController.getRecipe)
