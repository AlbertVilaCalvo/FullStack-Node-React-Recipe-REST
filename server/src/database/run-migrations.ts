import * as path from 'path'
import { getDatabaseConfig } from '../database'
import type { PoolConfig } from 'pg'

interface RunnerOption {
  // The actual type of databaseUrl is string | ClientConfig (PoolConfig extends ClientConfig)
  databaseUrl: string | PoolConfig
  migrationsTable: string
  dir: string
  direction: 'up' | 'down'
  count: number
  log?: (msg: string) => void
}

interface RunMigration {
  readonly path: string
  readonly name: string
  readonly timestamp: number
}

/**
 * Runs all pending database migrations.
 */
export async function runMigrations(): Promise<void> {
  // Dynamic import required because node-pg-migrate v8 is an ESM-only package
  // Using a variable bypasses TypeScript's module resolution check
  const moduleName = 'node-pg-migrate'
  const { runner } = (await import(moduleName)) as {
    runner: (options: RunnerOption) => Promise<RunMigration[]>
  }

  const migrationsDir = path.resolve(__dirname, '../../migrations')
  console.log(`Running migrations from: ${migrationsDir}`)

  try {
    const migrations = await runner({
      databaseUrl: getDatabaseConfig(),
      migrationsTable: 'pgmigrations',
      dir: migrationsDir,
      direction: 'up',
      count: Infinity,
      log: (msg: string) => console.log(`[node-pg-migrate] ${msg}`),
    })

    if (migrations.length === 0) {
      console.log('No pending migrations to run.')
    } else {
      console.log(`Successfully ran ${migrations.length} migration(s):`)
      migrations.forEach((m) => console.log(`  - ${m.name}`))
    }
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}
