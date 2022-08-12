import { useNavigate, useParams } from 'react-router-dom'
import { useGetRecipe } from '../recipe/useGetRecipe'
import { isError, isLoading } from '../misc/result'
import { Progress } from '../components/Progress'
import { NotFound404Page } from './NotFound404Page'
import { ErrorMessagePage } from '../components/ErrorMessage'
import { H1 } from '../components/H1'
import { Button } from '@chakra-ui/react'

export function RecipeDetailPage() {
  const navigate = useNavigate()

  const params = useParams()
  const recipeId = Number(params.recipeId)

  const getRecipeResult = useGetRecipe(recipeId)

  if (isLoading(getRecipeResult)) {
    return <Progress />
  }

  if (getRecipeResult === '404-not-found') {
    return <NotFound404Page />
  }

  if (isError(getRecipeResult)) {
    return <ErrorMessagePage message={getRecipeResult.message} />
  }

  const recipe = getRecipeResult

  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>{recipe.title}</H1>
        <p>{`ID: ${recipeId}`}</p>
        <p>{`Cooking time: ${recipe.cookingTimeMinutes} minutes`}</p>
        <Button
          onClick={() => {
            navigate(`/recipes/${recipeId}/edit`)
          }}
          colorScheme="teal"
        >
          Edit
        </Button>
      </div>
    </div>
  )
}
