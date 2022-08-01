import * as React from 'react'
import { Recipe } from './Recipe'
import * as RecipeApi from './RecipeApi'

export function useGetRecipe(recipeId: number): 'loading' | Recipe | Error {
  const [result, setResult] = React.useState<'loading' | Recipe | Error>(
    'loading'
  )

  React.useEffect(() => {
    setResult('loading')
    RecipeApi.getRecipe(recipeId)
      .then((recipe) => {
        setResult(recipe)
      })
      .catch((error) => {
        setResult(error)
      })
  }, [recipeId])

  return result
}
