import {CreateClassCommandHandler} from '@/slices/classes/create-class/create-class';
import {NotFoundError} from '@/shared';
import {createCourse} from '../../utils/db';
import {CreateClassCommandBuilder} from '../../builders/class.builder';
import {GUID1} from '../../utils/fake-guilds';

describe('CreateClassCommandHandler', () => {
  describe('Edge cases', () => {
    it('should throw NotFoundError when course does not exist', async () => {
      const handler = new CreateClassCommandHandler();
      const cmd = new CreateClassCommandBuilder(GUID1).build();

      await expect(handler.handle(cmd)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Happy path', () => {
    it('should create and return a class DTO with all fields', async () => {
      const course = await createCourse();
      const handler = new CreateClassCommandHandler();
      const cmd = new CreateClassCommandBuilder(course.id).withMaxUsers(25).build();

      const result = await handler.handle(cmd);

      expect(result.id).toBeTruthy();
      expect(result.courseId).toBe(course.id);
      expect(result.maxUsers).toBe(25);
      expect(result.enrolledUsers).toBe(0);
    });
  });
});
