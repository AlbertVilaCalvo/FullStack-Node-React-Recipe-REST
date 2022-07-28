import { useParams } from 'react-router-dom'

export function RecipeDetailPage() {
  const params = useParams()
  const recipeId = params.recipeId

  return (
    <div>
      <h1>Recipe Detail</h1>
      <p>{`ID: ${recipeId}`}</p>
    </div>
  )
}
