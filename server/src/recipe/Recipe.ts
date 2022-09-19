import { z } from 'zod'

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

// Validation

const TITLE_MIN_LENGTH = 2
const TITLE_MAX_LENGTH = 250
const MIN_COOKING_TIME_MINUTES = 1
const MAX_COOKING_TIME_MINUTES = 3 * 24 * 60 // 3 days

export const RecipeSchema = z.object({
  id: z.number().positive(),
  user_id: z.number().positive(),
  title: z.string().min(TITLE_MIN_LENGTH).max(TITLE_MAX_LENGTH),
  cooking_time_minutes: z
    .number()
    .int()
    .min(MIN_COOKING_TIME_MINUTES)
    .max(MAX_COOKING_TIME_MINUTES),
})
