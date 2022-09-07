import * as React from 'react'
import { Recipe } from '../../../recipe/Recipe'
import {
  FormControl,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useErrorToast } from '../../misc/toast'
import { extractApiError } from '../../../httpClient'
import { SubmitButton } from '../form/SubmitButton'

const MAX_COOKING_TIME_MINUTES = 3 * 24 * 60 // 3 days

type Props = {
  recipe?: Recipe
  onSubmit: (data: Omit<Recipe, 'id'>) => Promise<{ recipeId: number }>
}

export function RecipeForm({ recipe, onSubmit }: Props) {
  const navigate = useNavigate()
  const showErrorToast = useErrorToast()

  const [title, setTitle] = React.useState(recipe ? recipe.title : '')
  const [cookingTimeMinutes, setCookingTimeMinutes] = React.useState(
    recipe ? recipe.cookingTimeMinutes.toString(10) : '10'
  )

  const [loading, setLoading] = React.useState(false)

  const onSubmitInternal = (event: React.SyntheticEvent) => {
    event.preventDefault()
    setLoading(true)
    onSubmit({
      title: title.trim(),
      cookingTimeMinutes: Number(cookingTimeMinutes),
    })
      .then((response) => {
        console.log(`RecipeApi response`, response)
        navigate(`/recipes/${response.recipeId}`)
      })
      .catch((error) => {
        console.error(`RecipeApi error`, error)
        const apiError = extractApiError(error)
        if (apiError) {
          showErrorToast(apiError.error.message)
        } else {
          showErrorToast(error.message)
        }
        setLoading(false)
      })
  }

  return (
    <Stack as="form" onSubmit={onSubmitInternal} spacing={6}>
      <FormControl isRequired>
        <FormLabel>Title</FormLabel>
        <Input
          placeholder="Title"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
          }}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Cooking Time (minutes)</FormLabel>
        <NumberInput
          min={1}
          max={MAX_COOKING_TIME_MINUTES}
          allowMouseWheel
          value={cookingTimeMinutes}
          onChange={(valueAsString, valueAsNumber) => {
            setCookingTimeMinutes(valueAsString)
          }}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <SubmitButton isLoading={loading} alignSelf="flex-start">
        {recipe ? 'Update Recipe' : 'Publish Recipe'}
      </SubmitButton>
    </Stack>
  )
}
