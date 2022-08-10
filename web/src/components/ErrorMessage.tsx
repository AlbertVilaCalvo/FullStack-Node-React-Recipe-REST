type Props = {
  message: string
}

export function ErrorMessage({ message }: Props) {
  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <p>{message}</p>
      </div>
    </div>
  )
}
