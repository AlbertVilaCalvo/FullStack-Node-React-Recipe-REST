export type Recipe = {
  readonly id: number
  readonly user_id: number
  title: string
  cooking_time_minutes: number
}

type RecipeUser = Readonly<{
  user: {
    id: number
    name: string
  }
}>

export type RecipeWithUser = Recipe & RecipeUser
