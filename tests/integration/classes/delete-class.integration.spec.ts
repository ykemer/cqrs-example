import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createCourse, createClass} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';

describe('Classes - delete', () => {
  describe('Error cases', () => {
    it('should return 401 when the user is unauthenticated on delete', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const app = createTestApp(); // unauthenticated
      const res = await request(app).delete(`/api/v1/courses/${course.id}/classes/${klass.id}`);
      expect(res.status).toBe(401);
    });

    it('should return 403 when the user is not an admin on delete', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      const res = await request(app).delete(`/api/v1/courses/${course.id}/classes/${klass.id}`);
      expect(res.status).toBe(403);
    });

    it('returns 404 when deleting a non-existent class', async () => {
      const course = await createCourse();
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});

      const res = await request(app).delete(
        `/api/v1/courses/${course.id}/classes/00000000-0000-0000-0000-000000000000`
      );
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('title');
    });

    it('returns 400 when class has enrolled users', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id, {enrolledUsers: 1});
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});

      const res = await request(app).delete(`/api/v1/courses/${course.id}/classes/${klass.id}`);
      expect(res.status).toBe(400);
    });
  });

  describe('Success cases', () => {
    it('deletes class (happy path) and returns 204', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});

      const res = await request(app).delete(`/api/v1/courses/${course.id}/classes/${klass.id}`);
      expect(res.status).toBe(204);

      // verify it is truly gone
      const {ClassModel} = require('@/shared');
      const deleted = await ClassModel.findByPk(klass.id);
      expect(deleted).toBeNull();
    });
  });
});
