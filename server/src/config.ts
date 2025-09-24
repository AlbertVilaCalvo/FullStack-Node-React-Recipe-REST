import * as dotenv from 'dotenv'
import { isNumber } from './misc/util'

dotenv.config()

type Environment = 'development' | 'production' | 'test'

type Config = Readonly<{
  /** SERVER_PORT */
  port: number

  /** NODE_ENV */
  environment: Environment
  isDevelopment: boolean
  isProduction: boolean
  isTest: boolean

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
  port: getEnvarAsNumber('SERVER_PORT'),

  environment: getEnvironment(),
  isDevelopment: getEnvironment() === 'development',
  isProduction: getEnvironment() === 'production',
  isTest: getEnvironment() === 'test',

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

function getEnvironment(): Environment {
  const value = process.env.NODE_ENV
  if (!value) {
    throw Error(`process.env.NODE_ENV is not defined`)
  }
  if (value !== 'development' && value !== 'production' && value !== 'test') {
    throw Error(
      `process.env.NODE_ENV value '${value}' is not valid. Allowed values are 'development', 'production' and 'test'.`
    )
  }
  return value
}
