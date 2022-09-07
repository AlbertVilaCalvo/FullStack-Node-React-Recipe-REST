import { H1 } from '../../components/Headers'
import * as React from 'react'
import { isValidEmail, ValidationError } from '../../../misc/validations'
import * as AuthApi from '../../../auth/AuthApi'
import { useLocation, useNavigate } from 'react-router-dom'
import { userStore } from '../../../user/userStore'
import { useErrorToast } from '../../misc/toast'
import { isApiError } from '../../../httpClient'
import { getFromLocation } from '../../components/navigation/RequireLogin'
import { StyledLink } from '../../components/navigation/StyledLink'
import { Form } from '../../components/form/Form'
import {
  EmailFormControl,
  PasswordFormControl,
  UserNameFormControl,
} from '../../components/form/FormControl'
import { SubmitButton } from '../../components/form/SubmitButton'

export function RegisterPage() {
  const showErrorToast = useErrorToast()

  const navigate = useNavigate()
  const location = useLocation()

  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const [emailError, setEmailError] = React.useState('')

  const [loading, setLoading] = React.useState(false)

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    if (!isValidEmail(email)) {
      setEmailError(ValidationError.EMAIL_FORMAT)
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
          showErrorToast(response.error.message)
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
        showErrorToast(error.message)
      })
  }

  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>Register</H1>
        <Form onSubmit={onSubmit}>
          <UserNameFormControl value={name} onChange={setName} />

          <EmailFormControl
            value={email}
            onChange={(value) => {
              setEmail(value)
              setEmailError('')
            }}
            isInvalid={!!emailError}
            errorMessage={emailError}
          />

          <PasswordFormControl value={password} onChange={setPassword} />

          <SubmitButton isLoading={loading} alignSelf="flex-start">
            Register
          </SubmitButton>
        </Form>

        <StyledLink to="/login" className="center" marginTop={10}>
          Already have an account? Log In
        </StyledLink>
      </div>
    </div>
  )
}
