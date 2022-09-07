import { ToastPosition, useToast } from '@chakra-ui/react'

const POSITION: ToastPosition = 'top'

type ShowToast = (
  title: string,
  description?: string
) => ReturnType<ReturnType<typeof useToast>>

/**
 * Usage:
 * ```
 * const showSuccessToast = useErrorToast()
 * ...
 * showSuccessToast('Profile updated successfully')
 * ```
 */
export function useSuccessToast(): ShowToast {
  const toast = useToast({
    status: 'success',
    position: POSITION,
    duration: 3000,
    isClosable: true,
  })
  return (title: string, description?: string) => {
    return toast({
      title,
      description,
    })
  }
}

/**
 * Usage:
 * ```
 * const showErrorToast = useErrorToast()
 * ...
 * showErrorToast('An error occurred', error.message)
 * ```
 */
export function useErrorToast() {
  const toast = useToast({
    status: 'error',
    position: POSITION,
    duration: 7000,
    isClosable: true,
  })
  return (title: string, description?: string) => {
    return toast({
      title,
      description,
    })
  }
}
