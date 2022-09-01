import { Recipe } from './Recipe'
import { database } from '../database'
import { toError } from '../misc/util'

export async function getAllRecipes(): Promise<Recipe[] | Error> {
  try {
    const result = await database.query<Recipe>('SELECT * FROM recipe')
    const recipes: Recipe[] = result.rows
    return recipes
  } catch (error) {
    console.error(
      `RecipeDatabase - getAllRecipes 'SELECT * FROM recipe' error`,
      error
    )
    return toError(error, 'RecipeDatabase - getAllRecipes')
  }
}

export async function getRecipeById(
  recipeId: number
): Promise<Recipe | 'recipe-not-found' | Error> {
  try {
    const result = await database.query<Recipe>(
      'SELECT * FROM recipe WHERE id = $1',
      [recipeId]
    )
    if (result.rows[0]) {
      const recipe: Recipe = result.rows[0]
      return recipe
    } else {
      console.info(
        `RecipeDatabase - getRecipeById - Recipe with id ${recipeId} not found`
      )
      return 'recipe-not-found'
    }
  } catch (error) {
    console.error(
      `RecipeDatabase - getRecipeById with id = ${recipeId} error`,
      error
    )
    return toError(error, 'RecipeDatabase - getRecipeById')
  }
}

export async function insertNewRecipe(
  userId: number,
  title: string,
  cooking_time_minutes: number
): Promise<Recipe | Error> {
  return database
    .query(
      'INSERT INTO recipe (user_id, title, cooking_time_minutes) VALUES($1, $2, $3) RETURNING *',
      [userId, title, cooking_time_minutes]
    )
    .then((result) => {
      const recipe: Recipe = result.rows[0]
      return recipe
    })
    .catch((error) => {
      console.error(`RecipeDatabase - insertNewRecipe error`, error)
      return toError(error, 'RecipeDatabase - insertNewRecipe')
    })
}

export async function updateRecipe(recipe: Recipe): Promise<void | Error> {
  try {
    await database.query(
      'UPDATE recipe SET title = $1, cooking_time_minutes = $2 WHERE id = $3',
      [recipe.title, recipe.cooking_time_minutes, recipe.id]
    )
  } catch (error) {
    console.error(`RecipeDatabase - updateRecipe error`, error)
    return toError(error, 'RecipeDatabase - updateRecipe')
  }
}

/**
 * Will fail to delete the recipe if the user is not the recipe owner, returning
 * 'user-not-owner'.
 *
 * @param recipeId the id of the recipe.
 * @param userId the id of the user owner of the recipe.
 */
export async function deleteRecipe(
  recipeId: number,
  userId: number
): Promise<void | 'user-not-owner' | Error> {
  try {
    const result = await database.query(
      'DELETE FROM recipe WHERE id = $1 AND user_id = $2',
      [recipeId, userId]
    )
    console.log(`RecipeDatabase - deleteRecipe result`, result)
    if (result.rowCount === 0) {
      // No recipe was deleted because the given userId does not match the
      // recipe's user_id. In other words, the user is not the owner of the
      // recipe that we tried to delete, thus no recipe was deleted.
      return 'user-not-owner'
    }
  } catch (error) {
    console.error(
      `RecipeDatabase - deleteRecipe 'DELETE FROM recipe WHERE id = ${recipeId}' error`,
      error
    )
    return toError(error, 'RecipeDatabase - deleteRecipe')
  }
}
