import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createCourse} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';
import {GUID1} from '../../utils/fake-guilds';

describe('Classes - create', () => {
  describe('Error cases', () => {
    it('returns 400 when registrationDeadline is not before startDate', async () => {
      const course = await createCourse();
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const payload = {
        maxUsers: 10,
        registrationDeadline: new Date(Date.now() + 7200 * 1000).toISOString(), // after startDate
        startDate: new Date(Date.now() + 3600 * 1000).toISOString(),
        endDate: new Date(Date.now() + 10800 * 1000).toISOString(),
      };
      const res = await request(app).post(`/api/v1/courses/${course.id}/classes`).send(payload);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('title');
    });

    it('returns 400 when startDate is not before endDate', async () => {
      const course = await createCourse();
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const payload = {
        maxUsers: 10,
        registrationDeadline: new Date(Date.now() + 3600 * 1000).toISOString(),
        startDate: new Date(Date.now() + 10800 * 1000).toISOString(),
        endDate: new Date(Date.now() + 7200 * 1000).toISOString(), // before startDate
      };
      const res = await request(app).post(`/api/v1/courses/${course.id}/classes`).send(payload);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('title');
    });

    it('returns 400 for invalid payload (maxUsers < 1)', async () => {
      const course = await createCourse();
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).post(`/api/v1/courses/${course.id}/classes`).send({maxUsers: 0});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('title');
    });

    it('returns 404 when course does not exist', async () => {
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app)
        .post(`/api/v1/courses/${GUID1}/classes`)
        .send({
          maxUsers: 10,
          registrationDeadline: new Date(Date.now() + 3600 * 1000).toISOString(),
          startDate: new Date(Date.now() + 7200 * 1000).toISOString(),
          endDate: new Date(Date.now() + 10800 * 1000).toISOString(),
        });
      expect(res.status).toBe(404);
    });
  });

  describe('Success cases', () => {
    it('creates class (happy path)', async () => {
      const course = await createCourse();
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const payload = {
        maxUsers: 10,
        registrationDeadline: new Date(Date.now() + 3600 * 1000).toISOString(),
        startDate: new Date(Date.now() + 7200 * 1000).toISOString(),
        endDate: new Date(Date.now() + 10800 * 1000).toISOString(),
      };

      const res = await request(app).post(`/api/v1/courses/${course.id}/classes`).send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.courseId).toBe(course.id);
    });
  });
});
