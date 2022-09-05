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
  USER_NAME_MAX_LENGTH,
} from '../../misc/validations'
import * as AuthApi from '../../auth/AuthApi'
import { useLocation, useNavigate } from 'react-router-dom'
import { userStore } from '../../user/userStore'
import { ErrorMessage } from '../../components/ErrorMessage'
import { isApiError } from '../../httpClient'
import { getFromLocation } from '../../components/navigation/RequireLogin'
import { StyledLink } from '../../components/navigation/StyledLink'
import { Form } from '../../components/form/Form'

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
          const navigateTo = getFromLocation(location) ?? '/profile'
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
            <Input
              placeholder="Name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setErrorMessage('')
              }}
              maxLength={USER_NAME_MAX_LENGTH}
            />
          </FormControl>

          <FormControl isRequired isInvalid={!!emailError}>
            <FormLabel>Email</FormLabel>
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setEmailError('')
                setErrorMessage('')
              }}
              maxLength={EMAIL_MAX_LENGTH}
            />
            {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
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
            Register
          </Button>

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
