import {UnenrollFromClassHandler} from '@/slices/enrollments/unenroll-from-class/unenroll-from-class';
import {UnenrollFromClassCommand} from '@/slices/enrollments/unenroll-from-class/unenroll-from-class';
import {NotFoundError, ConflictError} from '@/shared';
import {createCourse, createClass, createUser, createEnrollment} from '../../utils/db';
import {GUID1, GUID2} from '../../utils/fake-guilds';
import {mediatR} from '@/shared/mediatr';

describe('UnenrollFromClassHandler', () => {
  describe('Edge cases', () => {
    it('should throw NotFoundError when course does not exist', async () => {
      const user = await createUser();
      const handler = new UnenrollFromClassHandler();
      const cmd = new UnenrollFromClassCommand(GUID2, GUID1, user.id);

      await expect(handler.handle(cmd)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when class does not exist for course', async () => {
      const course = await createCourse();
      const user = await createUser();
      const handler = new UnenrollFromClassHandler();
      const cmd = new UnenrollFromClassCommand(GUID2, course.id, user.id);

      await expect(handler.handle(cmd)).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError when user not enrolled', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const user = await createUser();

      const handler = new UnenrollFromClassHandler();
      const cmd = new UnenrollFromClassCommand(klass.id, course.id, user.id);

      await expect(handler.handle(cmd)).rejects.toThrow(ConflictError);
    });
  });

  describe('Happy path', () => {
    it('should unenroll user and publish event', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const user = await createUser();
      await createEnrollment(klass.id, user.id);

      const publishSpy = jest.spyOn(mediatR, 'publish');

      const handler = new UnenrollFromClassHandler();
      const cmd = new UnenrollFromClassCommand(klass.id, course.id, user.id);

      const result = await handler.handle(cmd);

      expect(result).toBeUndefined();
      expect(publishSpy).toHaveBeenCalled();
    });
  });
});
