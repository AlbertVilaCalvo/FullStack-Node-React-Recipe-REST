import * as HttpMocks from 'node-mocks-http'
import { StatusCode } from '../misc/StatusCode'
import { validateParamRecipeId } from './validateParamMiddleware'

const next = jest.fn(() => {})

describe('validateParamRecipeId', () => {
  test.each([
    { recipeId: '-1', type: 'negative' },
    { recipeId: '0', type: 'zero' },
    { recipeId: 'aaa', type: 'text, not a number' },
  ])('returns 404 if the param recipeId is $type', ({ recipeId }) => {
    const request = HttpMocks.createRequest({
      params: {
        recipeId: recipeId,
      },
    })
    const response = HttpMocks.createResponse()

    validateParamRecipeId(request, response, next)

    expect(response._isEndCalled()).toBe(true)
    expect(response.statusCode).toBe(StatusCode.NOT_FOUND_404)
    expect(next).toHaveBeenCalledTimes(0)
  })

  test('calls next middleware if the param recipeId is correct', () => {
    const request = HttpMocks.createRequest({
      params: {
        recipeId: '22',
      },
    })
    const response = HttpMocks.createResponse()

    validateParamRecipeId(request, response, next)

    expect(response._isEndCalled()).toBe(false)
    expect(response.statusCode).not.toBe(StatusCode.NOT_FOUND_404)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
