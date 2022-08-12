import { H1 } from '../components/H1'
import { CreateRecipeForm } from '../components/CreateRecipeForm'
import * as RecipeApi from '../recipe/RecipeApi'

export function CreateRecipePage() {
  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>New Recipe</H1>
        <CreateRecipeForm onSubmit={RecipeApi.createRecipe} />
      </div>
    </div>
  )
}
