import { H1 } from '../components/H1'
import { CreateRecipeForm } from '../components/CreateRecipeForm'

export function CreateRecipePage() {
  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>New Recipe </H1>
        <CreateRecipeForm />
      </div>
    </div>
  )
}
