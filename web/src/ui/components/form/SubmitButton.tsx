import { Button, ButtonProps } from '@chakra-ui/react'
import * as React from 'react'

type Props = Omit<ButtonProps, 'type'>

export function SubmitButton(props: Props) {
  return (
    <Button type="submit" colorScheme="teal" {...props}>
      {props.children}
    </Button>
  )
}
