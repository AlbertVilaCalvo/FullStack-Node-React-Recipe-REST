import { app } from './app'
import { config } from './config'
import { runMigrations } from './database/run-migrations'

async function startServer(): Promise<void> {
  try {
    await runMigrations()

    app.listen(config.port, () => {
      console.log(
        `Server running on port ${config.port} - ${config.environment} environment`
      )
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
