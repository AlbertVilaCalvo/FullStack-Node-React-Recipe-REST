import { useParams } from 'react-router-dom'
import { CircularProgress, Heading } from '@chakra-ui/react'
import { useGetRecipe } from '../recipe/useGetRecipe'
import { isError, isLoading } from '../misc/result'

export function RecipeDetailPage() {
  const params = useParams()
  const recipeId = Number(params.recipeId)

  const getRecipeResult = useGetRecipe(recipeId)

  if (isLoading(getRecipeResult)) {
    return <CircularProgress isIndeterminate size="100px" thickness="4px" />
  }

  if (isError(getRecipeResult)) {
    return <p>{getRecipeResult.message}</p>
  }

  const recipe = getRecipeResult

  return (
    <div>
      <Heading as="h1" size="2xl">
        {recipe.title}
      </Heading>
      <p>{`ID: ${recipeId}`}</p>
      <p>{`Cooking time: ${recipe.cookingTimeMinutes} minutes`}</p>
    </div>
  )
}
