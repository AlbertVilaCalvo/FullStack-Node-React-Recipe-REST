import { Recipe } from './Recipe'
import { httpClient } from '../httpClient'
import { AxiosResponse } from 'axios'

export function getAllRecipes(): Promise<Recipe[]> {
  return httpClient
    .get(`/recipes`)
    .then((response: AxiosResponse<{ recipes: Recipe[] }>) => {
      return response.data.recipes
    })
}

export function getRecipe(recipeId: number): Promise<Recipe> {
  return httpClient
    .get(`/recipes/${recipeId}`)
    .then((response: AxiosResponse<{ recipe: Recipe }>) => {
      return response.data.recipe
    })
}

export function createRecipe(
  data: Omit<Recipe, 'id'>
): Promise<{ recipeId: number }> {
  return httpClient
    .post(`/recipes/`, data)
    .then((response: AxiosResponse<{ id: number }>) => {
      return { recipeId: response.data.id }
    })
}
