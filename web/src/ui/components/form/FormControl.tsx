import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
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
  helperText?: string
}

export function UserNameFormControl({
  value,
  onChange,
  isInvalid,
  errorMessage,
  helperText,
  children,
}: OptionalChildren<Props>) {
  return (
    <FormControl isRequired isInvalid={isInvalid}>
      <FormLabel>Name</FormLabel>
      <UserNameInput value={value} onChange={onChange} />
      {isInvalid && errorMessage ? (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      ) : helperText ? (
        <FormHelperText>{helperText}</FormHelperText>
      ) : null}
      {children}
    </FormControl>
  )
}

export function EmailFormControl({
  value,
  onChange,
  isInvalid,
  errorMessage,
  helperText,
  children,
}: OptionalChildren<Props>) {
  return (
    <FormControl isRequired isInvalid={isInvalid}>
      <FormLabel>Email</FormLabel>
      <EmailInput value={value} onChange={onChange} />
      {isInvalid && errorMessage ? (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      ) : helperText ? (
        <FormHelperText>{helperText}</FormHelperText>
      ) : null}
      {children}
    </FormControl>
  )
}

export function PasswordFormControl({
  value,
  onChange,
  isInvalid,
  errorMessage,
  helperText,
  children,
}: OptionalChildren<Props>) {
  return (
    <FormControl isRequired isInvalid={isInvalid}>
      <FormLabel>Password</FormLabel>
      <PasswordInput value={value} onChange={onChange} />
      {isInvalid && errorMessage ? (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      ) : helperText ? (
        <FormHelperText>{helperText}</FormHelperText>
      ) : null}
      {children}
    </FormControl>
  )
}
