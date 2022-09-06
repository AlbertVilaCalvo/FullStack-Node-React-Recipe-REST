import { H1 } from '../components/H1'
import { ErrorMessage } from '../components/ErrorMessage'

export function NotFound404Page({ message }: { message?: string }) {
  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>Not Found :/</H1>
        {message && <ErrorMessage>{message}</ErrorMessage>}
      </div>
    </div>
  )
}
