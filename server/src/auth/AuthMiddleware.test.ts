import * as HttpMocks from 'node-mocks-http'
import { requireLoggedUser } from './AuthMiddleware'
import { StatusCode } from '../misc/StatusCode'
import { generateAuthToken } from './authtoken'
import { getUserById } from '../user/UserDatabase'
import { User } from '../user/User'

jest.mock('../user/UserDatabase')

const USER: User = {
  id: 50,
  name: 'Pere',
  password: 'hash',
  email: 'x@y.co',
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const next = jest.fn(() => {})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function expect401(res: HttpMocks.MockResponse<any>) {
  expect(res._isEndCalled()).toBe(true)
  expect(res.statusCode).toBe(StatusCode.UNAUTHORIZED_401)
  expect(res._isJSON()).toBe(true)
  expect(res._getJSONData().error.code).toBe('valid_auth_token_required')
  expect(res._getJSONData().error.message).toContain('Authorization')
  expect(next).toHaveBeenCalledTimes(0)
}

describe('AuthMiddleware.requireLoggedUser', () => {
  test('should return 401 if the Authorization header is missing', async () => {
    const req = HttpMocks.createRequest({
      method: 'POST',
      url: '/recipes',
      // missing headers
    })
    const res = HttpMocks.createResponse()

    await requireLoggedUser(req, res, next)

    expect401(res)
  })

  test('should return 401 if the auth token is empty', async () => {
    const authToken = ''
    const req = HttpMocks.createRequest({
      method: 'POST',
      url: '/recipes',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    const res = HttpMocks.createResponse()

    await requireLoggedUser(req, res, next)

    expect401(res)
  })

  test('should return 401 if the auth token user is not found', async () => {
    const authToken = generateAuthToken(USER.id)
    const req = HttpMocks.createRequest({
      method: 'POST',
      url: '/recipes',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    const res = HttpMocks.createResponse()

    const getUserByIdMock = jest.mocked(getUserById)
    getUserByIdMock.mockResolvedValueOnce('user-not-found')

    await requireLoggedUser(req, res, next)

    expect401(res)
  })

  test('should return 500 if the database query for user throws Error', async () => {
    const authToken = generateAuthToken(USER.id)
    const req = HttpMocks.createRequest({
      method: 'POST',
      url: '/recipes',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    const res = HttpMocks.createResponse()

    const getUserByIdMock = jest.mocked(getUserById)
    getUserByIdMock.mockResolvedValueOnce(Error('Test'))

    await requireLoggedUser(req, res, next)

    expect(res._isEndCalled()).toBe(true)
    expect(res.statusCode).toBe(StatusCode.INTERNAL_SERVER_ERROR_500)
    expect(next).toHaveBeenCalledTimes(0)
  })

  test('should call the next middleware if the auth token is valid', async () => {
    const authToken = generateAuthToken(USER.id)
    const req = HttpMocks.createRequest({
      method: 'POST',
      url: '/recipes',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    const res = HttpMocks.createResponse()

    const getUserByIdMock = jest.mocked(getUserById)
    getUserByIdMock.mockResolvedValueOnce(USER)

    await requireLoggedUser(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res._isEndCalled()).toBe(false)
    expect(res.statusCode).not.toBe(StatusCode.UNAUTHORIZED_401)
  })

  test('should set req.user if the auth token is valid', async () => {
    const authToken = generateAuthToken(USER.id)
    const req = HttpMocks.createRequest({
      method: 'POST',
      url: '/recipes',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    const res = HttpMocks.createResponse()

    const getUserByIdMock = jest.mocked(getUserById)
    getUserByIdMock.mockResolvedValueOnce(USER)

    await requireLoggedUser(req, res, next)

    expect(req.user).toEqual(USER)
  })
})
