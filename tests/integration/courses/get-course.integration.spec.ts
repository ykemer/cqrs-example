import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createCourse} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';
import {GUID1} from '../../utils/fake-guilds';

describe('GET /api/v1/courses/:id', () => {
  describe('Error cases', () => {
    it('should return 400 when id is not a valid UUID', async () => {
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).get('/api/v1/courses/not-a-uuid');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 401 when the user is unauthenticated', async () => {
      const course = await createCourse();
      const app = createTestApp(); // No currentUser
      const res = await request(app).get(`/api/v1/courses/${course.id}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 403 when the user is not an admin', async () => {
      const course = await createCourse();
      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      const res = await request(app).get(`/api/v1/courses/${course.id}`);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 404 when the course does not exist', async () => {
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).get(`/api/v1/courses/${GUID1}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('title');
    });
  });

  describe('Success cases', () => {
    it('should return 200 and the course when it exists and user is admin', async () => {
      const course = await createCourse({name: 'Target Course'});
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).get(`/api/v1/courses/${course.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', course.id);
      expect(res.body.name).toBe('Target Course');
    });
  });
});
