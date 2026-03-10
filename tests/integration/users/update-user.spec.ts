import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createUser} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';
import {GUID1} from '../../utils/fake-guilds';

describe('PATCH /api/v1/users/:id', () => {
  describe('Error cases', () => {
    it('should return 400 when not all fields are in the request', async () => {
      const target = await createUser({email: 'target@test.com'});
      const attacker = await createUser({email: 'attacker@test.com', role: UserRole.user});

      const app = createTestApp({currentUser: {id: attacker.id, role: UserRole.user}});
      const res = await request(app).patch(`/api/v1/users/${target.id}`).send({name: 'name'});
      expect(res.status).toBe(400);
    });

    it('should return 403 when a non-admin tries to update another user', async () => {
      const target = await createUser({email: 'target@test.com'});
      const attacker = await createUser({email: 'attacker@test.com', role: UserRole.user});

      const app = createTestApp({currentUser: {id: attacker.id, role: UserRole.user}});
      const res = await request(app).patch(`/api/v1/users/${target.id}`).send({
        name: 'user',
        password: '123456',
      });
      expect(res.status).toBe(403);
    });

    it('should return 404 when the user does not exist', async () => {
      const admin = await createUser({role: UserRole.admin});
      const app = createTestApp({currentUser: {id: admin.id, role: UserRole.admin}});
      const res = await request(app).patch(`/api/v1/users/${GUID1}`).send({
        name: 'user',
        password: '123456',
      });
      expect(res.status).toBe(404);
    });
  });

  describe('Success cases', () => {
    it('should return 204 when admin updates a user', async () => {
      const target = await createUser({email: 'to-update@test.com', name: 'Old Name'});
      const admin = await createUser({role: UserRole.admin});

      const app = createTestApp({currentUser: {id: admin.id, role: UserRole.admin}});
      const res = await request(app).patch(`/api/v1/users/${target.id}`).send({
        name: 'New Name',
        password: '123456',
      });

      expect(res.status).toBe(204);

      // Verify persistence
      const {UserModel} = require('@/shared');
      const updated = await UserModel.findByPk(target.id);
      expect(updated.name).toBe('New Name');
    });
  });
});
