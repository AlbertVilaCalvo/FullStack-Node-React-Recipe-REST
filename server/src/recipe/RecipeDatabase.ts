import { Recipe } from './Recipe'
import { database } from '../database'

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  } else {
    console.error('RecipeDatabase - Not an instanceof error', error)
    return Error('Unknown error')
  }
}

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
    return toError(error)
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
    return toError(error)
  }
}

export async function insertNewRecipe(
  title: string,
  cooking_time_minutes: number
): Promise<Recipe | Error> {
  return database
    .query(
      'INSERT INTO recipe (title, cooking_time_minutes) VALUES($1, $2) RETURNING *',
      [title, cooking_time_minutes]
    )
    .then((result) => {
      const recipe: Recipe = result.rows[0]
      return recipe
    })
    .catch((error) => {
      console.error(`RecipeDatabase - insertNewRecipe error`, error)
      return toError(error)
    })
}

export async function deleteRecipe(recipeId: number): Promise<void | Error> {
  try {
    await database.query('DELETE FROM recipe WHERE id = $1', [recipeId])
  } catch (error) {
    console.error(
      `RecipeDatabase - deleteRecipe 'DELETE FROM recipe WHERE id = ${recipeId}' error`,
      error
    )
    return toError(error)
  }
}
