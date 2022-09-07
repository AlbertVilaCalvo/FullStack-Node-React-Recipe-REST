import { RecipeList } from '../components/recipe/RecipeList'
import { useGetAllRecipes } from '../../recipe/useGetAllRecipes'
import { isLoading, isSuccess } from '../../misc/result'
import { H1 } from '../components/H1'
import { ErrorMessage } from '../components/ErrorMessage'

export function HomePage() {
  const getRecipesResult = useGetAllRecipes()

  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>Home</H1>
        {isLoading(getRecipesResult) ? (
          <p>Loading...</p>
        ) : isSuccess(getRecipesResult) ? (
          <RecipeList recipes={getRecipesResult} />
        ) : (
          <ErrorMessage>{`Error: ${getRecipesResult}`}</ErrorMessage>
        )}
      </div>
    </div>
  )
}
