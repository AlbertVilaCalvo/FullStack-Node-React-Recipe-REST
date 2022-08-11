import express, { RequestHandler } from 'express'
import { router } from './router'

const PORT = process.env.PORT ?? 5000

const app = express()

const isDevelopment = app.get('env') === 'development'

app.use(express.json())

if (isDevelopment) {
  const fakeDelay: RequestHandler = (req, res, next) => {
    setTimeout(next, Math.floor(Math.random() * 800 + 200))
  }
  app.use('/api', fakeDelay)
}

app.use('/api', router)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - ${app.get('env')} environment`)
})
