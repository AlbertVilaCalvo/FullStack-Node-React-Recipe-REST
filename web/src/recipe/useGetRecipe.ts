import * as React from 'react'
import { RecipeWithUser } from './Recipe'
import * as RecipeApi from './RecipeApi'

export function useGetRecipe(
  recipeId: number
): 'loading' | RecipeWithUser | '404-not-found' | Error {
  const [result, setResult] =
    React.useState<ReturnType<typeof useGetRecipe>>('loading')

  React.useEffect(() => {
    setResult('loading')
    RecipeApi.getRecipe(recipeId)
      .then((recipe) => {
        setResult(recipe)
      })
      .catch((error) => {
        console.log(`useGetRecipe error`, error)
        if (error.response && error.response.status === 404) {
          setResult('404-not-found')
        } else {
          setResult(error)
        }
      })
  }, [recipeId])

  return result
}
