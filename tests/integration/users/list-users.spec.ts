import {createTestApp} from '../../utils/app';
import request from 'supertest';
import {createUser} from '../../utils/db';
import {UserRole} from '../../../src/shared';

describe('GET /api/v1/users', () => {
  describe('Error cases', () => {
    it('should return 401 when the user is unauthenticated', async () => {
      const app = createTestApp();
      const res = await request(app).get('/api/v1/users');
      expect(res.status).toBe(401);
    });

    it('should return 403 when the user is not an admin', async () => {
      const user = await createUser({role: UserRole.user});
      const app = createTestApp({currentUser: {id: user.id, role: UserRole.user}});
      const res = await request(app).get('/api/v1/users');
      expect(res.status).toBe(403);
    });
  });

  describe('Success cases', () => {
    it('should return 200 and a list of users for admin', async () => {
      await createUser({email: 'user1@test.com'});
      await createUser({email: 'user2@test.com'});
      const admin = await createUser({email: 'admin-list@test.com', role: UserRole.admin});

      const app = createTestApp({currentUser: {id: admin.id, role: UserRole.admin}});
      const res = await request(app).get('/api/v1/users');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should return 200 and paginated users for admin', async () => {
      await createUser({email: 'u1@test.com'});
      await createUser({email: 'u2@test.com'});
      await createUser({email: 'u3@test.com'});
      const admin = await createUser({email: 'admin-pag@test.com', role: UserRole.admin});

      const app = createTestApp({currentUser: {id: admin.id, role: UserRole.admin}});
      const res = await request(app).get('/api/v1/users?page=1&pageSize=2');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBeGreaterThanOrEqual(4);
    });

    it('should return 200 and the second page of users', async () => {
      await createUser({email: 'u1@test.com'});
      await createUser({email: 'u2@test.com'});
      await createUser({email: 'u3@test.com'});
      const admin = await createUser({email: 'admin-pag2@test.com', role: UserRole.admin});

      const app = createTestApp({currentUser: {id: admin.id, role: UserRole.admin}});
      const res = await request(app).get('/api/v1/users?page=2&pageSize=2');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.page).toBe(2);
    });
  });
});
