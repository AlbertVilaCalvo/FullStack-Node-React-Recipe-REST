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
} from '../../components/form/FormControl'
import { SubmitButton } from '../../components/form/SubmitButton'
import { Button, useDisclosure } from '@chakra-ui/react'
import { PasswordResetAlertDialog } from '../../components/auth/PasswordResetAlertDialog'
import { isDev } from '../../../misc/utils'

export function LoginPage() {
  const showErrorToast = useErrorToast()

  const navigate = useNavigate()
  const location = useLocation()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [email, setEmail] = React.useState(isDev ? 'a@a.com' : '')
  const [password, setPassword] = React.useState(isDev ? '123456' : '')
  const [emailNotValid, setEmailNotValid] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    if (!isValidEmail(email)) {
      setEmailNotValid(true)
      return
    }
    setLoading(true)
    AuthApi.login(email, password)
      .then((response) => {
        console.log(`AuthApi.login response`, response)
        if (isApiError(response)) {
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
        setLoading(false)
        showErrorToast(error.message)
      })
  }

  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>Login</H1>

        <Form onSubmit={onSubmit}>
          <EmailFormControl
            value={email}
            onChange={(value) => {
              setEmail(value)
              setEmailNotValid(false)
            }}
            isInvalid={emailNotValid}
            errorMessage={ValidationError.EMAIL_FORMAT}
          />

          <PasswordFormControl value={password} onChange={setPassword} />

          <SubmitButton isLoading={loading} alignSelf="flex-start">
            Login
          </SubmitButton>
        </Form>

        <Button
          onClick={onOpen}
          colorScheme="teal"
          variant="link"
          ml={3}
          marginTop="30px"
        >
          I forgot my password
        </Button>

        <StyledLink to="/register" className="center" marginTop={10}>
          Don't have an account yet? <span className="bold">Register</span>
        </StyledLink>

        <PasswordResetAlertDialog isOpen={isOpen} onClose={onClose} />
      </div>
    </div>
  )
}
