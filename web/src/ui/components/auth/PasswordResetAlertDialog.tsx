import * as React from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  UseDisclosureProps,
  Flex,
} from '@chakra-ui/react'
import { EmailFormControl } from '../form/FormControl'
import { isValidEmail, ValidationError } from '../../../misc/validations'
import { SubmitButton } from '../form/SubmitButton'
import { Form } from '../form/Form'
import * as AuthApi from '../../../auth/AuthApi'
import { extractApiErrorMessage } from '../../../httpClient'
import { useErrorToast, useSuccessToast } from '../../misc/toast'
import { isDev } from '../../../misc/utils'

type Props = Required<Pick<UseDisclosureProps, 'isOpen' | 'onClose'>>

export function PasswordResetAlertDialog({ isOpen, onClose }: Props) {
  const showSuccessToast = useSuccessToast()
  const showErrorToast = useErrorToast()

  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const [email, setEmail] = React.useState(isDev ? 'a@a.com' : '')
  const [emailNotValid, setEmailNotValid] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    if (!isValidEmail(email)) {
      setEmailNotValid(true)
      return
    }
    setLoading(true)
    AuthApi.sendResetPasswordEmail(email)
      .then(() => {
        showSuccessToast('Check your inbox for an email.')
        onClose()
      })
      .catch((error) => {
        const errorMessage = extractApiErrorMessage(error)
        showErrorToast(errorMessage)
      })
      .finally(() => {
        // We need to set loading false for success too, because the loading
        // state persist when the AlertDialog is shown again.
        setLoading(false)
      })
  }

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Reset Password
          </AlertDialogHeader>

          <AlertDialogBody>
            We'll send you an email to reset your password.
          </AlertDialogBody>

          <Form onSubmit={onSubmit} ml={6} mr={6}>
            <EmailFormControl
              value={email}
              onChange={(value) => {
                setEmail(value)
                setEmailNotValid(false)
              }}
              isInvalid={emailNotValid}
              errorMessage={ValidationError.EMAIL_FORMAT}
            />

            <Flex justifyContent="end" paddingBottom={6}>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <SubmitButton isLoading={loading} colorScheme="teal" ml={3}>
                Reset Password
              </SubmitButton>
            </Flex>
          </Form>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
