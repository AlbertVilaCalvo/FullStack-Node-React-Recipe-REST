import { Router } from 'express'
import * as AuthController from './auth/AuthController'
import * as UserController from './user/UserController'
import * as MyAccountController from './user/MyAccountController'
import * as RecipeController from './recipe/RecipeController'
import { AuthMiddleware } from './auth/AuthMiddleware'
import { unexpectedErrorHandler } from './misc/unexpectedErrorHandler'
import { validateParamRecipeId } from './validation/validateParamMiddleware'

export const router = Router()

router.post('/auth/register', AuthController.register)
router.post('/auth/login', AuthController.login)

router.put(
  '/my-account/profile',
  AuthMiddleware.requireLoggedUser,
  MyAccountController.updateProfile
)
router.put(
  '/my-account/email',
  AuthMiddleware.requireLoggedUser,
  MyAccountController.updateEmail
)
router.put(
  '/my-account/password',
  AuthMiddleware.requireLoggedUser,
  MyAccountController.updatePassword
)
router.post(
  '/my-account/delete',
  AuthMiddleware.requireLoggedUser,
  MyAccountController.deleteAccount
)

router.get('/users/:userId', UserController.getUser)

router.get('/recipes', RecipeController.getAllRecipes)
router.get(
  '/recipes/:recipeId',
  validateParamRecipeId,
  RecipeController.getRecipe
)
router.post(
  '/recipes',
  AuthMiddleware.requireLoggedUser,
  RecipeController.createRecipe
)
router.patch(
  '/recipes/:recipeId',
  validateParamRecipeId,
  AuthMiddleware.requireLoggedUser,
  RecipeController.updateRecipe
)
router.delete(
  '/recipes/:recipeId',
  AuthMiddleware.requireLoggedUser,
  RecipeController.deleteRecipe
)

router.use(unexpectedErrorHandler)
