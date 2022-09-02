import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetRecipe } from '../../recipe/useGetRecipe'
import { isError, isLoading } from '../../misc/result'
import { Progress } from '../../components/Progress'
import { NotFound404Page } from '../NotFound404Page'
import { ErrorMessagePage } from '../../components/ErrorMessage'
import { H1 } from '../../components/H1'
import { Button, useToast } from '@chakra-ui/react'
import * as RecipeApi from '../../recipe/RecipeApi'

export function RecipeDetailPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const params = useParams()
  const recipeId = Number(params.recipeId)

  const [loading, setLoading] = React.useState(false)

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
        {recipe.userIsOwner && (
          <>
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
                    toast({
                      title: 'An error occurred',
                      description: error.message,
                      status: 'error',
                      position: 'top',
                      duration: 7000,
                      isClosable: true,
                    })
                  })
              }}
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
