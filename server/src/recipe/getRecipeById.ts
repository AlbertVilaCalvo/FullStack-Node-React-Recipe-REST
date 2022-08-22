import { Recipe } from './Recipe'
import { database } from '../database'

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
      console.info(`getRecipeById - Recipe with id ${recipeId} not found`)
      return 'recipe-not-found'
    }
  } catch (error) {
    console.error(
      `getRecipeById with id = ${recipeId} error. error instanceof Error? ${
        error instanceof Error
      }.`,
      error
    )
    if (error instanceof Error) {
      return error
    } else {
      return Error('Unknown error')
    }
  }
}
