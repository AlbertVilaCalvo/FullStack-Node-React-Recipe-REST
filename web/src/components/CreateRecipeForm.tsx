import * as React from 'react'
import { Recipe } from '../recipe/Recipe'
import {
  Button,
  FormControl,
  FormErrorMessage,
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
import { ErrorMessage } from './ErrorMessage'

const MAX_COOKING_TIME_MINUTES = 72 * 60 // 72 hours

type Props = {
  recipe?: Recipe
  onSubmit: (data: Omit<Recipe, 'id'>) => Promise<{ recipeId: number }>
}

export function CreateRecipeForm({ recipe, onSubmit }: Props) {
  const [title, setTitle] = React.useState(recipe ? recipe.title : '')
  const [cookingTimeMinutes, setCookingTimeMinutes] = React.useState(
    recipe ? recipe.cookingTimeMinutes.toString(10) : '10'
  )

  const [showTitleEmptyError, setShowTitleEmptyError] = React.useState(false)
  const [showCookingTimeEmptyError, setShowCokingTimeEmptyError] =
    React.useState(false)

  const [errorMessage, setErrorMessage] = React.useState('')

  const navigate = useNavigate()

  const onClick = () => {
    setErrorMessage('')
    const titleEmpty = title.trim() === ''
    if (titleEmpty) {
      setShowTitleEmptyError(true)
    }
    const cookingTimeEmpty = cookingTimeMinutes.trim() === ''
    if (cookingTimeEmpty) {
      setShowCokingTimeEmptyError(true)
    }
    if (titleEmpty || cookingTimeEmpty) {
      return
    }
    onSubmit({
      title,
      cookingTimeMinutes: Number(cookingTimeMinutes),
    })
      .then((response) => {
        console.log(`RecipeApi response`, response)
        navigate(`/recipes/${response.recipeId}`)
      })
      .catch((error) => {
        console.error(`RecipeApi error`, error)
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          // Status code not 2XX
          setErrorMessage(error.response.data.error)
        } else {
          setErrorMessage(error.message)
        }
      })
  }

  return (
    <Stack spacing={6}>
      <FormControl isRequired isInvalid={showTitleEmptyError}>
        <FormLabel>Title</FormLabel>
        <Input
          placeholder="Title"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            setShowTitleEmptyError(false)
          }}
        />
        {showTitleEmptyError && (
          <FormErrorMessage>Title is required</FormErrorMessage>
        )}
      </FormControl>
      <FormControl isRequired isInvalid={showCookingTimeEmptyError}>
        <FormLabel>Cooking Time (minutes)</FormLabel>
        <NumberInput
          min={1}
          max={MAX_COOKING_TIME_MINUTES}
          allowMouseWheel
          value={cookingTimeMinutes}
          onChange={(valueAsString, valueAsNumber) => {
            setCookingTimeMinutes(valueAsString)
            setShowCokingTimeEmptyError(false)
          }}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        {showCookingTimeEmptyError && (
          <FormErrorMessage>Cooking time is required</FormErrorMessage>
        )}
      </FormControl>
      <Button onClick={onClick} alignSelf="flex-start" colorScheme="teal">
        {recipe ? 'Update Recipe' : 'Publish Recipe'}
      </Button>
      {errorMessage && (
        <ErrorMessage>
          An error occurred: {errorMessage}. Please try again.
        </ErrorMessage>
      )}
    </Stack>
  )
}
