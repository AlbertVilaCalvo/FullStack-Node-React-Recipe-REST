import { Input, InputProps } from '@chakra-ui/react'
import { EMAIL_MAX_LENGTH } from '../../misc/validations'

type Props = Omit<InputProps, 'onChange'> & {
  onChange: (value: string) => void
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
