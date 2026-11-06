process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../server');
const db = require('../database');

afterAll((done) => {
  db.close(done);
});

const validRecipe = {
  name: 'Test Pancakes',
  ingredients: '2 cups flour\n2 eggs\n1 cup milk',
  instructions: 'Mix everything and fry in a pan.',
  cookTime: '15 minutes'
};

describe('Recipe API', () => {
  test('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('GET /api/recipes returns an array', async () => {
    const res = await request(app).get('/api/recipes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/recipes creates a recipe with valid data', async () => {
    const res = await request(app).post('/api/recipes').send(validRecipe);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Pancakes');
    expect(res.body.cookTime).toBe('15 minutes');
    expect(res.body.id).toBeDefined();
  });

  test('POST /api/recipes rejects missing fields', async () => {
    const res = await request(app).post('/api/recipes').send({ name: 'Incomplete' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('All fields are required');
  });

  test('GET /api/recipes/:id returns a single recipe', async () => {
    const created = await request(app).post('/api/recipes').send(validRecipe);
    const res = await request(app).get(`/api/recipes/${created.body.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Pancakes');
  });

  test('GET /api/recipes/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/recipes/999999');
    expect(res.statusCode).toBe(404);
  });

  test('DELETE /api/recipes/:id deletes a recipe', async () => {
    const created = await request(app).post('/api/recipes').send(validRecipe);
    const res = await request(app).delete(`/api/recipes/${created.body.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Recipe deleted successfully');

    const after = await request(app).get(`/api/recipes/${created.body.id}`);
    expect(after.statusCode).toBe(404);
  });

  test('DELETE /api/recipes/:id returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/recipes/999999');
    expect(res.statusCode).toBe(404);
  });
});
