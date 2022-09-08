import { isValidId } from './validations'

describe('isValidId', () => {
  test('should return true for numbers > 0', () => {
    const result = isValidId(3)
    expect(result).toBe(true)
  })

  test('should return false for 0', () => {
    const result = isValidId(0)
    expect(result).toBe(false)
  })

  test('should return false for negative numbers', () => {
    const result = isValidId(-1)
    expect(result).toBe(false)
  })

  test('should return false for NaN', () => {
    const result = isValidId(NaN)
    expect(result).toBe(false)
  })
})
