import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
} from '@chakra-ui/react'
import { Form } from '../form/Form'
import { SubmitButton } from '../form/SubmitButton'
import * as React from 'react'
import { NavigateToLogin } from '../navigation/RequireLogin'
import { useErrorToast, useSuccessToast } from '../../misc/toast'
import { useSnapshot } from 'valtio'
import { userStore } from '../../../user/userStore'
import * as AuthApi from '../../../auth/AuthApi'
import { extractApiErrorMessage } from '../../../httpClient'

export function VerifyEmailAddressBanner() {
  const showErrorToast = useErrorToast()
  const showSuccessToast = useSuccessToast()

  const loggedUserStore = useSnapshot(userStore)
  const snapshotUser = loggedUserStore.user
  const storeUser = userStore.user

  const [loading, setLoading] = React.useState(false)

  // This will never happen (since we use RequireLogin at App) but it gets rid
  // of user being undefined.
  if (!storeUser || !snapshotUser) {
    return <NavigateToLogin />
  }

  if (snapshotUser.email_verified) {
    return null
  }

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    setLoading(true)
    AuthApi.sendEmailVerificationEmail()
      .then(() => {
        showSuccessToast("We've sent you an email with a verification link.")
      })
      .catch((error) => {
        const errorMessage = extractApiErrorMessage(error)
        showErrorToast(errorMessage)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Box>
      <Alert status="info">
        <AlertIcon />
        {/* TODO use a container query to put the SubmitButton at the right if
            the banner width is large. */}
        <Box marginLeft="10px">
          <AlertTitle>Your email address is not verified yet.</AlertTitle>
          <AlertDescription>Please verify your email address.</AlertDescription>
          <Form onSubmit={onSubmit} marginTop={15}>
            <SubmitButton isLoading={loading} alignSelf="flex-start">
              Send Verification Email
            </SubmitButton>
          </Form>
        </Box>
      </Alert>
    </Box>
  )
}
