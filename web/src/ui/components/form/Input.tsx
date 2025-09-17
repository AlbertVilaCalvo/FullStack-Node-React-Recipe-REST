import * as React from 'react'
import { Button, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import type { InputProps } from '@chakra-ui/react'
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USER_NAME_MAX_LENGTH,
} from '../../../misc/validations'

export type CustomInputProps = Omit<
  InputProps,
  'placeholder' | 'type' | 'maxLength' | 'onChange'
> & {
  onChange: (value: string) => void
}

export function UserNameInput({ onChange, ...props }: CustomInputProps) {
  return (
    <Input
      placeholder="Name"
      type="text"
      maxLength={USER_NAME_MAX_LENGTH}
      onChange={(event) => {
        onChange(event.target.value)
      }}
      {...props}
    />
  )
}

export function EmailInput({ onChange, ...props }: CustomInputProps) {
  return (
    <Input
      placeholder="Email"
      type="email"
      maxLength={EMAIL_MAX_LENGTH}
      onChange={(event) => {
        onChange(event.target.value)
      }}
      {...props}
    />
  )
}

// https://chakra-ui.com/docs/components/input/usage#password-input-example
export function PasswordInput({ onChange, ...props }: CustomInputProps) {
  const [show, setShow] = React.useState(false)
  const handleClick = () => setShow(!show)

  return (
    <InputGroup size="md">
      <Input
        placeholder="Password"
        type={show ? 'text' : 'password'}
        minLength={PASSWORD_MIN_LENGTH}
        maxLength={PASSWORD_MAX_LENGTH}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        {...props}
      />
      <InputRightElement width="4.5rem">
        <Button h="1.75rem" size="sm" onClick={handleClick}>
          {show ? 'Hide' : 'Show'}
        </Button>
      </InputRightElement>
    </InputGroup>
  )
}
