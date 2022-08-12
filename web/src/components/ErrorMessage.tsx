import * as React from 'react'

export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return <p className="error-message">{children}</p>
}

type Props = {
  message: string
}

export function ErrorMessagePage({ message }: Props) {
  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <p>{message}</p>
      </div>
    </div>
  )
}
