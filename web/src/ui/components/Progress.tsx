import { CircularProgress } from '@chakra-ui/react'

type Props = { message?: string }

export function Progress({ message }: Props) {
  return (
    <div className="progress-container">
      <CircularProgress isIndeterminate size="40px" thickness="4px" />
      {message && <p>{message}</p>}
    </div>
  )
}
