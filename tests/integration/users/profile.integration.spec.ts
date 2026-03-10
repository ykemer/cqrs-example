import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createUser} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';

describe('GET /api/v1/auth/profile', () => {
  describe('Error cases', () => {
    it('should return 401 when the user is unauthenticated', async () => {
      const app = createTestApp(); // No currentUser
      const res = await request(app).get('/api/v1/auth/profile');
      expect(res.status).toBe(401);
    });

    it('should return 404 when the authenticated user does not exist in database', async () => {
      // Simulate a case where token is valid (middleware passed) but user was deleted
      const userId = 'ca36ad0e-302a-4ac9-b6c2-bfb2e0aca5dd';
      const app = createTestApp({currentUser: {id: userId, role: UserRole.user}});

      const res = await request(app).get('/api/v1/auth/profile');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('title', 'Not found');
      expect(res.body).toHaveProperty('detail', 'User not found');
    });
  });

  describe('Success cases', () => {
    it('should return 200 and the user profile when authenticated', async () => {
      const user = await createUser({email: 'profile@test.com', name: 'Profile User'});
      const app = createTestApp({currentUser: {id: user.id, role: UserRole.user}});
      const res = await request(app).get('/api/v1/auth/profile');

      expect(res.status).toBe(200);

      expect(res.body).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'user',
      });
    });
  });
});
