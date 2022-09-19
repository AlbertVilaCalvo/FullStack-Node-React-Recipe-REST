import { H2 } from '../../components/Headers'
import { useErrorToast, useSuccessToast } from '../../misc/toast'
import * as React from 'react'
import { PasswordFormControl } from '../../components/form/FormControl'
import { ValidationError } from '../../../misc/validations'
import { SubmitButton } from '../../components/form/SubmitButton'
import { Form } from '../../components/form/Form'
import * as MyAccountApi from '../../../myaccount/MyAccountApi'
import { isApiError } from '../../../httpClient'

export function ChangePasswordPage() {
  const showErrorToast = useErrorToast()
  const showSuccessToast = useSuccessToast()

  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    if (newPassword !== newPasswordConfirm) {
      showErrorToast(ValidationError.PASSWORDS_DONT_MATCH)
      return
    }
    setLoading(true)
    MyAccountApi.updatePassword(currentPassword, newPassword)
      .then((response) => {
        if (isApiError(response)) {
          showErrorToast(response.error.message)
        } else {
          showSuccessToast('Password changed')
        }
        setLoading(false)
      })
      .catch((error) => {
        showErrorToast(error.message)
        setLoading(false)
      })
  }

  return (
    <>
      <H2>Password</H2>
      <Form onSubmit={onSubmit} marginTop={15}>
        <PasswordFormControl
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <PasswordFormControl
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
        />
        <PasswordFormControl
          label="Confirm New Password"
          value={newPasswordConfirm}
          onChange={setNewPasswordConfirm}
        />

        <SubmitButton
          isDisabled={
            currentPassword.length === 0 ||
            newPassword.length === 0 ||
            newPasswordConfirm.length === 0
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
