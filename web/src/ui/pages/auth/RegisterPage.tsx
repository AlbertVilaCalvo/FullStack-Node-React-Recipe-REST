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
import {
  EmailInput,
  PasswordInput,
  UserNameInput,
} from '../../components/form/Input'
import { SubmitButton } from '../../components/form/SubmitButton'

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const [emailError, setEmailError] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')

  const [loading, setLoading] = React.useState(false)

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    if (!isValidEmail(email)) {
      setEmailError('This email is not valid')
      return
    }
    setLoading(true)
    AuthApi.registerNewUser(name, email, password)
      .then((response) => {
        console.log(`AuthApi.registerNewUser response`, response)
        if (isApiError(response)) {
          if (response.error.code === 'duplicate_email') {
            setEmailError(response.error.message)
          }
          setErrorMessage(response.error.message)
          setLoading(false)
        } else {
          // Success
          const { user, authToken } = response
          userStore.user = user
          userStore.authToken = authToken
          const navigateTo = getFromLocation(location) ?? '/settings/profile'
          navigate(navigateTo, { replace: true })
        }
      })
      .catch((error) => {
        // An unexpected error
        setLoading(false)
        setErrorMessage(error.message)
      })
  }

  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>Register</H1>
        <Form onSubmit={onSubmit}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <UserNameInput
              value={name}
              onChange={(value) => {
                setName(value)
                setErrorMessage('')
              }}
            />
          </FormControl>

          <FormControl isRequired isInvalid={!!emailError}>
            <FormLabel>Email</FormLabel>
            <EmailInput
              value={email}
              onChange={(value) => {
                setEmail(value)
                setEmailError('')
                setErrorMessage('')
              }}
            />
            {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
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
            Register
          </SubmitButton>

          {errorMessage && (
            <ErrorMessage>
              An error occurred: {errorMessage}. Please try again.
            </ErrorMessage>
          )}
        </Form>

        <StyledLink to="/login" className="center" marginTop={10}>
          Already have an account? Log In
        </StyledLink>
      </div>
    </div>
  )
}
