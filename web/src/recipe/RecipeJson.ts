export type RecipeJson = Readonly<{
  id: number
  title: string
  cooking_time_minutes: number
  user_is_owner?: boolean
}>
