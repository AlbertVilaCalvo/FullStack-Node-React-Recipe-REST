import { H1 } from '../../components/H1'
import * as React from 'react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'
import { isValidEmail } from '../../../misc/validations'
import * as AuthApi from '../../../auth/AuthApi'
import { useLocation, useNavigate } from 'react-router-dom'
import { userStore } from '../../../user/userStore'
import { ErrorMessage } from '../../components/ErrorMessage'
import { isApiError } from '../../../httpClient'
import { getFromLocation } from '../../components/navigation/RequireLogin'
import { StyledLink } from '../../components/navigation/StyledLink'
import { Form } from '../../components/form/Form'
import { EmailInput, PasswordInput } from '../../components/form/Input'
import { SubmitButton } from '../../components/form/SubmitButton'

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
            <EmailInput
              value={email}
              onChange={(value) => {
                setEmail(value)
                setShowEmailNotValidError(false)
                setErrorMessage('')
              }}
            />
            {showEmailNotValidError && (
              <FormErrorMessage>This email is not valid</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <PasswordInput
              value={password}
              onChange={(value) => {
                setPassword(value)
                setErrorMessage('')
              }}
            />
          </FormControl>

          <SubmitButton isLoading={loading} alignSelf="flex-start">
            Login
          </SubmitButton>

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