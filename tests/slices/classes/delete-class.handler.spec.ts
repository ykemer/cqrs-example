import {DeleteClassCommandHandler} from '@/slices/classes/delete-class/delete-class';
import {NotFoundError, BadRequestError, ClassModel} from '@/shared';
import {createCourse, createClass} from '../../utils/db';
import {DeleteClassCommandBuilder} from '../../builders/class.builder';
import {GUID2} from '../../utils/fake-guilds';

describe('DeleteClassCommandHandler', () => {
  describe('Edge cases', () => {
    it('should throw NotFoundError when class does not exist', async () => {
      const course = await createCourse();
      const handler = new DeleteClassCommandHandler();
      const cmd = new DeleteClassCommandBuilder(course.id, GUID2).build();

      await expect(handler.handle(cmd)).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError when class has enrolled users', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id, {enrolledUsers: 2});
      const handler = new DeleteClassCommandHandler();
      const cmd = new DeleteClassCommandBuilder(course.id, klass.id).build();

      await expect(handler.handle(cmd)).rejects.toThrow(BadRequestError);
    });
  });

  describe('Happy path', () => {
    it('should delete class and return void', async () => {
      const course = await createCourse();
      const klass = await createClass(course.id);
      const handler = new DeleteClassCommandHandler();
      const cmd = new DeleteClassCommandBuilder(course.id, klass.id).build();

      const result = await handler.handle(cmd);

      expect(result).toBeUndefined();
      const deleted = await ClassModel.findByPk(klass.id);
      expect(deleted).toBeNull();
    });
  });
});
