import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createCourse, createClass, createUser} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';

describe('Classes - list', () => {
  describe('Error cases', () => {
    it('should return 404 when the course not found', async () => {
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).get(`/api/v1/courses/00000000-0000-0000-0000-000000000000/classes`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('title');
    });
  });

  describe('Success cases', () => {
    it('should return 200 and paginated classes for admin', async () => {
      const course = await createCourse();
      await createClass(course.id);
      await createClass(course.id);
      await createClass(course.id);

      const adminApp = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(adminApp).get(`/api/v1/courses/${course.id}/classes?pageSize=2&page=1`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(3);
    });

    it('should return 200 and the next page of classes for admin', async () => {
      const course = await createCourse();
      await createClass(course.id);
      await createClass(course.id);
      await createClass(course.id);

      const adminApp = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(adminApp).get(`/api/v1/courses/${course.id}/classes?pageSize=2&page=2`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return 200 and list all classes when user is admin', async () => {
      const course = await createCourse({name: 'list-course'});
      const klass = await createClass(course.id);
      const adminApp = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(adminApp).get(`/api/v1/courses/${course.id}/classes`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = (res.body.data as Array<{id: string}>).find(c => c.id === klass.id);
      expect(found).toBeDefined();
    });

    it('should return 200 and filter classes for regular user (only future deadline)', async () => {
      const course = await createCourse({name: 'list-course-user'});
      // one class with future deadline
      const future = await createClass(course.id, {registrationDeadline: new Date(Date.now() + 86400 * 1000)});
      // one class with past deadline
      await createClass(course.id, {registrationDeadline: new Date(Date.now() - 86400 * 1000)});

      const userApp = createTestApp({currentUser: {id: 'u1', role: UserRole.user}});
      const res = await request(userApp).get(`/api/v1/courses/${course.id}/classes`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe(future.id);
    });

    it('should return 200 and show enrolled classes even if deadline passed', async () => {
      const course = await createCourse({name: 'list-enrolled'});
      const pastDeadline = new Date(Date.now() - 86400 * 1000);
      const klass = await createClass(course.id, {registrationDeadline: pastDeadline});

      const user = await createUser({email: 'enrolled@test.com'});
      const {EnrollmentsModel} = require('@/shared');
      await EnrollmentsModel.create({classId: klass.id, userId: user.id});

      const userApp = createTestApp({currentUser: {id: user.id, role: UserRole.user}});
      const res = await request(userApp).get(`/api/v1/courses/${course.id}/classes`);
      expect(res.status).toBe(200);
      expect(res.body.data.some((c: any) => c.id === klass.id)).toBe(true);
    });
  });
});
