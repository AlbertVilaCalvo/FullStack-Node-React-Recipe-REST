import type {
  Recipe,
  RecipeJson,
  RecipeWithUser,
  RecipeWithUserJson,
} from './Recipe'
import { userStore } from '../user/userStore'

export class RecipeUtil {
  static fromJson(json: RecipeJson): Recipe {
    return {
      id: json.id,
      title: json.title,
      cookingTimeMinutes: json.cooking_time_minutes,
    }
  }

  static toJson(recipe: Recipe): RecipeJson {
    return {
      id: recipe.id,
      title: recipe.title,
      cooking_time_minutes: recipe.cookingTimeMinutes,
    }
  }
}

export class RecipeWithUserUtil {
  static fromJson(json: RecipeWithUserJson): RecipeWithUser {
    return {
      id: json.id,
      title: json.title,
      cookingTimeMinutes: json.cooking_time_minutes,
      user: json.user,
    }
  }

  /**
   * True if there's a logged user and it's the owner of the recipe, false
   * otherwise.
   */
  static isRecipeOwner(recipe: RecipeWithUser): boolean {
    const loggedUser = userStore.user
    if (loggedUser) {
      return loggedUser.id === recipe.user.id
    }
    return false
  }
}
