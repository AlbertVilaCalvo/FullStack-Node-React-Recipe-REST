import { Recipe } from '../recipe/Recipe'
import { Link } from 'react-router-dom'

type Props = {
  recipes: Recipe[]
}

export function RecipeList({ recipes }: Props) {
  return (
    <div>
      {recipes.map((recipe) => (
        <div key={recipe.id}>
          <Link
            to={`/recipes/${recipe.id}`}
          >{`#${recipe.id} - ${recipe.title}`}</Link>
        </div>
      ))}
    </div>
  )
}
