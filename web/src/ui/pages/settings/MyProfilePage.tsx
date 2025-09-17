import * as React from 'react'
import { H2 } from '../../components/Headers'
import { useSnapshot } from 'valtio'
import { userStore } from '../../../user/userStore'
import { Form } from '../../components/form/Form'
import { UserNameFormControl } from '../../components/form/FormControl'
import { SubmitButton } from '../../components/form/SubmitButton'
import { NavigateToLogin } from '../../components/navigation/RequireLogin'
import * as MyAccountApi from '../../../myaccount/MyAccountApi'
import { useErrorToast, useSuccessToast } from '../../misc/toast'
import { extractApiErrorMessage } from '../../../httpClient'

export function MyProfilePage() {
  const showSuccessToast = useSuccessToast()
  const showErrorToast = useErrorToast()

  const loggedUserStore = useSnapshot(userStore)
  const snapshotUser = loggedUserStore.user
  const storeUser = userStore.user

  const [name, setName] = React.useState(storeUser?.name ?? '')
  const [loading, setLoading] = React.useState(false)

  // This will never happen (since we use RequireLogin at App) but it gets rid
  // of user being undefined.
  if (!storeUser || !snapshotUser) {
    return <NavigateToLogin />
  }

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    setLoading(true)
    MyAccountApi.updateProfile(name)
      .then((_response) => {
        storeUser.name = name
        showSuccessToast('Profile updated')
      })
      .catch((error) => {
        console.error(`UserApi.updateUserProfile error`, error)
        const errorMessage = extractApiErrorMessage(error)
        showErrorToast(errorMessage)
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
        <UserNameFormControl value={name} onChange={setName} />
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
