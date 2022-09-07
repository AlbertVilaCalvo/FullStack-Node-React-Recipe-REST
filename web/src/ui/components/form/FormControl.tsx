import * as React from 'react'
import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  InputProps,
} from '@chakra-ui/react'
import {
  CustomInputProps,
  EmailInput,
  PasswordInput,
  UserNameInput,
} from './Input'
import { OptionalChildren } from '../../../misc/Children'

type Props = Pick<InputProps, 'value'> &
  Pick<CustomInputProps, 'onChange'> &
  Pick<FormControlProps, 'isInvalid'> &
  OptionalChildren<{
    errorMessage?: string
    helperText?: string
  }>

function BaseFormControl({
  value,
  onChange,
  isInvalid,
  errorMessage,
  helperText,
  children,
  Input,
}: {
  Input: React.ComponentType<CustomInputProps>
} & Props) {
  return (
    <FormControl isRequired isInvalid={isInvalid}>
      <FormLabel>Name</FormLabel>
      <Input value={value} onChange={onChange} />
      {isInvalid && errorMessage ? (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      ) : helperText ? (
        <FormHelperText>{helperText}</FormHelperText>
      ) : null}
      {children}
    </FormControl>
  )
}

export function UserNameFormControl(props: Props) {
  return <BaseFormControl Input={UserNameInput} {...props} />
}

export function EmailFormControl(props: Props) {
  return <BaseFormControl Input={EmailInput} {...props} />
}

export function PasswordFormControl(props: Props) {
  return <BaseFormControl Input={PasswordInput} {...props} />
}
