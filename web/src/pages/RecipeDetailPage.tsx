import { useParams } from 'react-router-dom'
import { useGetRecipe } from '../recipe/useGetRecipe'
import { isError, isLoading } from '../misc/result'
import { Progress } from '../components/Progress'
import { ErrorMessage } from '../components/ErrorMessage'
import { H1 } from '../components/H1'

export function RecipeDetailPage() {
  const params = useParams()
  const recipeId = Number(params.recipeId)

  const getRecipeResult = useGetRecipe(recipeId)

  if (isLoading(getRecipeResult)) {
    return <Progress />
  }

  if (isError(getRecipeResult)) {
    return <ErrorMessage message={getRecipeResult.message} />
  }

  const recipe = getRecipeResult

  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>{recipe.title}</H1>
        <p>{`ID: ${recipeId}`}</p>
        <p>{`Cooking time: ${recipe.cookingTimeMinutes} minutes`}</p>
      </div>
    </div>
  )
}
