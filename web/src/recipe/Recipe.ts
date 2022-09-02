import { RecipeJson } from './RecipeJson'

export class Recipe {
  readonly id: number
  title: string
  cookingTimeMinutes: number
  userIsOwner?: boolean

  constructor(
    id: number,
    title: string,
    cookingTimeMinutes: number,
    userIsOwner?: boolean
  ) {
    this.id = id
    this.title = title
    this.cookingTimeMinutes = cookingTimeMinutes
    this.userIsOwner = userIsOwner
  }

  static fromJson(json: RecipeJson): Recipe {
    return new Recipe(
      json.id,
      json.title,
      json.cooking_time_minutes,
      json.user_is_owner
    )
  }

  static toJson(recipe: Recipe): RecipeJson {
    return {
      id: recipe.id,
      title: recipe.title,
      cooking_time_minutes: recipe.cookingTimeMinutes,
    }
  }
}
