import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createUser} from '../../utils/db';

describe('POST /api/v1/auth/register', () => {
  describe('Error cases', () => {
    it('should return 400 when email is missing', async () => {
      const app = createTestApp();
      const res = await request(app).post('/api/v1/auth/register').send({name: 'User', password: 'password123'});
      expect(res.status).toBe(400);
    });

    it('should return 400 when name is missing', async () => {
      const app = createTestApp();
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({email: 'test@test.com', password: 'password123'});
      expect(res.status).toBe(400);
    });

    it('should return 400 when password is missing', async () => {
      const app = createTestApp();
      const res = await request(app).post('/api/v1/auth/register').send({email: 'test@test.com', name: 'User'});
      expect(res.status).toBe(400);
    });

    it('should return 409 when email is already registered', async () => {
      await createUser({email: 'conflict@test.com'});
      const app = createTestApp();
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'conflict@test.com',
        name: 'Another',
        password: 'password123',
      });
      expect(res.status).toBe(409);
    });
  });

  describe('Success cases', () => {
    it('should return 204 on successful registration', async () => {
      const app = createTestApp();
      const payload = {email: 'new@test.com', name: 'New User', password: 'password123'};
      const res = await request(app).post('/api/v1/auth/register').send(payload);

      expect(res.status).toBe(204);

      // Verify persistence
      const {UserModel} = require('@/shared');
      const user = await UserModel.findOne({where: {email: payload.email}});
      expect(user).not.toBeNull();
      expect(user.name).toBe(payload.name);
    });
  });
});
