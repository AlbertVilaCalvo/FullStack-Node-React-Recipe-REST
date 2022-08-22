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
  port: number
  env: 'development' | 'production'
  isDevelopment: boolean

  databaseName: string
  databaseUser: string
  databasePassword: string
  databaseHost: string
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
