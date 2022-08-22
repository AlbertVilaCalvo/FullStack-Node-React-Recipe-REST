import { Recipe } from './Recipe'
import { database } from '../database'

export async function getAllRecipes(): Promise<Recipe[] | Error> {
  try {
    const result = await database.query<Recipe>('SELECT * FROM recipe')
    const recipes: Recipe[] = result.rows
    return recipes
  } catch (error) {
    console.error(`getAllRecipes 'SELECT * FROM recipe' error`, error)
    if (error instanceof Error) {
      return error
    } else {
      return Error('Unknown error')
    }
  }
}
