import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createCourse, createClass, createUser} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';
import {GUID1} from '../../utils/fake-guilds';

describe('DELETE /api/v1/courses/:id', () => {
  describe('Error cases', () => {
    it('should return 400 when id is not a valid UUID', async () => {
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).delete('/api/v1/courses/not-a-uuid');
      expect(res.status).toBe(400);
    });

    it('should return 400 when course has enrolled users', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const user = await createUser({email: 'enroll@del.com'});
      const {EnrollmentsModel} = require('@/shared');
      await EnrollmentsModel.create({classId: klass.id, userId: user.id});

      // We also need to increment enrolledUsers count on course/class if the event handler doesn't run sync in tests
      // But typically CQRS events might be async. Let's assume the handler works.
      // Wait, the handler for EnrollToClass increments it.
      // For the test, let me manually set it if needed, or check if the check is on code.
      // Handler in delete-course.ts checks `course.enrolledUsers > 0`.
      const {CourseModel} = require('@/shared');
      await CourseModel.update({enrolledUsers: 5}, {where: {id: course.id}});

      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).delete(`/api/v1/courses/${course.id}`);
      expect(res.status).toBe(400);
      expect(res.body.detail).toBe('Cannot delete a course with enrolled users');
    });

    it('should return 401 when the user is unauthenticated', async () => {
      const course = await createCourse();
      const app = createTestApp();
      const res = await request(app).delete(`/api/v1/courses/${course.id}`);
      expect(res.status).toBe(401);
    });

    it('should return 403 when the user is not an admin', async () => {
      const course = await createCourse();
      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      const res = await request(app).delete(`/api/v1/courses/${course.id}`);
      expect(res.status).toBe(403);
    });

    it('should return 404 when the course does not exist', async () => {
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).delete(`/api/v1/courses/${GUID1}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Success cases', () => {
    it('should return 204 when admin deletes an empty course', async () => {
      const course = await createCourse();
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).delete(`/api/v1/courses/${course.id}`);

      expect(res.status).toBe(204);

      // Verify deletion
      const {CourseModel} = require('@/shared');
      const deleted = await CourseModel.findByPk(course.id);
      expect(deleted).toBeNull();
    });
  });
});
