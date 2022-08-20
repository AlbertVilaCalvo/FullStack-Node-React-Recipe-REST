import { Recipe } from './Recipe'
import { RecipeJson } from './RecipeJson'
import { httpClient } from '../httpClient'
import { AxiosResponse } from 'axios'

export function getAllRecipes(): Promise<Recipe[]> {
  return httpClient
    .get(`/recipes`)
    .then((response: AxiosResponse<{ recipes: RecipeJson[] }>) => {
      return response.data.recipes.map((recipeJson) =>
        Recipe.fromJson(recipeJson)
      )
    })
}

export function getRecipe(recipeId: number): Promise<Recipe> {
  return httpClient
    .get(`/recipes/${recipeId}`)
    .then((response: AxiosResponse<{ recipe: RecipeJson }>) => {
      return Recipe.fromJson(response.data.recipe)
    })
}

export function createRecipe(
  data: Omit<Recipe, 'id'>
): Promise<{ recipeId: number }> {
  const dataJson: Omit<RecipeJson, 'id'> = {
    title: data.title,
    cooking_time_minutes: data.cookingTimeMinutes,
  }
  return httpClient
    .post(`/recipes/`, dataJson)
    .then((response: AxiosResponse<{ id: number }>) => {
      return { recipeId: response.data.id }
    })
}

export function updateRecipe(recipe: Recipe): Promise<{ recipeId: number }> {
  const recipeJson = Recipe.toJson(recipe)
  return httpClient
    .patch(`/recipes/${recipe.id}`, recipeJson)
    .then((response: AxiosResponse<{ recipe: RecipeJson }>) => {
      return { recipeId: response.data.recipe.id }
    })
}

export function deleteRecipe(recipeId: number): Promise<void> {
  return httpClient.delete(`/recipes/${recipeId}`)
}
