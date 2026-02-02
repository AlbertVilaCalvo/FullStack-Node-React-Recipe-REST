import { Pool, PoolConfig } from 'pg'
import { config } from './config'
import * as fs from 'fs'

export function getDatabaseConfig(): PoolConfig {
  return {
    database: config.databaseName,
    user: config.databaseUser,
    password: config.databasePassword,
    host: config.databaseHost,
    port: config.databasePort,
    ssl: config.isProduction
      ? {
          rejectUnauthorized: true,
          ca: fs.readFileSync('/app/rds-global-bundle.pem').toString(),
        }
      : undefined,
  }
}

export const database = new Pool(getDatabaseConfig())

/**
 * PostgreSQL Error Codes: https://www.postgresql.org/docs/current/errcodes-appendix.html.
 * Also see: https://github.com/LinusU/pg-error-constants.
 */
export const PostgreErrorCode = {
  /** Integrity Constraint Violation */
  UNIQUE_VIOLATION: '23505',
}
