import { H2 } from '../../components/Headers'
import { PasswordFormControl } from '../../components/form/FormControl'
import { SubmitButton } from '../../components/form/SubmitButton'
import { Form } from '../../components/form/Form'
import * as React from 'react'
import { useErrorToast, useSuccessToast } from '../../misc/toast'
import * as MyAccountApi from '../../../myaccount/MyAccountApi'
import { isApiError } from '../../../httpClient'
import { userStore } from '../../../user/userStore'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'

export function DeleteAccountPage() {
  const navigate = useNavigate()

  const showErrorToast = useErrorToast()
  const showSuccessToast = useSuccessToast()

  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    setLoading(true)
    MyAccountApi.deleteAccount(password)
      .then((response) => {
        if (isApiError(response)) {
          showErrorToast(response.error.message)
          setLoading(false)
        } else {
          showSuccessToast('Account deleted')
          userStore.user = undefined
          userStore.authToken = undefined
          navigate('/')
        }
      })
      .catch((error) => {
        showErrorToast(error.message)
        setLoading(false)
      })
  }

  return (
    <>
      <H2>Delete Account</H2>
      <Alert status="error" marginTop={15}>
        <AlertIcon />
        <AlertTitle>Warning!</AlertTitle>
        <AlertDescription>This action cannot be undone.</AlertDescription>
      </Alert>
      <Form onSubmit={onSubmit} marginTop={15}>
        <PasswordFormControl value={password} onChange={setPassword} />
        <SubmitButton
          isDisabled={password.length === 0}
          isLoading={loading}
          alignSelf="flex-start"
          colorScheme="red"
        >
          Delete Account
        </SubmitButton>
      </Form>
    </>
  )
}
