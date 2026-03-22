import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createCourse} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';
import {GUID1} from '../../utils/fake-guilds';

describe('PATCH /api/v1/courses/:id', () => {
  const validRequest = {name: 'Course Name', description: 'Course Description'};
  describe('Error cases', () => {
    it('should return 400 when id is not a valid UUID', async () => {
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).patch('/api/v1/courses/not-a-uuid').send(validRequest);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 400 when name is missing', async () => {
      const course = await createCourse();
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).patch(`/api/v1/courses/${course.id}`).send({description: 'Course Description'});
      expect(res.status).toBe(400);
    });

    it('should return 401 when the user is unauthenticated', async () => {
      const course = await createCourse();
      const app = createTestApp();
      const res = await request(app).patch(`/api/v1/courses/${course.id}`).send(validRequest);
      expect(res.status).toBe(401);
    });

    it('should return 403 when the user is not an admin', async () => {
      const course = await createCourse();
      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      const res = await request(app).patch(`/api/v1/courses/${course.id}`).send(validRequest);
      expect(res.status).toBe(403);
    });

    it('should return 404 when the course does not exist', async () => {
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).patch(`/api/v1/courses/${GUID1}`).send(validRequest);
      expect(res.status).toBe(404);
    });
  });

  describe('Success cases', () => {
    it('should return 204 when valid data is provided by admin', async () => {
      const course = await createCourse();
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const payload = {name: 'Updated Name', description: 'Updated Desc'};
      const res = await request(app).patch(`/api/v1/courses/${course.id}`).send(payload);

      expect(res.status).toBe(204);

      // Verify persistence
      const {CourseModel} = require('@/shared');
      const updated = await CourseModel.findByPk(course.id);
      expect(updated.name).toBe(payload.name);
      expect(updated.description).toBe(payload.description);
    });
  });
});
