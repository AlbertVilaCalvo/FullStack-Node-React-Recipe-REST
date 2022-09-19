import { User } from './User'
import {
  updateUserEmail as updateUserEmailService,
  updateUserPassword as updateUserPasswordService,
} from './UserService'
import {
  updateUserEmail as updateUserEmailDatabase,
  updateUserPassword as updateUserPasswordDatabase,
} from './UserDatabase'
import { checkIfPasswordsMatch, hashPassword } from '../auth/password'

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
    updateUserEmailDatabaseMock.mockResolvedValueOnce('success')

    const result = await updateUserEmailService(USER, 'pwd', 'x@y.z')

    expect(result).toBe('success')
  })
})

describe('UserService.updateUserPassword', () => {
  test("should return 'invalid-password' if currentPassword is not correct", async () => {
    const checkIfPasswordsMatchMock = jest.mocked(checkIfPasswordsMatch)
    checkIfPasswordsMatchMock.mockResolvedValueOnce(false)

    const result = await updateUserPasswordService(USER, 'current', 'new_pass')

    expect(result).toBe('invalid-password')
  })

  test("should return 'unrecoverable-error' if password check throws Error", async () => {
    const checkIfPasswordsMatchMock = jest.mocked(checkIfPasswordsMatch)
    checkIfPasswordsMatchMock.mockRejectedValueOnce(
      'checkIfPasswordsMatch Error'
    )

    const result = await updateUserPasswordService(USER, 'current', 'new_pass')

    expect(result).toBe('unrecoverable-error')
  })

  test("should return 'unrecoverable-error' if hashPassword throws Error", async () => {
    const checkIfPasswordsMatchMock = jest.mocked(checkIfPasswordsMatch)
    checkIfPasswordsMatchMock.mockResolvedValueOnce(true)

    const hashPasswordMock = jest.mocked(hashPassword)
    hashPasswordMock.mockRejectedValueOnce('hashPassword Error')

    const result = await updateUserPasswordService(USER, 'current', 'new_pass')

    expect(result).toBe('unrecoverable-error')
  })

  test('should pass the hash from hashPassword to database update', async () => {
    const checkIfPasswordsMatchMock = jest.mocked(checkIfPasswordsMatch)
    checkIfPasswordsMatchMock.mockResolvedValueOnce(true)

    const passwordHash = 'The-password-hash'
    const hashPasswordMock = jest.mocked(hashPassword)
    hashPasswordMock.mockResolvedValueOnce(passwordHash)

    const updateUserPasswordDatabaseMock = jest.mocked(
      updateUserPasswordDatabase
    )
    updateUserPasswordDatabaseMock.mockResolvedValueOnce('success')

    await updateUserPasswordService(USER, 'current', 'new_pass')

    expect(updateUserPasswordDatabaseMock).toHaveBeenCalledTimes(1)
    expect(updateUserPasswordDatabaseMock).toHaveBeenCalledWith(
      USER.id,
      passwordHash
    )
  })

  test("should return 'unrecoverable-error' if database update throws Error", async () => {
    const checkIfPasswordsMatchMock = jest.mocked(checkIfPasswordsMatch)
    checkIfPasswordsMatchMock.mockResolvedValueOnce(true)

    const hashPasswordMock = jest.mocked(hashPassword)
    hashPasswordMock.mockResolvedValueOnce('The-password-hash')

    const updateUserPasswordDatabaseMock = jest.mocked(
      updateUserPasswordDatabase
    )
    updateUserPasswordDatabaseMock.mockResolvedValueOnce(
      Error('updateUserPasswordDatabase Error')
    )

    const result = await updateUserPasswordService(USER, 'current', 'new_pass')

    expect(result).toBe('unrecoverable-error')
  })

  test("should return 'user-not-found' if database update returns 'user-not-found'", async () => {
    const checkIfPasswordsMatchMock = jest.mocked(checkIfPasswordsMatch)
    checkIfPasswordsMatchMock.mockResolvedValueOnce(true)

    const hashPasswordMock = jest.mocked(hashPassword)
    hashPasswordMock.mockResolvedValueOnce('The-password-hash')

    const updateUserPasswordDatabaseMock = jest.mocked(
      updateUserPasswordDatabase
    )
    updateUserPasswordDatabaseMock.mockResolvedValueOnce('user-not-found')

    const result = await updateUserPasswordService(USER, 'current', 'new_pass')

    expect(result).toBe('user-not-found')
  })

  test("should return 'success' if database update succeeds", async () => {
    const checkIfPasswordsMatchMock = jest.mocked(checkIfPasswordsMatch)
    checkIfPasswordsMatchMock.mockResolvedValueOnce(true)

    const hashPasswordMock = jest.mocked(hashPassword)
    hashPasswordMock.mockResolvedValueOnce('The-password-hash')

    const updateUserPasswordDatabaseMock = jest.mocked(
      updateUserPasswordDatabase
    )
    updateUserPasswordDatabaseMock.mockResolvedValueOnce('success')

    const result = await updateUserPasswordService(USER, 'current', 'new_pass')

    expect(result).toBe('success')
  })
})
