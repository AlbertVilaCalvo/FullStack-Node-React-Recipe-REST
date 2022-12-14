import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetRecipe } from '../../../recipe/useGetRecipe'
import { isError, isLoading } from '../../../misc/result'
import { Progress } from '../../components/Progress'
import { NotFound404Page } from '../NotFound404Page'
import { ErrorMessagePage } from '../../components/ErrorMessage'
import { H1 } from '../../components/Headers'
import { StyledLink } from '../../components/navigation/StyledLink'
import { Button, Stack } from '@chakra-ui/react'
import * as RecipeApi from '../../../recipe/RecipeApi'
import { useErrorToast } from '../../misc/toast'
import { RecipeWithUserUtil } from '../../../recipe/RecipeUtil'

export function RecipeDetailPage() {
  const navigate = useNavigate()
  const showErrorToast = useErrorToast()

  const params = useParams()
  const recipeId = Number(params.recipeId)

  const [loading, setLoading] = React.useState(false)

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
        <H1>{recipe.title}</H1>
        <p>
          By{' '}
          <StyledLink to={`/users/${recipe.user.id}`}>
            {recipe.user.name}
          </StyledLink>
        </p>
        <p>{`ID: ${recipeId}`}</p>
        <p>{`Cooking time: ${recipe.cookingTimeMinutes} minutes`}</p>
        {RecipeWithUserUtil.isRecipeOwner(recipe) && (
          <Stack direction="row" spacing="20px" marginTop="30px">
            <Button
              onClick={() => {
                navigate(`/recipes/${recipeId}/edit`)
              }}
              colorScheme="teal"
            >
              Edit
            </Button>
            <Button
              colorScheme="red"
              isLoading={loading}
              onClick={() => {
                setLoading(true)
                RecipeApi.deleteRecipe(recipeId)
                  .then(() => {
                    navigate(`/`)
                  })
                  .catch((error) => {
                    setLoading(false)
                    showErrorToast('An error occurred', error.message)
                  })
              }}
            >
              Delete
            </Button>
          </Stack>
        )}
      </div>
    </div>
  )
}
