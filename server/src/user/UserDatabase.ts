import { User } from './User'
import { database, PostgreErrorCode } from '../database'
import { DatabaseError } from 'pg'

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  } else {
    console.error('UserDatabase - Not an instanceof error', error)
    return Error('Unknown error')
  }
}

export async function getUserByEmail(
  email: string
): Promise<User | 'user-not-found' | Error> {
  try {
    const result = await database.query<User>(
      'SELECT * FROM "user" WHERE email = $1',
      [email.toLowerCase()]
    )
    if (result.rows[0]) {
      const user: User = result.rows[0]
      return user
    } else {
      console.info(
        `UserDatabase - getUserByEmail - User with email ${email} not found`
      )
      return 'user-not-found'
    }
  } catch (error) {
    console.error(
      `UserDatabase - getUserByEmail with email = ${email} error`,
      error
    )
    return toError(error)
  }
}

export async function insertNewUser(
  name: string,
  email: string,
  passwordHash: string
): Promise<User | 'duplicate-email-error' | Error> {
  return database
    .query(
      'INSERT INTO "user" (name, email, password) VALUES($1, $2, $3) RETURNING *',
      [name, email.toLowerCase(), passwordHash]
    )
    .then((result) => {
      const user: User = result.rows[0]
      return user
    })
    .catch((error) => {
      console.error(`UserDatabase - insertNewUser error`, error)
      if (
        error instanceof DatabaseError &&
        error.code === PostgreErrorCode.UNIQUE_VIOLATION &&
        error.constraint === 'user_email_key'
      ) {
        return 'duplicate-email-error'
      }
      return toError(error)
    })
}