import { H1 } from '../components/H1'
import { RecipeForm } from '../components/RecipeForm'
import * as RecipeApi from '../recipe/RecipeApi'

export function CreateRecipePage() {
  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>New Recipe</H1>
        <RecipeForm onSubmit={RecipeApi.createRecipe} />
      </div>
    </div>
  )
}
