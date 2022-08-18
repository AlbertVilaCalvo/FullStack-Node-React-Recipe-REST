import * as dotenv from 'dotenv'

dotenv.config()

type Config = Readonly<{
  port: number
  env: 'development' | 'production'
  isDevelopment: boolean
}>

export const config: Config = {
  port: Number(process.env.PORT),
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
}
