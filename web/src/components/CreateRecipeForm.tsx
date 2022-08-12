import * as React from 'react'
import * as RecipeApi from '../recipe/RecipeApi'
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

export function CreateRecipeForm() {
  const [title, setTitle] = React.useState('')
  const [cookingTimeMinutes, setCookingTimeMinutes] = React.useState('10')

  const [showTitleEmptyError, setShowTitleEmptyError] = React.useState(false)
  const [showCookingTimeEmptyError, setShowCokingTimeEmptyError] =
    React.useState(false)

  const [errorMessage, setErrorMessage] = React.useState('')

  const navigate = useNavigate()

  const onSubmit = () => {
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
    RecipeApi.createRecipe({
      title,
      cookingTimeMinutes: Number(cookingTimeMinutes),
    })
      .then((response) => {
        console.log(`RecipeApi.createRecipe response`, response)
        navigate(`/recipes/${response.recipeId}`)
      })
      .catch((error) => {
        console.error(`RecipeApi.createRecipe error`, error)
        if (error.response && error.response.data) {
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
            console.log(`valueAsString`, valueAsString)
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
      <Button onClick={onSubmit} alignSelf="flex-start" colorScheme="teal">
        Publish Recipe
      </Button>
      {errorMessage && (
        <ErrorMessage>
          An error occurred: {errorMessage}. Please try again.
        </ErrorMessage>
      )}
    </Stack>
  )
}
