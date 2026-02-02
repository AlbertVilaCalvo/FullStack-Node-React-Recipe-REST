import express, { RequestHandler } from 'express'
import { router } from './router'
import { config } from './config'
import cors from 'cors'
import { loggingMiddleware } from './misc/loggingMiddleware'

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
    origin: config.corsOrigins,
  })
)

app.use(loggingMiddleware)

app.use('/api', router)

export { app }
