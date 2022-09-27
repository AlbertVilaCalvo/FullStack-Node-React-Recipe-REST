import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { H1 } from '../../components/Headers'
import * as AuthApi from '../../../auth/AuthApi'
import { useErrorToast, useSuccessToast } from '../../misc/toast'
import { extractApiErrorMessage, isApiError } from '../../../httpClient'
import { PasswordFormControl } from '../../components/form/FormControl'
import { ValidationError } from '../../../misc/validations'
import { SubmitButton } from '../../components/form/SubmitButton'
import { Form } from '../../components/form/Form'
import { ErrorMessagePage } from '../../components/ErrorMessage'

export function PasswordResetPage() {
  const navigate = useNavigate()

  const showErrorToast = useErrorToast()
  const showSuccessToast = useSuccessToast()

  const [newPassword, setNewPassword] = React.useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return <ErrorMessagePage message="Missing token" />
  }

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    if (newPassword !== newPasswordConfirm) {
      showErrorToast(ValidationError.PASSWORDS_DONT_MATCH)
      return
    }
    setLoading(true)
    AuthApi.resetPassword(token, newPassword)
      .then((response) => {
        if (isApiError(response)) {
          // The token has expired
          showErrorToast(response.error.message)
          setLoading(false)
        } else {
          showSuccessToast('Password changed successfully!')
          navigate('/')
        }
      })
      .catch((error) => {
        const errorMessage = extractApiErrorMessage(error)
        showErrorToast(errorMessage)
        setLoading(false)
      })
  }

  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>Reset Password</H1>

        <Form onSubmit={onSubmit}>
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
            isLoading={loading}
            alignSelf="flex-start"
            isDisabled={
              newPassword.length === 0 || newPasswordConfirm.length === 0
            }
          >
            Set Password
          </SubmitButton>
        </Form>
      </div>
    </div>
  )
}
