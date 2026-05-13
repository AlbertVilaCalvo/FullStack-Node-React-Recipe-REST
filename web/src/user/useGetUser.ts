import * as React from 'react'
import type { PublicUser } from './User'
import * as UserApi from './UserApi'
import { isValidId } from '../misc/validations'
import { is404NotFound } from '../httpClient'

export function useGetUser(
  userId: number
): 'loading' | PublicUser | '404-not-found' | Error {
  const [result, setResult] = React.useState<
    | {
        userId: number
        value: PublicUser | '404-not-found' | Error
      }
    | undefined
  >()

  React.useEffect(() => {
    if (!isValidId(userId)) {
      return
    }

    let cancelled = false

    UserApi.getUser(userId)
      .then((user) => {
        if (!cancelled) {
          setResult({ userId, value: user })
        }
      })
      .catch((error) => {
        console.log(`useGetUser error`, error)
        if (cancelled) {
          return
        }
        if (is404NotFound(error)) {
          setResult({ userId, value: '404-not-found' })
        } else {
          setResult({ userId, value: error })
        }
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  if (!isValidId(userId)) {
    return '404-not-found'
  }

  if (!result || result.userId !== userId) {
    return 'loading'
  }

  return result.value
}
