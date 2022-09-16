import { User } from './User'
import { updateUserEmail as updateUserEmailService } from './UserService'
import { updateUserEmail as updateUserEmailDatabase } from './UserDatabase'
import { checkIfPasswordsMatch } from '../auth/password'

jest.mock('../auth/password')
jest.mock('./UserDatabase')

const USER: User = {
  id: 10,
  name: 'Albert',
  email: 'a@b.c',
  password: 'hash',
}

describe('UserService.updateUserEmail', () => {
  test("should return 'invalid-password' if password is not correct", async () => {
    const checkIfPasswordsMatchMock = jest.mocked(checkIfPasswordsMatch)
    checkIfPasswordsMatchMock.mockResolvedValueOnce(false)

    const result = await updateUserEmailService(USER, 'pwd', 'x@y.z')

    expect(result).toBe('invalid-password')
  })

  test("should return 'unrecoverable-error' if password check throws Error", async () => {
    const checkIfPasswordsMatchMock = jest.mocked(checkIfPasswordsMatch)
    checkIfPasswordsMatchMock.mockRejectedValueOnce(
      'checkIfPasswordsMatch Error'
    )

    const result = await updateUserEmailService(USER, 'pwd', 'x@y.z')

    expect(result).toBe('unrecoverable-error')
  })

  test("should return 'unrecoverable-error' if database update throws Error", async () => {
    const checkIfPasswordsMatchMock = jest.mocked(checkIfPasswordsMatch)
    checkIfPasswordsMatchMock.mockResolvedValueOnce(true)

    const updateUserEmailDatabaseMock = jest.mocked(updateUserEmailDatabase)
    updateUserEmailDatabaseMock.mockResolvedValueOnce(
      Error('updateUserEmailDatabase Error')
    )

    const result = await updateUserEmailService(USER, 'pwd', 'x@y.z')

    expect(result).toBe('unrecoverable-error')
  })

  test("should return 'user-not-found' if database update returns 'user-not-found'", async () => {
    const checkIfPasswordsMatchMock = jest.mocked(checkIfPasswordsMatch)
    checkIfPasswordsMatchMock.mockResolvedValueOnce(true)

    const updateUserEmailDatabaseMock = jest.mocked(updateUserEmailDatabase)
    updateUserEmailDatabaseMock.mockResolvedValueOnce('user-not-found')

    const result = await updateUserEmailService(USER, 'pwd', 'x@y.z')

    expect(result).toBe('user-not-found')
  })

  test("should return 'success' if database update succeeds", async () => {
    const checkIfPasswordsMatchMock = jest.mocked(checkIfPasswordsMatch)
    checkIfPasswordsMatchMock.mockResolvedValueOnce(true)

    const updateUserEmailDatabaseMock = jest.mocked(updateUserEmailDatabase)
    updateUserEmailDatabaseMock.mockResolvedValueOnce()

    const result = await updateUserEmailService(USER, 'pwd', 'x@y.z')

    expect(result).toBe('success')
  })
})
