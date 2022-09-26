import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { H1 } from '../../components/Headers'
import * as AuthApi from '../../../auth/AuthApi'
import { useErrorToast, useSuccessToast } from '../../misc/toast'
import { userStore } from '../../../user/userStore'
import { extractApiErrorMessage, isApiError } from '../../../httpClient'
import { Progress } from '../../components/Progress'

export function VerifyEmailPage() {
  const navigate = useNavigate()

  const showErrorToast = useErrorToast()
  const showSuccessToast = useSuccessToast()

  const [loading, setLoading] = React.useState(true)

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  React.useEffect(() => {
    if (!token) {
      return
    }
    setLoading(true)
    AuthApi.verifyEmail(token)
      .then((response) => {
        if (isApiError(response)) {
          // The token has expired
          showErrorToast(response.error.message)
          setLoading(false)
        } else {
          if (userStore.user) {
            userStore.user.email_verified = true
          }
          showSuccessToast('Email verified successfully!')
          navigate('/')
        }
      })
      .catch((error) => {
        // TODO if request fails we need to provide the user a way to re-try
        const errorMessage = extractApiErrorMessage(error)
        showErrorToast(errorMessage)
        setLoading(false)
      })
  }, [navigate, showErrorToast, showSuccessToast, token])

  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>Verify Email</H1>
        {loading && (
          <div>
            <Progress message="Please wait..." />
          </div>
        )}
      </div>
    </div>
  )
}
