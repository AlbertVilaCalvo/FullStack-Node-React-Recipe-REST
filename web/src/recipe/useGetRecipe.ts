import * as React from 'react'
import type { RecipeWithUser } from './Recipe'
import * as RecipeApi from './RecipeApi'
import { isValidId } from '../misc/validations'
import { is404NotFound } from '../httpClient'

export function useGetRecipe(
  recipeId: number
): 'loading' | RecipeWithUser | '404-not-found' | Error {
  const [result, setResult] = React.useState<
    | {
        recipeId: number
        value: RecipeWithUser | '404-not-found' | Error
      }
    | undefined
  >()

  React.useEffect(() => {
    if (!isValidId(recipeId)) {
      return
    }

    let cancelled = false

    RecipeApi.getRecipe(recipeId)
      .then((recipe) => {
        if (!cancelled) {
          setResult({ recipeId, value: recipe })
        }
      })
      .catch((error) => {
        console.log(`useGetRecipe error`, error)
        if (cancelled) {
          return
        }
        if (is404NotFound(error)) {
          setResult({ recipeId, value: '404-not-found' })
        } else {
          setResult({ recipeId, value: error })
        }
      })

    return () => {
      cancelled = true
    }
  }, [recipeId])

  if (!isValidId(recipeId)) {
    return '404-not-found'
  }

  if (!result || result.recipeId !== recipeId) {
    return 'loading'
  }

  return result.value
}
