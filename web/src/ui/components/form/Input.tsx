import { Input, InputProps } from '@chakra-ui/react'
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
} from '../../../misc/validations'

type Props = Omit<
  InputProps,
  'placeholder' | 'type' | 'maxLength' | 'onChange'
> & {
  onChange: (value: string) => void
}

export function UserNameInput({ onChange, ...props }: Props) {
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

export function EmailInput({ onChange, ...props }: Props) {
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

export function PasswordInput({ onChange, ...props }: Props) {
  return (
    <Input
      placeholder="Password"
      type="password"
      maxLength={PASSWORD_MAX_LENGTH}
      onChange={(event) => {
        onChange(event.target.value)
      }}
      {...props}
    />
  )
}
