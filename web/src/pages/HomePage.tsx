import { RecipeList } from '../components/RecipeList'
import { useGetAllRecipes } from '../recipe/useGetAllRecipes'
import { isLoading, isSuccess } from '../misc/result'

export function HomePage() {
  const getRecipesResult = useGetAllRecipes()

  return (
    <div>
      <p>Home Page</p>
      {isLoading(getRecipesResult) ? (
        <p>Loading...</p>
      ) : isSuccess(getRecipesResult) ? (
        <RecipeList recipes={getRecipesResult} />
      ) : (
        <p>{`Error: ${getRecipesResult}`}</p>
      )}
    </div>
  )
}
