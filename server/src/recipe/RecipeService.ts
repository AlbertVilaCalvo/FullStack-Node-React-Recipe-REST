import { Recipe, RecipeWithUser } from './Recipe'
import { User } from '../user/User'
import * as RecipeDatabase from './RecipeDatabase'
import * as UserDatabase from '../user/UserDatabase'
import { isError } from '../misc/result'

export async function getRecipeById(
  recipeId: number
): Promise<RecipeWithUser | 'recipe-not-found' | 'unrecoverable-error'> {
  const getRecipeResult = await RecipeDatabase.getRecipeById(recipeId)
  if (getRecipeResult === 'recipe-not-found') {
    return 'recipe-not-found'
  } else if (isError(getRecipeResult)) {
    return 'unrecoverable-error'
  }

  const recipe: Recipe = getRecipeResult
  const getUserResult = await UserDatabase.getUserById(recipe.user_id)
  if (isError(getUserResult)) {
    return 'unrecoverable-error'
  } else if (getUserResult === 'user-not-found') {
    // This should never happen. If it happens then there's a recipe with a
    // user_id of a user that does not exist!
    console.error(
      `RecipeController.getRecipe - found recipe owned by a user that does not exist`,
      recipe
    )
    return 'unrecoverable-error'
  }

  const recipeOwner: User = getUserResult
  const recipeWithUser: RecipeWithUser = {
    ...recipe,
    user: {
      id: recipeOwner.id,
      name: recipeOwner.name,
    },
  }
  return recipeWithUser
}

type RecipeData = Partial<Omit<Recipe, 'id' | 'user_id'>>

/**
 * @param recipeId URL parameter
 * @param recipeData data from the request body
 * @param user the user trying to update the recipe
 */
export async function updateRecipe(
  recipeId: number,
  recipeData: RecipeData,
  user: User
): Promise<
  Recipe | 'recipe-not-found' | 'user-not-owner' | 'unrecoverable-error'
> {
  let recipe: Recipe
  const getRecipeResult = await RecipeDatabase.getRecipeById(recipeId)
  if (getRecipeResult === 'recipe-not-found') {
    return 'recipe-not-found'
  } else if (isError(getRecipeResult)) {
    return 'unrecoverable-error'
  } else {
    recipe = getRecipeResult
  }

  // Validate that the logged user is the recipe owner
  if (user.id !== recipe.user_id) {
    return 'user-not-owner'
  }

  if (recipeData.title) {
    recipe.title = recipeData.title
  }
  if (recipeData.cooking_time_minutes) {
    recipe.cooking_time_minutes = recipeData.cooking_time_minutes
  }

  const updateRecipeResult = await RecipeDatabase.updateRecipe(recipe)
  if (updateRecipeResult === 'recipe-not-found') {
    // This should not happen because it will fail above at
    // RecipeDatabase.getRecipeById for the same reason before reaching here
    return 'recipe-not-found'
  } else if (isError(updateRecipeResult)) {
    return 'unrecoverable-error'
  } else {
    // success
    return recipe
  }
}
