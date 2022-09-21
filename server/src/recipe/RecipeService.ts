import { Recipe, RecipeWithUser } from './Recipe'
import * as RecipeDatabase from './RecipeDatabase'
import { isError } from '../misc/result'
import * as UserDatabase from '../user/UserDatabase'
import { User } from '../user/User'

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
