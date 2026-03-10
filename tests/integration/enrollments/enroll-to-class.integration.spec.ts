import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createCourse, createClass, createUser} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';
import {GUID1, GUID2} from '../../utils/fake-guilds';

describe('POST /api/v1/courses/:courseId/classes/:classId/enrollments', () => {
  describe('Error cases', () => {
    it('should return 400 when classId is not a valid UUID', async () => {
      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      const res = await request(app).post(`/api/v1/courses/${GUID1}/classes/not-a-uuid/enrollments`);
      expect(res.status).toBe(400);
    });

    it('should return 401 when the user is unauthenticated', async () => {
      const res = await request(createTestApp()).post(`/api/v1/courses/${GUID1}/classes/${GUID2}/enrollments`);
      expect(res.status).toBe(401);
    });

    it('should return 404 when the course does not exist', async () => {
      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      const res = await request(app).post(`/api/v1/courses/${GUID1}/classes/${GUID2}/enrollments`);
      expect(res.status).toBe(404);
    });

    it('should return 404 when the class does not exist for an existing course', async () => {
      const course = await createCourse();
      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      const res = await request(app).post(`/api/v1/courses/${course.id}/classes/${GUID2}/enrollments`);
      expect(res.status).toBe(404);
    });

    it('should return 404 when the class does not belong to the course', async () => {
      const course1 = await createCourse({name: 'Course 1'});
      const course2 = await createCourse({name: 'Course 2'});
      const klassOfCourse2 = await createClass(course2.id);

      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      // Try to enroll via course1's path into a class that belongs to course2
      const res = await request(app).post(`/api/v1/courses/${course1.id}/classes/${klassOfCourse2.id}/enrollments`);
      expect(res.status).toBe(404);
    });

    it('should return 400 when registration deadline has passed', async () => {
      const course = await createCourse();
      const pastDeadline = new Date(Date.now() - 86400 * 1000);
      const klass = await createClass(course.id, {registrationDeadline: pastDeadline});
      const user = await createUser({email: 'past@test.com'});

      const app = createTestApp({currentUser: {id: user.id, role: UserRole.user}});
      const res = await request(app).post(`/api/v1/courses/${course.id}/classes/${klass.id}/enrollments`);
      expect(res.status).toBe(400);
    });

    it('should return 400 when trying to enroll to a full class', async () => {
      const course = await createCourse();
      // Create class with maxUsers = 1
      const klass = await createClass(course.id, {maxUsers: 1});

      // Manually set enrolledUsers to 1
      const {ClassModel} = require('@/shared');
      await ClassModel.update({enrolledUsers: 1}, {where: {id: klass.id}});

      const user = await createUser({email: 'new-user@test.com'});
      const app = createTestApp({currentUser: {id: user.id, role: UserRole.user}});
      const res = await request(app).post(`/api/v1/courses/${course.id}/classes/${klass.id}/enrollments`);

      expect(res.status).toBe(400);
    });

    it('should return 409 when user is already enrolled', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const user = await createUser({email: 'already@test.com'});

      const {EnrollmentsModel} = require('@/shared');
      await EnrollmentsModel.create({classId: klass.id, userId: user.id});

      const app = createTestApp({currentUser: {id: user.id, role: UserRole.user}});
      const res = await request(app).post(`/api/v1/courses/${course.id}/classes/${klass.id}/enrollments`);
      expect(res.status).toBe(409);
    });
  });

  describe('Success cases', () => {
    it('should return 204 when user enrolls to a valid class', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const user = await createUser({email: 'enroll@test.com'});

      const app = createTestApp({currentUser: {id: user.id, role: UserRole.user}});
      const res = await request(app).post(`/api/v1/courses/${course.id}/classes/${klass.id}/enrollments`);

      expect(res.status).toBe(204);

      // Verify enrollment
      const {EnrollmentsModel} = require('@/shared');
      const enrollment = await EnrollmentsModel.findOne({where: {classId: klass.id, userId: user.id}});
      expect(enrollment).not.toBeNull();
    });
  });
});
