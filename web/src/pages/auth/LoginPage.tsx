import { H1 } from '../../components/H1'
import * as React from 'react'
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react'
import {
  EMAIL_MAX_LENGTH,
  isValidEmail,
  PASSWORD_MAX_LENGTH,
} from '../../misc/validations'
import * as AuthApi from '../../auth/AuthApi'
import { useLocation, useNavigate } from 'react-router-dom'
import { userStore } from '../../user/userStore'
import { ErrorMessage } from '../../components/ErrorMessage'
import { isApiError } from '../../httpClient'
import { getFromLocation } from '../../components/navigation/RequireLogin'
import { StyledLink } from '../../components/navigation/StyledLink'
import { Form } from '../../components/form/Form'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

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
        if (isApiError(response)) {
          setErrorMessage(response.error.message)
          setLoading(false)
        } else {
          // Success
          const { user, authToken } = response
          userStore.user = user
          userStore.authToken = authToken
          const navigateTo = getFromLocation(location) ?? '/profile'
          navigate(navigateTo, { replace: true })
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
        <Form onSubmit={onSubmit}>
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
        </Form>

        <StyledLink to="/register" className="center" marginTop={10}>
          Don't have an account yet? Register
        </StyledLink>
      </div>
    </div>
  )
}
