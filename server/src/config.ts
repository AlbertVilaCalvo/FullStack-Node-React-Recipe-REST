import * as dotenv from 'dotenv'

dotenv.config()

// Fix error "Type 'string | undefined' is not assignable to type 'string'."
// https://stackoverflow.com/a/50235545/4034572
declare let process: {
  env: {
    [key: string]: string
  }
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
  port: Number(process.env.PORT),
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  isDevelopment: process.env.NODE_ENV === 'development',

  databaseName: process.env.DB_NAME,
  databaseUser: process.env.DB_USER,
  databasePassword: process.env.DB_PASSWORD,
  databaseHost: process.env.DB_HOST,
  databasePort: Number(process.env.DB_PORT),
}
