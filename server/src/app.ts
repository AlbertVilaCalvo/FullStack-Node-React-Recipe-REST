import express, { RequestHandler } from 'express'
import { router } from './router'
import { config } from './config'
import cors from 'cors'
import morgan from 'morgan'

const app = express()

app.use(express.json())

if (config.isDevelopment) {
  const fakeDelay: RequestHandler = (req, res, next) => {
    setTimeout(next, Math.floor(Math.random() * 800 + 200))
  }
  app.use('/api', fakeDelay)
}

app.use(
  cors({
    origin: ['http://localhost:3000'],
  })
)

if (config.isDevelopment) {
  app.use(morgan('dev'))
} else if (config.isProduction) {
  app.use(morgan('combined'))
}

app.use('/api', router)

export { app }
