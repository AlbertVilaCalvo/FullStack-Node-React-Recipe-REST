export type Recipe = {
  readonly id: number
  readonly user_id: number
  title: string
  cooking_time_minutes: number
}

export type RecipeWithOwner = Recipe & {
  user_is_owner: boolean
}
