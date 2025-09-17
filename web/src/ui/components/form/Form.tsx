import type { StackProps } from '@chakra-ui/react'
import { Stack } from '@chakra-ui/react'

export function Form(props: StackProps) {
  return (
    <Stack as="form" spacing={6} {...props}>
      {props.children}
    </Stack>
  )
}
