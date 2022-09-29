import { database } from '../database'
import { toError } from '../misc/util'

export type AuthData = {
  auth_token: string
  user_id: number
  // expires_at: Date
}

export async function saveAuthToken(
  authToken: string,
  userId: number
): Promise<'success' | Error> {
  try {
    await database.query(
      'INSERT INTO auth (auth_token, user_id) VALUES($1, $2)',
      [authToken, userId]
    )
    return 'success'
  } catch (error) {
    console.error(`AuthDatabase - saveAuthToken error`, error)
    return toError(error, 'AuthDatabase - saveAuthToken')
  }
}

export function getByToken(
  authToken: string
): Promise<AuthData | 'token-not-found' | Error> {
  return database
    .query('SELECT * FROM auth WHERE auth_token = $1', [authToken])
    .then((result) => {
      const authData: AuthData = result.rows[0]
      if (authData) {
        return authData
      } else {
        return 'token-not-found'
      }
    })
    .catch((error) => {
      console.error(`AuthDatabase - getByToken error`, error)
      return toError(error, 'AuthDatabase - getByToken')
    })
}
