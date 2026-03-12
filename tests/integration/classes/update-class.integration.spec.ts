import request from 'supertest';
import {createTestApp} from '../../utils/app';
import {createCourse, createClass} from '../../utils/db';
import {UserRole} from '@/shared/domain/models/user';
import {GUID1, GUID2} from '../../utils/fake-guilds';
import {CreateClassPayloadBuilder} from '../../builders/class.builder';

describe('Classes - update', () => {
  describe('Error cases', () => {
    it('should return 400 when updating with maxUsers less than enrolled users', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      // artificially increase enrolledUsers to 5
      const {ClassModel} = require('@/shared');
      // Using direct update to bypass business logic if needed for setup
      await ClassModel.update({enrolledUsers: 5}, {where: {id: klass.id}});

      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const res = await request(app).put(`/api/v1/courses/${course.id}/classes/${klass.id}`).send({
        maxUsers: 2,
        registrationDeadline: klass.registrationDeadline.toISOString(),
        startDate: klass.startDate.toISOString(),
        endDate: klass.endDate.toISOString(),
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('title');
    });

    it('should return 400 when registrationDeadline is after startDate', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const payload = new CreateClassPayloadBuilder()
        .withRegistrationDeadline(new Date(Date.now() + 20000 * 1000))
        .build();
      const res = await request(app).put(`/api/v1/courses/${course.id}/classes/${klass.id}`).send(payload);
      expect(res.status).toBe(400);
    });

    it('should return 400 when startDate is after endDate', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const payload = new CreateClassPayloadBuilder()
        .withStartDate(new Date(Date.now() + 30000 * 1000).toISOString())
        .build();
      const res = await request(app).put(`/api/v1/courses/${course.id}/classes/${klass.id}`).send(payload);
      expect(res.status).toBe(400);
    });

    it('should return 401 when the user is unauthenticated', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const app = createTestApp(); // no user
      const payload = new CreateClassPayloadBuilder().build();
      const res = await request(app).put(`/api/v1/courses/${course.id}/classes/${klass.id}`).send(payload);
      expect(res.status).toBe(401);
    });

    it('should return 403 when the user is not an admin', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const app = createTestApp({currentUser: {id: 'u', role: UserRole.user}});
      const payload = new CreateClassPayloadBuilder().build();
      const res = await request(app).put(`/api/v1/courses/${course.id}/classes/${klass.id}`).send(payload);
      expect(res.status).toBe(403);
    });

    it('should return 404 when the course does not exist', async () => {
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const payload = new CreateClassPayloadBuilder().build();
      const res = await request(app).put(`/api/v1/courses/${GUID1}/classes/${GUID2}`).send(payload);
      expect(res.status).toBe(404);
    });

    it('should return 404 when the class does not exist', async () => {
      const course = await createCourse();
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});
      const payload = new CreateClassPayloadBuilder().build();
      const res = await request(app).put(`/api/v1/courses/${course.id}/classes/${GUID2}`).send(payload);
      expect(res.status).toBe(404);
    });
  });

  describe('Success cases', () => {
    it('should return 204 when admin sends a valid update request and verify persistence', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const app = createTestApp({currentUser: {id: 'a', role: UserRole.admin}});

      const payload = new CreateClassPayloadBuilder().withMaxUsers(15).build();

      const res = await request(app).put(`/api/v1/courses/${course.id}/classes/${klass.id}`).send(payload);

      expect(res.status).toBe(204);

      const {ClassModel} = require('@/shared');
      const updated = await ClassModel.findByPk(klass.id);
      expect(updated).not.toBeNull();
      expect(updated.maxUsers).toBe(payload.maxUsers);
    });
  });
});
