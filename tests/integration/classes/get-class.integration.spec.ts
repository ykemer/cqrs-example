import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createCourse, createClass} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';
import {GUID1, GUID2} from '../../utils/fake-guilds';

describe('GET /api/v1/courses/:courseId/classes/:id', () => {
  describe('Error cases', () => {
    it('should return 400 when courseId is not a valid UUID', async () => {
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).get('/api/v1/courses/not-a-uuid/classes/not-a-uuid');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 401 when the user is unauthenticated', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const app = createTestApp(); // no currentUser
      const res = await request(app).get(`/api/v1/courses/${course.id}/classes/${klass.id}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 403 when the user does not have admin role', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      const res = await request(app).get(`/api/v1/courses/${course.id}/classes/${klass.id}`);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 404 when the course does not exist', async () => {
      const fakeCourseId = GUID1;
      const fakeClassId = GUID2;
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).get(`/api/v1/courses/${fakeCourseId}/classes/${fakeClassId}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 404 when the class does not exist for an existing course', async () => {
      const course = await createCourse();
      const fakeClassId = GUID2;
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).get(`/api/v1/courses/${course.id}/classes/${fakeClassId}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('title');
    });
  });

  describe('Success cases', () => {
    it('should return 200 and the class DTO when the class exists and user is admin', async () => {
      const course = await createCourse({name: 'GetCourse'});
      // ensure we use the course id correctly
      const klass = await createClass(course.id);

      const app = createTestApp({currentUser: {id: 'admin-id', role: UserRole.admin}});

      const res = await request(app).get(`/api/v1/courses/${course.id}/classes/${klass.id}`);

      expect(res.status).toBe(200);
      // use matchers that are less sensitive to exact objects if possible, but be strict on values
      expect(res.body.id).toBe(klass.id);
      expect(res.body.courseId).toBe(course.id);
      expect(res.body.name).toBe('GetCourse');
    });
  });
});
