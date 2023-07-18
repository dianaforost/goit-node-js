const request = require('supertest');
const app = require('./app');
const UserController = require('./controller/users');

describe('Login Controller', () => {
  test('should return status code 200 and a token in response', async () => {
    const userData = {
      email: 'example@gmil.com',
      password: 'password123',
    };

    const response = await request(app).post('/users/login').send(userData);

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test('should return an object with email and subscription fields of type String', async () => {
    const userData = {
      email: 'example@gmail.com',
      password: 'password123',
    };

    const response = await request(app).post('/users/login').send(userData);

    expect(response.status).toBe(200);
    expect(typeof response.body.user.email).toBe('string');
    expect(typeof response.body.user.subscription).toBe('string');
  });
});
