import * as dotenv from 'dotenv'
import { isNumber } from './misc/util'

dotenv.config()

type Config = Readonly<{
  /** PORT */
  port: number
  /** NODE_ENV */
  env: 'development' | 'production'
  isDevelopment: boolean

  /** DB_NAME */
  databaseName: string
  /** DB_USER */
  databaseUser: string
  /** DB_PASSWORD */
  databasePassword: string
  /** DB_HOST */
  databaseHost: string
  /** DB_PORT */
  databasePort: number

  /** JWT_SECRET */
  jwtSecret: string

  /** EMAIL_USER */
  emailUser: string
  /** EMAIL_PASSWORD */
  emailPassword: string
}>

export const config: Config = {
  port: getEnvarAsNumber('PORT'),
  env: getEnvar('NODE_ENV') === 'production' ? 'production' : 'development',
  isDevelopment: getEnvar('NODE_ENV') === 'development',

  databaseName: getEnvar('DB_NAME'),
  databaseUser: getEnvar('DB_USER'),
  databasePassword: getEnvar('DB_PASSWORD'),
  databaseHost: getEnvar('DB_HOST'),
  databasePort: getEnvarAsNumber('DB_PORT'),

  jwtSecret: getEnvar('JWT_SECRET'),

  emailUser: getEnvar('EMAIL_USER'),
  emailPassword: getEnvar('EMAIL_PASSWORD'),
}

function getEnvar(environmentVariable: string): string {
  const value = process.env[environmentVariable]
  if (!value) {
    throw Error(`process.env.${environmentVariable} is not defined`)
  }
  return value
}

function getEnvarAsNumber(environmentVariable: string): number {
  const value = getEnvar(environmentVariable)
  if (isNumber(value)) {
    return Number(value)
  } else {
    throw Error(`process.env.${environmentVariable} is not a number`)
  }
}
