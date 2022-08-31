import { Router } from 'express'
import * as AuthController from './auth/AuthController'
import * as RecipeController from './recipe/RecipeController'
import * as AuthMiddleware from './auth/AuthMiddleware'

export const router = Router()

router.post('/auth/register', AuthController.register)
router.post('/auth/login', AuthController.login)

router.get('/recipes', RecipeController.getAllRecipes)
router.get('/recipes/:recipeId', RecipeController.getRecipe)
router.post(
  '/recipes',
  AuthMiddleware.requireLoggedUser,
  RecipeController.createRecipe
)
router.patch(
  '/recipes/:recipeId',
  AuthMiddleware.requireLoggedUser,
  RecipeController.updateRecipe
)
router.delete(
  '/recipes/:recipeId',
  AuthMiddleware.requireLoggedUser,
  RecipeController.deleteRecipe
)
