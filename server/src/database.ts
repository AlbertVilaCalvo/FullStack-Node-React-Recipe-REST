import { Pool } from 'pg'
import { config } from './config'

export const database = new Pool({
  database: config.databaseName,
  user: config.databaseUser,
  password: config.databasePassword,
  host: config.databaseHost,
  port: config.databasePort,
})

/**
 * PostgreSQL Error Codes: https://www.postgresql.org/docs/current/errcodes-appendix.html.
 * Also see: https://github.com/LinusU/pg-error-constants.
 */
export const PostgreErrorCode = {
  /** Integrity Constraint Violation */
  UNIQUE_VIOLATION: '23505',
}
