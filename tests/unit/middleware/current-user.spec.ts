import express from 'express';
import request from 'supertest';

describe('currentUser middleware', () => {
  it('skips when no authorization header', async () => {
    jest.isolateModules(() => {
      // Mock jwt service to avoid DI/circular imports
      jest.mock('@/shared/services/jwt-service', () => ({
        jwtServiceCreator: () => ({
          getPayload: (_token: string) => null,
        }),
      }));
      const {currentUser} = require('@/shared/middleware/current-user');
      const app = express();
      app.use(currentUser);
      app.get('/', (req: any, res) => res.json({user: req.currentUser || null}));
      return request(app)
        .get('/')
        .then(res => {
          expect(res.body.user).toBeNull();
        });
    });
  });

  it('sets currentUser when valid bearer token', async () => {
    jest.isolateModules(() => {
      // Mock jwt service to return payload when token === 'valid-token'
      jest.mock('@/shared/services/jwt-service', () => ({
        jwtServiceCreator: () => ({
          getPayload: (token: string) =>
            token === 'valid-token' ? {id: 'u1', email: 'a@b', role: 'admin', name: 'n'} : null,
        }),
      }));

      const {currentUser} = require('@/shared/middleware/current-user');
      const app = express();
      app.use(currentUser);
      app.get('/', (req: any, res) => res.json({user: req.currentUser || null}));
      return request(app)
        .get('/')
        .set('authorization', `Bearer valid-token`)
        .then(res => {
          expect(res.body.user).not.toBeNull();
          expect(res.body.user.id).toBe('u1');
        });
    });
  });
});
