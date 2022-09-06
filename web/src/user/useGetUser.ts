import * as React from 'react'
import { PublicUser } from './User'
import * as UserApi from './UserApi'
import { isValidId } from '../misc/validations'
import { is404NotFound } from '../httpClient'

export function useGetUser(
  userId: number
): 'loading' | PublicUser | '404-not-found' | Error {
  const [result, setResult] =
    React.useState<ReturnType<typeof useGetUser>>('loading')

  React.useEffect(() => {
    if (!isValidId(userId)) {
      setResult('404-not-found')
      return
    }
    setResult('loading')
    UserApi.getUser(userId)
      .then((user) => {
        setResult(user)
      })
      .catch((error) => {
        console.log(`useGetUser error`, error)
        if (is404NotFound(error)) {
          setResult('404-not-found')
        } else {
          setResult(error)
        }
      })
  }, [userId])

  return result
}
