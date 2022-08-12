import { H1 } from '../components/H1'
import { CreateRecipeForm } from '../components/CreateRecipeForm'
import * as RecipeApi from '../recipe/RecipeApi'
import { useParams } from 'react-router-dom'
import { useGetRecipe } from '../recipe/useGetRecipe'
import { isError, isLoading } from '../misc/result'
import { Progress } from '../components/Progress'
import { ErrorMessagePage } from '../components/ErrorMessage'

export function EditRecipePage() {
  const params = useParams()
  const recipeId = parseInt(params.recipeId!, 10)

  const getRecipeResult = useGetRecipe(recipeId)

  if (isLoading(getRecipeResult)) {
    return <Progress />
  }

  if (isError(getRecipeResult)) {
    return <ErrorMessagePage message={getRecipeResult.message} />
  }

  const recipe = getRecipeResult

  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>Edit Recipe</H1>
        <CreateRecipeForm
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