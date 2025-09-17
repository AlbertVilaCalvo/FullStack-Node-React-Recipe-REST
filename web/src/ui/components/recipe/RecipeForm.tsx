import * as React from 'react'
import type { Recipe } from '../../../recipe/Recipe'
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
import { extractApiErrorMessage } from '../../../httpClient'
import { SubmitButton } from '../form/SubmitButton'
import {
  MAX_COOKING_TIME_MINUTES,
  MIN_COOKING_TIME_MINUTES,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
} from '../../../misc/validations'

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
        console.error(`RecipeForm RecipeApi error`, error)
        const errorMessage = extractApiErrorMessage(error)
        showErrorToast(errorMessage)
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
          minLength={TITLE_MIN_LENGTH}
          maxLength={TITLE_MAX_LENGTH}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
          }}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Cooking Time (minutes)</FormLabel>
        <NumberInput
          min={MIN_COOKING_TIME_MINUTES}
          max={MAX_COOKING_TIME_MINUTES}
          allowMouseWheel
          value={cookingTimeMinutes}
          onChange={(valueAsString, _valueAsNumber) => {
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
