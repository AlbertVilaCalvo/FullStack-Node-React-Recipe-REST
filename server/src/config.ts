import * as dotenv from 'dotenv'

dotenv.config()

function getEnvar(environmentVariable: string): string {
  const value = process.env[environmentVariable]
  if (!value) {
    throw Error(`process.env.${environmentVariable} is not defined`)
  }
  return value
}

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
}>

export const config: Config = {
  port: Number(getEnvar('PORT')),
  env: getEnvar('NODE_ENV') === 'production' ? 'production' : 'development',
  isDevelopment: getEnvar('NODE_ENV') === 'development',

  databaseName: getEnvar('DB_NAME'),
  databaseUser: getEnvar('DB_USER'),
  databasePassword: getEnvar('DB_PASSWORD'),
  databaseHost: getEnvar('DB_HOST'),
  databasePort: Number(getEnvar('DB_PORT')),
}
