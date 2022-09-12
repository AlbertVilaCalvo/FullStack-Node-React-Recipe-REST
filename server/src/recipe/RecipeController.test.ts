import * as RecipeController from './RecipeController'
import * as HttpMocks from 'node-mocks-http'
import { StatusCode } from '../misc/StatusCode'

/* eslint-disable @typescript-eslint/no-empty-function */

describe('RecipeController', () => {
  describe('createRecipe', () => {
    test('should return 400 and ApiError if title is missing/empty', async () => {
      const req = HttpMocks.createRequest({
        method: 'POST',
        url: '/recipes',
        body: {
          title: '',
          cooking_time_minutes: 10,
        },
      })
      const res = HttpMocks.createResponse()

      await RecipeController.createRecipe(req, res, () => {})

      expect(res._isEndCalled()).toBe(true)
      expect(res.statusCode).toBe(StatusCode.BAD_REQUEST_400)
      expect(res._isJSON()).toBe(true)
      expect(res._getJSONData().error.code).toBe('title_required')
      expect(res._getJSONData().error.message).toContain('title')
    })

    test('should return 400 and ApiError if cooking_time_minutes is missing/empty', async () => {
      const req = HttpMocks.createRequest({
        method: 'POST',
        url: '/recipes',
        body: {
          title: 'Soup',
        },
      })
      const res = HttpMocks.createResponse()

      await RecipeController.createRecipe(req, res, () => {})

      expect(res._isEndCalled()).toBe(true)
      expect(res.statusCode).toBe(StatusCode.BAD_REQUEST_400)
      expect(res._isJSON()).toBe(true)
      expect(res._getJSONData().error.code).toBe(
        'cooking_time_minutes_required'
      )
      expect(res._getJSONData().error.message).toContain('cooking_time_minutes')
    })

    test('should return 500 if req.user is not set', async () => {
      const req = HttpMocks.createRequest({
        method: 'POST',
        url: '/recipes',
        body: {
          title: 'Soup',
          cooking_time_minutes: 10,
        },
      })
      const res = HttpMocks.createResponse()

      await RecipeController.createRecipe(req, res, () => {})

      expect(res._isEndCalled()).toBe(true)
      expect(res.statusCode).toBe(StatusCode.INTERNAL_SERVER_ERROR_500)
    })
  })
})
