/**
 * Loads environment variables from .env.test before each test suite, to
 * avoid the error "process.env.SERVER_PORT is not defined" in config.ts.
 */
require('dotenv').config({ path: '../.env.test' })
