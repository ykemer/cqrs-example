import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createCourse, createClass, createUser} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';
import {GUID1, GUID2} from '../../utils/fake-guilds';

describe('DELETE /api/v1/courses/:courseId/classes/:classId/enrollments', () => {
  describe('Error cases', () => {
    it('should return 400 when courseId is not a valid UUID', async () => {
      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      const res = await request(app).delete(`/api/v1/courses/not-a-uuid/classes/${GUID2}/enrollments`);
      expect(res.status).toBe(400);
    });

    it('should return 401 when the user is unauthenticated', async () => {
      const res = await request(createTestApp()).delete(`/api/v1/courses/${GUID1}/classes/${GUID2}/enrollments`);
      expect(res.status).toBe(401);
    });

    it('should return 404 when course does not exist', async () => {
      const user = await createUser({email: 'not-enrolled@test.com'});

      const app = createTestApp({currentUser: {id: user.id, role: UserRole.user}});
      const res = await request(app).delete(`/api/v1/courses/${GUID1}/classes/${GUID2}/enrollments`);
      expect(res.status).toBe(404);
    });

    it('should return 404 when the class does not exist for an existing course', async () => {
      const course = await createCourse();
      const user = await createUser({email: 'not-enrolled@test.com'});

      const app = createTestApp({currentUser: {id: user.id, role: UserRole.user}});
      const res = await request(app).delete(`/api/v1/courses/${course.id}/classes/${GUID2}/enrollments`);
      expect(res.status).toBe(404);
    });

    it('should return 404 when the class does not belong to the course', async () => {
      const course1 = await createCourse({name: 'Course 1'});
      const course2 = await createCourse({name: 'Course 2'});
      const klassOfCourse2 = await createClass(course2.id);
      const user = await createUser({email: 'unenroll@test.com'});

      const app = createTestApp({currentUser: {id: user.id, role: UserRole.user}});
      // Try to unenroll via course1's path from a class that belongs to course2
      const res = await request(app).delete(`/api/v1/courses/${course1.id}/classes/${klassOfCourse2.id}/enrollments`);
      expect(res.status).toBe(404);
    });

    it('should return 409 when the user is not enrolled in the class', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const user = await createUser({email: 'not-enrolled@test.com'});

      const app = createTestApp({currentUser: {id: user.id, role: UserRole.user}});
      const res = await request(app).delete(`/api/v1/courses/${course.id}/classes/${klass.id}/enrollments`);

      expect(res.status).toBe(409);
    });
  });

  describe('Success cases', () => {
    it('should return 204 when user unenrolls from an enrolled class', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const user = await createUser({email: 'unenroll@test.com'});

      const {EnrollmentsModel} = require('@/shared');
      await EnrollmentsModel.create({classId: klass.id, userId: user.id});

      const app = createTestApp({currentUser: {id: user.id, role: UserRole.user}});
      const res = await request(app).delete(`/api/v1/courses/${course.id}/classes/${klass.id}/enrollments`);

      expect(res.status).toBe(204);

      // Verify unenrollment
      const enrollment = await EnrollmentsModel.findOne({where: {classId: klass.id, userId: user.id}});
      expect(enrollment).toBeNull();
    });
  });
});
