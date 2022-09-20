import * as RecipeController from './RecipeController'
import * as HttpMocks from 'node-mocks-http'
import { StatusCode } from '../misc/StatusCode'
import { User } from '../user/User'
import { Recipe } from './Recipe'
import { insertNewRecipe } from './RecipeDatabase'

jest.mock('./RecipeDatabase')

const USER: User = {
  id: 2,
  name: 'Albert',
  email: 'a@b.c',
  password: 'hash',
}
const RECIPE: Recipe = {
  id: 1,
  title: 'Soup',
  cooking_time_minutes: 10,
  user_id: USER.id,
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const next = () => {}

describe('RecipeController.createRecipe', () => {
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

    await RecipeController.createRecipe(req, res, next)

    expect(res._isEndCalled()).toBe(true)
    expect(res.statusCode).toBe(StatusCode.BAD_REQUEST_400)
    expect(res._isJSON()).toBe(true)
    expect(res._getJSONData().error.code).toBe('too_small')
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

    await RecipeController.createRecipe(req, res, next)

    expect(res._isEndCalled()).toBe(true)
    expect(res.statusCode).toBe(StatusCode.BAD_REQUEST_400)
    expect(res._isJSON()).toBe(true)
    expect(res._getJSONData().error.code).toBe('invalid_type')
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

    await RecipeController.createRecipe(req, res, next)

    expect(res._isEndCalled()).toBe(true)
    expect(res.statusCode).toBe(StatusCode.INTERNAL_SERVER_ERROR_500)
  })

  test('should save the recipe to the database', async () => {
    const req = HttpMocks.createRequest({
      method: 'POST',
      url: '/recipes',
      body: {
        title: RECIPE.title,
        cooking_time_minutes: RECIPE.cooking_time_minutes,
      },
      user: USER,
    })
    const res = HttpMocks.createResponse()

    const insertNewRecipeMock = jest.mocked(insertNewRecipe)
    insertNewRecipeMock.mockResolvedValueOnce(RECIPE)

    await RecipeController.createRecipe(req, res, next)

    expect(insertNewRecipeMock).toHaveBeenCalledTimes(1)
    expect(insertNewRecipeMock).toHaveBeenCalledWith(
      USER.id,
      RECIPE.title,
      RECIPE.cooking_time_minutes
    )
    /*
    Equivalent alternative:
    expect(insertNewRecipeMock.mock.calls.length).toBe(1)
    expect(insertNewRecipeMock.mock.calls[0][0]).toBe(USER.id)
    expect(insertNewRecipeMock.mock.calls[0][1]).toBe(RECIPE.title)
    expect(insertNewRecipeMock.mock.calls[0][2]).toBe(
      RECIPE.cooking_time_minutes
    )
    */
  })

  test('should return 201 and the recipe id if saving the recipe to the database succeeds', async () => {
    const req = HttpMocks.createRequest({
      method: 'POST',
      url: '/recipes',
      body: {
        title: RECIPE.title,
        cooking_time_minutes: RECIPE.cooking_time_minutes,
      },
      user: USER,
    })
    const res = HttpMocks.createResponse()

    const insertNewRecipeMock = jest.mocked(insertNewRecipe)
    insertNewRecipeMock.mockResolvedValueOnce(RECIPE)

    await RecipeController.createRecipe(req, res, next)

    expect(res._isJSON()).toBe(true)
    expect(res._isEndCalled()).toBe(true)
    expect(res.statusCode).toBe(StatusCode.CREATED_201)
    expect(res._getJSONData().id).toBe(RECIPE.id)
    expect(res._getHeaders().location).toContain(`recipes/${RECIPE.id}`)
  })

  test('should return 500 if saving the recipe to the database fails', async () => {
    const req = HttpMocks.createRequest({
      method: 'POST',
      url: '/recipes',
      body: {
        title: RECIPE.title,
        cooking_time_minutes: RECIPE.cooking_time_minutes,
      },
      user: USER,
    })
    const res = HttpMocks.createResponse()

    const insertNewRecipeMock = jest.mocked(insertNewRecipe)
    insertNewRecipeMock.mockResolvedValueOnce(Error('Test'))

    await RecipeController.createRecipe(req, res, next)

    expect(res._isEndCalled()).toBe(true)
    expect(res.statusCode).toBe(StatusCode.INTERNAL_SERVER_ERROR_500)
  })
})
