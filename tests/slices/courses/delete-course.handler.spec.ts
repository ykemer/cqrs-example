import {DeleteCourseCommandHandler} from '@/slices/courses/delete-course/delete-course';
import {NotFoundError, BadRequestError, CourseModel} from '@/shared';
import {createCourse, createClass} from '../../utils/db';
import {DeleteCourseCommandBuilder} from '../../builders/course.builder';
import {GUID1} from '../../utils/fake-guilds';

describe('DeleteCourseCommandHandler', () => {
  describe('Edge cases', () => {
    it('should throw NotFoundError when course does not exist', async () => {
      const handler = new DeleteCourseCommandHandler();
      const cmd = new DeleteCourseCommandBuilder(GUID1).build();

      await expect(handler.handle(cmd)).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError when course has enrolled users', async () => {
      const course = await createCourse();
      await createClass(course.id, {enrolledUsers: 1});
      await course.update({enrolledUsers: 1});

      const handler = new DeleteCourseCommandHandler();
      const cmd = new DeleteCourseCommandBuilder(course.id).build();

      await expect(handler.handle(cmd)).rejects.toThrow(BadRequestError);
    });

    it('should handle database constraint errors during deletion', async () => {
      const course = await createCourse();
      const destroySpy = jest.spyOn(CourseModel, 'destroy').mockRejectedValueOnce(new Error('Foreign key constraint'));

      const handler = new DeleteCourseCommandHandler();
      const cmd = new DeleteCourseCommandBuilder(course.id).build();

      await expect(handler.handle(cmd)).rejects.toThrow('Foreign key constraint');
      destroySpy.mockRestore();

      const stillExists = await CourseModel.findByPk(course.id);
      expect(stillExists).not.toBeNull();
    });
  });

  describe('Happy path', () => {
    it('should delete course and return void', async () => {
      const course = await createCourse();
      const handler = new DeleteCourseCommandHandler();
      const cmd = new DeleteCourseCommandBuilder(course.id).build();

      const result = await handler.handle(cmd);

      expect(result).toBeUndefined();
      const deleted = await CourseModel.findByPk(course.id);
      expect(deleted).toBeNull();
    });

    it('should return void type exactly', async () => {
      const course = await createCourse();
      const handler = new DeleteCourseCommandHandler();
      const cmd = new DeleteCourseCommandBuilder(course.id).build();

      const result = await handler.handle(cmd);

      expect(result).toBeUndefined();
      expect(typeof result).toBe('undefined');
    });
  });
});
