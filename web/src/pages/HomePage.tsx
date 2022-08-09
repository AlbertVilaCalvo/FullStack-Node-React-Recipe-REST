import { RecipeList } from '../components/RecipeList'
import { useGetAllRecipes } from '../recipe/useGetAllRecipes'
import { isLoading, isSuccess } from '../misc/result'
import { H1 } from '../components/H1'

export function HomePage() {
  const getRecipesResult = useGetAllRecipes()

  return (
    <div className="main-container">
      <div className="main-container-child-centered">
        <H1>Home Page</H1>
        {isLoading(getRecipesResult) ? (
          <p>Loading...</p>
        ) : isSuccess(getRecipesResult) ? (
          <RecipeList recipes={getRecipesResult} />
        ) : (
          <p>{`Error: ${getRecipesResult}`}</p>
        )}
      </div>
    </div>
  )
}
