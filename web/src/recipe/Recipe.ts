import { RecipeJson } from './RecipeJson'

export class Recipe {
  readonly id: number
  title: string
  cookingTimeMinutes: number

  constructor(id: number, title: string, cookingTimeMinutes: number) {
    this.id = id
    this.title = title
    this.cookingTimeMinutes = cookingTimeMinutes
  }

  static fromJson(json: RecipeJson): Recipe {
    return new Recipe(json.id, json.title, json.cooking_time_minutes)
  }

  static toJson(recipe: Recipe): RecipeJson {
    return {
      id: recipe.id,
      title: recipe.title,
      cooking_time_minutes: recipe.cookingTimeMinutes,
    }
  }
}
