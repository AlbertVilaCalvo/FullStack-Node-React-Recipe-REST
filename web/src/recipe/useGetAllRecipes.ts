import * as React from 'react'
import type { Recipe } from './Recipe'
import * as RecipeApi from './RecipeApi'

export function useGetAllRecipes(): 'loading' | Recipe[] | Error {
  const [result, setResult] = React.useState<'loading' | Recipe[] | Error>(
    'loading'
  )

  React.useEffect(() => {
    setResult('loading')
    RecipeApi.getAllRecipes()
      .then((recipes) => {
        setResult(recipes)
      })
      .catch((error) => {
        setResult(error)
      })
  }, [])

  return result
}
