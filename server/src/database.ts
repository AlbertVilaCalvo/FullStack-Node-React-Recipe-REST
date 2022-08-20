import { Pool } from 'pg'
import { config } from './config'

export const database = new Pool({
  database: config.databaseName,
  user: config.databaseUser,
  password: config.databasePassword,
  host: config.databaseHost,
  port: config.databasePort,
})
