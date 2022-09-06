export type Recipe = {
  readonly id: number
  title: string
  cookingTimeMinutes: number
}

export type RecipeJson = Readonly<{
  id: number
  title: string
  cooking_time_minutes: number
}>

type RecipeUser = Readonly<{
  user: {
    id: number
    name: string
  }
}>

export type RecipeWithUser = Recipe & RecipeUser

export type RecipeWithUserJson = RecipeJson & RecipeUser
