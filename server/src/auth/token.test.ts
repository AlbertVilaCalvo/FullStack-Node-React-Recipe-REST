import { IncomingHttpHeaders } from 'http'
import { getAuthTokenFromHeader } from './token'

describe('getAuthTokenFromHeader', () => {
  test('should return Error if the Authorization header is missing', async () => {
    const headers: IncomingHttpHeaders = {}

    const result = getAuthTokenFromHeader(headers)
    expect(result instanceof Error).toBe(true)
  })

  test('should return Error if the Authorization header is empty', async () => {
    const headers: IncomingHttpHeaders = {
      authorization: '',
    }

    const result = getAuthTokenFromHeader(headers)
    expect(result instanceof Error).toBe(true)
  })

  test('should return Error if the Authorization header format is not Bearer ${token}', async () => {
    const headers: IncomingHttpHeaders = {
      authorization: 'XYZ',
    }

    const result = getAuthTokenFromHeader(headers)
    expect(result instanceof Error).toBe(true)
  })

  test('should return Error if the auth token is empty', async () => {
    const headers: IncomingHttpHeaders = {
      authorization: 'Bearer ',
    }

    const result = getAuthTokenFromHeader(headers)
    expect(result instanceof Error).toBe(true)
  })

  test('should return the auth token if the Authorization header format is correct', async () => {
    const authToken = 'abcd'
    const headers: IncomingHttpHeaders = {
      authorization: `Bearer ${authToken}`,
    }

    const result = getAuthTokenFromHeader(headers)
    expect(result).toBe(authToken)
  })
})
