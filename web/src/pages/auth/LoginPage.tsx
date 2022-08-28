import { H1 } from '../../components/H1'
import * as React from 'react'
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
} from '@chakra-ui/react'
import {
  EMAIL_MAX_LENGTH,
  isValidEmail,
  PASSWORD_MAX_LENGTH,
} from '../../misc/validations'
import * as AuthApi from '../../auth/AuthApi'
import { ErrorMessage } from '../../components/ErrorMessage'
import { isAipError } from '../../httpClient'

export function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const [showEmailNotValidError, setShowEmailNotValidError] =
    React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')

  const [loading, setLoading] = React.useState(false)

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    if (!isValidEmail(email)) {
      setShowEmailNotValidError(true)
      return
    }
    setLoading(true)
    AuthApi.login(email, password)
      .then((response) => {
        console.log(`AuthApi.login response`, response)
        if (isAipError(response)) {
          setErrorMessage(response.error.message)
          setLoading(false)
        } else {
          // Success
          // TODO add redirect and remove next line
          setLoading(false)
        }
      })
      .catch((error) => {
        setLoading(false)
        setErrorMessage(error.message)
      })
  }

  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>Login</H1>
        <Stack as="form" onSubmit={onSubmit} spacing={6}>
          <FormControl isRequired isInvalid={showEmailNotValidError}>
            <FormLabel>Email</FormLabel>
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setShowEmailNotValidError(false)
                setErrorMessage('')
              }}
              maxLength={EMAIL_MAX_LENGTH}
            />
            {showEmailNotValidError && (
              <FormErrorMessage>This email is not valid</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setErrorMessage('')
              }}
              maxLength={PASSWORD_MAX_LENGTH}
            />
          </FormControl>

          <Button
            type="submit"
            isLoading={loading}
            alignSelf="flex-start"
            colorScheme="teal"
          >
            Login
          </Button>

          {errorMessage && (
            <ErrorMessage>
              An error occurred: {errorMessage}. Please try again.
            </ErrorMessage>
          )}
        </Stack>
      </div>
    </div>
  )
}
