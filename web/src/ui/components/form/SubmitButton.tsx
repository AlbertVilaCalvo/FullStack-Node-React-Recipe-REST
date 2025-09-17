import type { ButtonProps } from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'

type Props = Omit<ButtonProps, 'type'>

export function SubmitButton(props: Props) {
  return (
    <Button type="submit" colorScheme="teal" {...props}>
      {props.children}
    </Button>
  )
}
