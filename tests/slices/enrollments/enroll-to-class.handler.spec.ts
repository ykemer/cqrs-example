import {EnrollToClassHandler} from '@/slices/enrollments/enroll-to-class/enroll-to-class';
import {EnrollToClassCommand} from '@/slices/enrollments/enroll-to-class/enroll-to-class';
import {NotFoundError, BadRequestError, ConflictError} from '@/shared';
import {createCourse, createClass, createUser, createEnrollment} from '../../utils/db';
import {GUID1, GUID2} from '../../utils/fake-guilds';
import {mediatR} from '@/shared/mediatr';

describe('EnrollToClassHandler', () => {
  describe('Edge cases', () => {
    it('should throw NotFoundError when course does not exist', async () => {
      const user = await createUser();
      const handler = new EnrollToClassHandler();
      const cmd = new EnrollToClassCommand(GUID1, GUID2, user.id);

      await expect(handler.handle(cmd)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when class does not exist for course', async () => {
      const course = await createCourse();
      const user = await createUser();
      const handler = new EnrollToClassHandler();
      const cmd = new EnrollToClassCommand(course.id, GUID2, user.id);

      await expect(handler.handle(cmd)).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError when registration deadline has passed', async () => {
      const course = await createCourse();
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24);
      const klass = await createClass(course.id, {registrationDeadline: pastDate});
      const user = await createUser();

      const handler = new EnrollToClassHandler();
      const cmd = new EnrollToClassCommand(course.id, klass.id, user.id);

      await expect(handler.handle(cmd)).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError when class is full', async () => {
      const course = await createCourse();
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const klass = await createClass(course.id, {maxUsers: 2, enrolledUsers: 2, registrationDeadline: futureDate});
      const user = await createUser();

      const handler = new EnrollToClassHandler();
      const cmd = new EnrollToClassCommand(course.id, klass.id, user.id);

      await expect(handler.handle(cmd)).rejects.toThrow(BadRequestError);
    });

    it('should throw ConflictError when user already enrolled', async () => {
      const course = await createCourse();
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const klass = await createClass(course.id, {registrationDeadline: futureDate});
      const user = await createUser();
      await createEnrollment(klass.id, user.id);

      const handler = new EnrollToClassHandler();
      const cmd = new EnrollToClassCommand(course.id, klass.id, user.id);

      await expect(handler.handle(cmd)).rejects.toThrow(ConflictError);
    });
  });

  describe('Happy path', () => {
    it('should enroll user and publish event', async () => {
      const course = await createCourse();
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const klass = await createClass(course.id, {registrationDeadline: futureDate});
      const user = await createUser();

      const publishSpy = jest.spyOn(mediatR, 'publish');

      const handler = new EnrollToClassHandler();
      const cmd = new EnrollToClassCommand(course.id, klass.id, user.id);

      const result = await handler.handle(cmd);

      expect(result).toBeUndefined();
      expect(publishSpy).toHaveBeenCalled();
    });
  });
});
