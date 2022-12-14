import { Recipe } from '../../../recipe/Recipe'
import { Link } from 'react-router-dom'

type Props = {
  recipes: Recipe[]
}

export function RecipeList({ recipes }: Props) {
  if (recipes.length === 0) {
    return (
      <div>
        <p>There are no recipes yet!</p>
      </div>
    )
  }

  return (
    <ul className="list-style-type-none">
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <Link
            to={`/recipes/${recipe.id}`}
          >{`#${recipe.id} - ${recipe.title}`}</Link>
        </li>
      ))}
    </ul>
  )
}
