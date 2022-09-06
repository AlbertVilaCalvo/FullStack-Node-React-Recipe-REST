import * as React from 'react'
import { useParams } from 'react-router-dom'
import { useGetUser } from '../../../user/useGetUser'
import { isError, isLoading } from '../../../misc/result'
import { Progress } from '../../components/Progress'
import { NotFound404Page } from '../NotFound404Page'
import { ErrorMessagePage } from '../../components/ErrorMessage'
import { H1 } from '../../components/H1'

export function UserDetailPage() {
  const params = useParams()
  const userId = Number(params.userId)

  const getUserResult = useGetUser(userId)

  if (isLoading(getUserResult)) {
    return <Progress />
  }

  if (getUserResult === '404-not-found') {
    return (
      <NotFound404Page message={`User with id ${params.userId} not found.`} />
    )
  }

  if (isError(getUserResult)) {
    return <ErrorMessagePage message={getUserResult.message} />
  }

  const user = getUserResult

  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>{user.name}</H1>
        <p>{`ID: ${userId}`}</p>
      </div>
    </div>
  )
}
