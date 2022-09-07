import * as React from 'react'
import { H2 } from '../../components/Headers'
import { useSnapshot } from 'valtio'
import { userStore } from '../../../user/userStore'
import { Form } from '../../components/form/Form'
import { FormControl, FormLabel } from '@chakra-ui/react'
import { UserNameInput } from '../../components/form/Input'
import { SubmitButton } from '../../components/form/SubmitButton'
import { NavigateToLogin } from '../../components/navigation/RequireLogin'
import * as UserApi from '../../../user/UserApi'
import { useErrorToast, useSuccessToast } from '../../../misc/toast'
import { extractApiError } from '../../../httpClient'

export function MyProfilePage() {
  const showSuccessToast = useSuccessToast()
  const showErrorToast = useErrorToast()

  const loggedUserStore = useSnapshot(userStore)
  const snapshotUser = loggedUserStore.user
  const storeUser = userStore.user

  const [name, setName] = React.useState(storeUser?.name ?? '')
  const [loading, setLoading] = React.useState(false)

  // This will never happen (since we wrap MyProfilePage with RequireLogin at
  // App) but it gets rid of user being undefined.
  if (!storeUser || !snapshotUser) {
    return <NavigateToLogin />
  }

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    setLoading(true)
    UserApi.updateUserProfile(name)
      .then((response) => {
        storeUser.name = name
        showSuccessToast('Profile updated')
      })
      .catch((error) => {
        console.error(`UserApi.updateUserProfile error`, error)
        const apiError = extractApiError(error)
        if (apiError) {
          showErrorToast('An error occurred', apiError.error.message)
        } else {
          showErrorToast('An error occurred', error.message)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <>
      <H2>Profile</H2>
      <p>ID: {snapshotUser?.id}</p>
      <p className="overflow-wrap-anywhere">Email: {snapshotUser?.email}</p>
      <p className="overflow-wrap-anywhere">
        Auth Token: {loggedUserStore.authToken}
      </p>

      <Form onSubmit={onSubmit} marginTop={15}>
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <UserNameInput
            value={name}
            onChange={(value) => {
              setName(value)
            }}
          />
        </FormControl>
        <SubmitButton
          isDisabled={snapshotUser.name === name.trim()}
          isLoading={loading}
          alignSelf="flex-start"
        >
          Save Changes
        </SubmitButton>
      </Form>
    </>
  )
}
