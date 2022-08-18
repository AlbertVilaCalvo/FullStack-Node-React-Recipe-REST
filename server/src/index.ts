import express, { RequestHandler } from 'express'
import { router } from './router'
import { config } from './config'

const app = express()

app.use(express.json())

if (config.isDevelopment) {
  const fakeDelay: RequestHandler = (req, res, next) => {
    setTimeout(next, Math.floor(Math.random() * 800 + 200))
  }
  app.use('/api', fakeDelay)
}

app.use('/api', router)

app.listen(config.port, () => {
  console.log(
    `Server running on port ${config.port} - ${config.env} environment`
  )
})
