import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createUser} from '../../utils/db';

describe('POST /api/v1/auth/refresh', () => {
  describe('Error cases', () => {
    it('should return 400 when refreshToken is missing', async () => {
      const app = createTestApp();
      const res = await request(app).post('/api/v1/auth/refresh').send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 when refreshToken is invalid or expired (as per implementation)', async () => {
      const app = createTestApp();
      const res = await request(app).post('/api/v1/auth/refresh').send({refreshToken: 'invalid-token'});
      expect(res.status).toBe(400);
    });

    it('should return 400 when refreshToken has expired', async () => {
      const {passwordServiceCreator} = require('@/shared/services/password-service');
      const hashedPassword = await passwordServiceCreator().encode('password123');
      const user = await createUser({email: 'expired-token@test.com'});
      const {UserModel, RefreshTokenModel} = require('@/shared');
      await UserModel.update({password: hashedPassword}, {where: {id: user.id}});

      const app = createTestApp();
      const loginRes = await request(app).post('/api/v1/auth/login').send({email: user.email, password: 'password123'});
      const {refreshToken} = loginRes.body;

      // Manually set expiresAt to past
      await RefreshTokenModel.update({expiresAt: new Date(Date.now() - 10000)}, {where: {token: refreshToken}});

      const res = await request(app).post('/api/v1/auth/refresh').send({refreshToken});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('detail', 'Refresh token expired');
    });

    it('should return 400 when the user associated with the token no longer exists', async () => {
      const {passwordServiceCreator} = require('@/shared/services/password-service');
      const hashedPassword = await passwordServiceCreator().encode('password123');
      const user = await createUser({email: 'deleted-user@test.com'});
      const {UserModel, RefreshTokenModel} = require('@/shared');
      await UserModel.update({password: hashedPassword}, {where: {id: user.id}});

      const app = createTestApp();
      const loginRes = await request(app).post('/api/v1/auth/login').send({email: user.email, password: 'password123'});
      const {refreshToken} = loginRes.body;

      // Ensure token is valid (in the future)
      await RefreshTokenModel.update({expiresAt: new Date(Date.now() + 10000)}, {where: {token: refreshToken}});

      // Now delete the user
      await UserModel.destroy({where: {id: user.id}});

      const res = await request(app).post('/api/v1/auth/refresh').send({refreshToken});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('detail', 'Invalid refresh token');
    });
  });

  describe('Success cases', () => {
    it('should return 200 and new tokens on valid refresh', async () => {
      // Manually hash password for login to work
      const {passwordServiceCreator} = require('@/shared/services/password-service');
      const hashedPassword = await passwordServiceCreator().encode('password123');
      const user = await createUser({email: 'refresh@test.com'});
      const {UserModel, RefreshTokenModel} = require('@/shared');
      await UserModel.update({password: hashedPassword}, {where: {id: user.id}});

      const app = createTestApp();

      const loginRes = await request(app).post('/api/v1/auth/login').send({email: user.email, password: 'password123'});
      const {refreshToken} = loginRes.body;

      await RefreshTokenModel.update({expiresAt: new Date(Date.now() + 1000)}, {where: {token: refreshToken}});

      const res = await request(app).post('/api/v1/auth/refresh').send({refreshToken});

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refreshToken');
    });
  });
});
