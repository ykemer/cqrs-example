import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createUser} from '../../utils/db';

describe('POST /api/v1/auth/login', () => {
  describe('Error cases', () => {
    it('should return 400 when email is missing', async () => {
      const app = createTestApp();
      const res = await request(app).post('/api/v1/auth/login').send({password: 'password123'});
      expect(res.status).toBe(400);
    });

    it('should return 400 when password is missing', async () => {
      const app = createTestApp();
      const res = await request(app).post('/api/v1/auth/login').send({email: 'login@test.com'});
      expect(res.status).toBe(400);
    });

    it('should return 400 when email does not exist (as per implementation)', async () => {
      const app = createTestApp();
      const res = await request(app).post('/api/v1/auth/login').send({email: 'nonexistent@test.com', password: 'any'});
      expect(res.status).toBe(400);
    });

    it('should return 400 when password is incorrect (as per implementation)', async () => {
      const user = await createUser({email: 'wrongpass@test.com'});
      const app = createTestApp();
      const res = await request(app).post('/api/v1/auth/login').send({email: user.email, password: 'wrongpassword'});
      expect(res.status).toBe(400);
    });
  });

  describe('Success cases', () => {
    it('should return 200 and tokens on successful login', async () => {
      // createUser helper uses UserBuilder which uses password123 as default
      const {passwordServiceCreator} = require('@/shared/services/password-service');
      const passwordService = passwordServiceCreator();
      const hashedPassword = await passwordService.encode('password123');
      const user = await createUser({email: 'login@test.com'});
      const {UserModel} = require('@/shared');
      await UserModel.update({password: hashedPassword}, {where: {id: user.id}});

      const app = createTestApp();
      const res = await request(app).post('/api/v1/auth/login').send({email: user.email, password: 'password123'});

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refreshToken');
    });
  });
});
