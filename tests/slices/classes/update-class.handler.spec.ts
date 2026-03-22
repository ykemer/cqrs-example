import {UpdateClassCommandHandler} from '@/slices/classes/update-class/update-class';
import {NotFoundError, BadRequestError} from '@/shared';
import {createCourse, createClass} from '../../utils/db';
import {UpdateClassCommandBuilder} from '../../builders/class.builder';
import {GUID1, GUID2} from '../../utils/fake-guilds';

describe('UpdateClassCommandHandler', () => {
  describe('Edge cases', () => {
    it('should throw NotFoundError when course does not exist', async () => {
      const handler = new UpdateClassCommandHandler();
      const cmd = new UpdateClassCommandBuilder(GUID1, GUID2).build();

      await expect(handler.handle(cmd)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when class does not exist for course', async () => {
      const course = await createCourse();
      const handler = new UpdateClassCommandHandler();
      const cmd = new UpdateClassCommandBuilder(course.id, GUID2).build();

      await expect(handler.handle(cmd)).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError when maxUsers lower than enrolled users', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id, {enrolledUsers: 5});
      const handler = new UpdateClassCommandHandler();
      const cmd = new UpdateClassCommandBuilder(course.id, klass.id).withMaxUsers(3).build();

      await expect(handler.handle(cmd)).rejects.toThrow(BadRequestError);
    });
  });

  describe('Happy path', () => {
    it('should update class and return void', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id, {maxUsers: 10});
      const handler = new UpdateClassCommandHandler();
      const cmd = new UpdateClassCommandBuilder(course.id, klass.id).withMaxUsers(20).build();

      const result = await handler.handle(cmd);

      expect(result).toBeUndefined();
      const updated = await klass.reload();
      expect(updated.maxUsers).toBe(20);
    });
  });
});
