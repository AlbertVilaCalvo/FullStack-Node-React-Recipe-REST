import request from 'supertest'
import { app } from '../app'
import { getAllRecipes } from './RecipeDatabase'
import { Recipe } from './Recipe'

jest.mock('./RecipeDatabase')

const RECIPE: Recipe = {
  id: 1,
  title: 'Soup',
  cooking_time_minutes: 10,
  user_id: 2,
}

describe('GET /recipes', () => {
  test('if the database query succeeds should return 200 and the recipes', async () => {
    const getAllRecipesMock = jest.mocked(getAllRecipes)
    getAllRecipesMock.mockResolvedValueOnce([RECIPE])

    const response = await request(app)
      .get('/api/recipes')
      .set('Accept', 'application/json')

    expect(response.statusCode).toBe(200)
    expect(response.body.recipes.length).toEqual(1)
    expect(response.body.recipes[0]).toEqual(RECIPE)
    expect(response.headers['content-type']).toContain('application/json')
  })

  test('if the database query fails should return 500', async () => {
    const getAllRecipesMock = jest.mocked(getAllRecipes)
    getAllRecipesMock.mockResolvedValueOnce(Error('Test'))

    const response = await request(app)
      .get('/api/recipes')
      .set('Accept', 'application/json')

    expect(response.statusCode).toBe(500)
  })
})
