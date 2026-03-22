import {CreateCourseCommandHandler} from '@/slices/courses/create-course/create-course';
import {CourseModel} from '@/shared';
import {CreateCourseCommandBuilder} from '../../builders/course.builder';

describe('CreateCourseCommandHandler', () => {
  describe('Edge cases', () => {
    it('should handle database create errors', async () => {
      const createSpy = jest.spyOn(CourseModel, 'create').mockRejectedValueOnce(new Error('Database error'));

      const cmd = new CreateCourseCommandBuilder()
        .withName('Valid Course')
        .withDescription('Valid Description')
        .build();
      const handler = new CreateCourseCommandHandler();

      await expect(handler.handle(cmd)).rejects.toThrow('Database error');
      createSpy.mockRestore();
    });

    it('should handle empty/null values gracefully', async () => {
      const cmd = new CreateCourseCommandBuilder().withName('').withDescription('').build();
      const handler = new CreateCourseCommandHandler();

      const result = await handler.handle(cmd);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('');
      expect(result.description).toBe('');
    });

    it('should generate UUIDs that are unique', async () => {
      const handler = new CreateCourseCommandHandler();

      const result1 = await handler.handle(new CreateCourseCommandBuilder().withName('C1').build());
      const result2 = await handler.handle(new CreateCourseCommandBuilder().withName('C2').build());

      expect(result1.id).not.toBe(result2.id);
      expect(result1.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}/i);
    });
  });

  describe('Happy path', () => {
    it('should create and return a course DTO with all fields', async () => {
      const cmd = new CreateCourseCommandBuilder()
        .withName('Advanced TypeScript')
        .withDescription('Learn TS deeply')
        .build();
      const handler = new CreateCourseCommandHandler();

      const result = await handler.handle(cmd);

      expect(result.id).toBeTruthy();
      expect(result.name).toBe('Advanced TypeScript');
      expect(result.description).toBe('Learn TS deeply');
      expect(result.enrolledUsers).toBe(0);
    });

    it('should persist course to database', async () => {
      const cmd = new CreateCourseCommandBuilder()
        .withName('Persisted Course')
        .withDescription('Should be in DB')
        .build();
      const handler = new CreateCourseCommandHandler();

      const result = await handler.handle(cmd);
      const persisted = await CourseModel.findByPk(result.id);

      expect(persisted).not.toBeNull();
      expect(persisted?.name).toBe('Persisted Course');
    });

    it('should initialize enrolledUsers to 0', async () => {
      const cmd = new CreateCourseCommandBuilder().build();
      const handler = new CreateCourseCommandHandler();

      const result = await handler.handle(cmd);

      expect(result.enrolledUsers).toBe(0);
    });
  });
});
