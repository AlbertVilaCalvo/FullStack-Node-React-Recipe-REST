import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  InputProps,
} from '@chakra-ui/react'
import { EmailInput, PasswordInput, UserNameInput } from './Input'
import * as React from 'react'
import { OptionalChildren } from '../../../misc/Children'

type Props = Pick<InputProps, 'value'> & {
  onChange: (value: string) => void
  isInvalid?: boolean
  errorMessage?: string
}

export function UserNameFormControl({
  value,
  onChange,
  isInvalid,
  errorMessage,
  children,
}: OptionalChildren<Props>) {
  return (
    <FormControl isRequired isInvalid={isInvalid}>
      <FormLabel>Name</FormLabel>
      <UserNameInput value={value} onChange={onChange} />
      {isInvalid && errorMessage && (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      )}
      {children}
    </FormControl>
  )
}

export function EmailFormControl({
  value,
  onChange,
  isInvalid,
  errorMessage,
  children,
}: OptionalChildren<Props>) {
  return (
    <FormControl isRequired isInvalid={isInvalid}>
      <FormLabel>Email</FormLabel>
      <EmailInput value={value} onChange={onChange} />
      {isInvalid && errorMessage && (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      )}
      {children}
    </FormControl>
  )
}

export function PasswordFormControl({
  value,
  onChange,
  isInvalid,
  errorMessage,
  children,
}: OptionalChildren<Props>) {
  return (
    <FormControl isRequired isInvalid={isInvalid}>
      <FormLabel>Password</FormLabel>
      <PasswordInput value={value} onChange={onChange} />
      {isInvalid && errorMessage && (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      )}
      {children}
    </FormControl>
  )
}
