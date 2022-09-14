import * as React from 'react'
import { H2 } from '../../components/Headers'
import { useSnapshot } from 'valtio'
import { userStore } from '../../../user/userStore'
import { Form } from '../../components/form/Form'
import {
  EmailFormControl,
  PasswordFormControl,
} from '../../components/form/FormControl'
import { SubmitButton } from '../../components/form/SubmitButton'
import { NavigateToLogin } from '../../components/navigation/RequireLogin'
import { ValidationError, isValidEmail } from '../../../misc/validations'

export function ChangeEmailPage() {
  const loggedUserStore = useSnapshot(userStore)
  const snapshotUser = loggedUserStore.user
  const storeUser = userStore.user

  const [email, setEmail] = React.useState(storeUser?.email ?? '')
  const [password, setPassword] = React.useState('')
  const [emailNotValid, setEmailNotValid] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  // This will never happen (since we use RequireLogin at App) but it gets rid
  // of user being undefined.
  if (!storeUser || !snapshotUser) {
    return <NavigateToLogin />
  }

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    if (!isValidEmail(email)) {
      setEmailNotValid(true)
      return
    }
    setLoading(true)
  }

  return (
    <>
      <H2>Email</H2>
      <Form onSubmit={onSubmit} marginTop={15}>
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

        <SubmitButton
          isDisabled={
            snapshotUser.email === email.trim() || password.length === 0
          }
          isLoading={loading}
          alignSelf="flex-start"
        >
          Change Email
        </SubmitButton>
      </Form>
    </>
  )
}
