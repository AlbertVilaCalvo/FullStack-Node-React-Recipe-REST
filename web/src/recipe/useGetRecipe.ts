import * as React from 'react'
import { RecipeWithUser } from './Recipe'
import * as RecipeApi from './RecipeApi'
import { isValidId } from '../misc/validations'
import { is404NotFound } from '../httpClient'

export function useGetRecipe(
  recipeId: number
): 'loading' | RecipeWithUser | '404-not-found' | Error {
  const [result, setResult] =
    React.useState<ReturnType<typeof useGetRecipe>>('loading')

  React.useEffect(() => {
    if (!isValidId(recipeId)) {
      setResult('404-not-found')
      return
    }
    setResult('loading')
    RecipeApi.getRecipe(recipeId)
      .then((recipe) => {
        setResult(recipe)
      })
      .catch((error) => {
        console.log(`useGetRecipe error`, error)
        if (is404NotFound(error)) {
          setResult('404-not-found')
        } else {
          setResult(error)
        }
      })
  }, [recipeId])

  return result
}
