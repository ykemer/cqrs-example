import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createCourse} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';
import {GUID1} from '../../utils/fake-guilds';
import {CreateClassPayloadBuilder} from '../../builders/class.builder';

describe('Classes - create', () => {
  const adminContext = {currentUser: {id: 'a', role: UserRole.admin}};

  describe('Error cases', () => {
    it('returns 400 when registrationDeadline is not before startDate', async () => {
      const course = await createCourse();
      const app = createTestApp(adminContext);

      const payload = new CreateClassPayloadBuilder()
        .withRegistrationDeadline(new Date(Date.now() + 20000 * 1000))
        .build();

      const res = await request(app).post(`/api/v1/courses/${course.id}/classes`).send(payload);
      expect(res.status).toBe(400);
    });

    it('returns 400 when startDate is not before endDate', async () => {
      const course = await createCourse();
      const app = createTestApp(adminContext);

      const payload = new CreateClassPayloadBuilder()
        .withStartDate(new Date(Date.now() + 50000 * 1000)) // Старт после конца
        .build();

      const res = await request(app).post(`/api/v1/courses/${course.id}/classes`).send(payload);
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid payload (maxUsers < 1)', async () => {
      const course = await createCourse();
      const app = createTestApp(adminContext);
      const payload = new CreateClassPayloadBuilder().withMaxUsers(0).build();

      const res = await request(app).post(`/api/v1/courses/${course.id}/classes`).send(payload);
      expect(res.status).toBe(400);
    });

    it('returns 404 when course does not exist', async () => {
      const app = createTestApp(adminContext);
      const payload = new CreateClassPayloadBuilder().build();

      const res = await request(app).post(`/api/v1/courses/${GUID1}/classes`).send(payload);
      expect(res.status).toBe(404);
    });
  });

  describe('Success cases', () => {
    it('creates class (happy path)', async () => {
      const course = await createCourse();
      const app = createTestApp(adminContext);
      const payload = new CreateClassPayloadBuilder().build();

      const res = await request(app).post(`/api/v1/courses/${course.id}/classes`).send(payload);

      expect(res.status).toBe(201);
      expect(res.body.courseId).toBe(course.id);
    });
  });
});
