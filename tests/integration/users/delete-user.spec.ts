import {createUser} from '../../utils/db';
import {UserRole} from '../../../src/shared';
import {createTestApp} from '../../utils/app';
import request from 'supertest';
import {GUID1} from '../../utils/fake-guilds';

describe('DELETE /api/v1/users/:id', () => {
  describe('Error cases', () => {
    it('should return 403 when a non-admin tries to delete a user', async () => {
      const target = await createUser({email: 'to-del@test.com'});
      const user = await createUser({email: 'regular@test.com', role: UserRole.user});

      const app = createTestApp({currentUser: {id: user.id, role: UserRole.user}});
      const res = await request(app).delete(`/api/v1/users/${target.id}`);
      expect(res.status).toBe(403);
    });

    it('should return 404 when user not found', async () => {
      const admin = await createUser({role: UserRole.admin});
      const app = createTestApp({currentUser: {id: admin.id, role: UserRole.admin}});
      const res = await request(app).delete(`/api/v1/users/${GUID1}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Success cases', () => {
    it('should return 204 when admin deletes a user', async () => {
      const target = await createUser({email: 'del-me@test.com'});
      const admin = await createUser({role: UserRole.admin});

      const app = createTestApp({currentUser: {id: admin.id, role: UserRole.admin}});
      const res = await request(app).delete(`/api/v1/users/${target.id}`);

      expect(res.status).toBe(204);

      const {UserModel} = require('@/shared');
      const deleted = await UserModel.findByPk(target.id);
      expect(deleted).toBeNull();
    });
  });
});
