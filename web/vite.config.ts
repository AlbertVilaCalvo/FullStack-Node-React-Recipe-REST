/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const ENV_DIR = './../'
const PREFIXES = '' // Only load env variables prefixed with VITE_

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ENV_DIR, PREFIXES)

  if (!env.VITE_PORT) {
    throw new Error(`Missing required environment variable VITE_PORT`)
  }

  return {
    server: {
      port: parseInt(env.VITE_PORT),
    },
    envDir: '../',
    build: {
      outDir: 'build',
      // sourcemap: true
    },
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  }
})
