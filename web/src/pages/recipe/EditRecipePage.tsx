import { H1 } from '../../components/H1'
import { RecipeForm } from '../../components/recipe/RecipeForm'
import * as RecipeApi from '../../recipe/RecipeApi'
import { useParams } from 'react-router-dom'
import { useGetRecipe } from '../../recipe/useGetRecipe'
import { isError, isLoading } from '../../misc/result'
import { Progress } from '../../components/Progress'
import { NotFound404Page } from '../NotFound404Page'
import { ErrorMessagePage } from '../../components/ErrorMessage'

export function EditRecipePage() {
  const params = useParams()
  const recipeId = parseInt(params.recipeId!, 10)

  const getRecipeResult = useGetRecipe(recipeId)

  if (isLoading(getRecipeResult)) {
    return <Progress />
  }

  if (getRecipeResult === '404-not-found') {
    return (
      <NotFound404Page
        message={`Recipe with id ${params.recipeId} not found.`}
      />
    )
  }

  if (isError(getRecipeResult)) {
    return <ErrorMessagePage message={getRecipeResult.message} />
  }

  const recipe = getRecipeResult

  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>Edit Recipe</H1>
        <RecipeForm
          recipe={recipe}
          onSubmit={(data) => {
            return RecipeApi.updateRecipe({
              ...data,
              id: recipeId,
            })
          }}
        />
      </div>
    </div>
  )
}
