import { CircularProgress } from '@chakra-ui/react'

export function Progress() {
  return (
    <div className="progress-container">
      <CircularProgress isIndeterminate size="40px" thickness="4px" />
    </div>
  )
}
