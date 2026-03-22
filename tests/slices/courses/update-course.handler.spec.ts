import {UpdateCourseCommandHandler} from '@/slices/courses/update-course/update-course';
import {NotFoundError} from '@/shared';
import {createCourse} from '../../utils/db';
import {UpdateCourseCommandBuilder} from '../../builders/course.builder';
import {GUID1} from '../../utils/fake-guilds';

describe('UpdateCourseCommandHandler', () => {
  describe('Edge cases', () => {
    it('should throw NotFoundError when course does not exist', async () => {
      const handler = new UpdateCourseCommandHandler();
      const cmd = new UpdateCourseCommandBuilder(GUID1).withName('New Name').build();

      await expect(handler.handle(cmd)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when course deleted between check and update', async () => {
      const course = await createCourse({name: 'Original', description: 'Original Desc'});
      await course.destroy();

      const handler = new UpdateCourseCommandHandler();
      const cmd = new UpdateCourseCommandBuilder(course.id).withName('New Name').build();

      await expect(handler.handle(cmd)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Happy path', () => {
    it('should update course and return void', async () => {
      const course = await createCourse({name: 'Old Name', description: 'Old Desc'});
      const handler = new UpdateCourseCommandHandler();
      const cmd = new UpdateCourseCommandBuilder(course.id)
        .withName('Updated Name')
        .withDescription('Updated Desc')
        .build();

      const result = await handler.handle(cmd);

      expect(result).toBeUndefined();
      const updated = await course.reload();
      expect(updated.name).toBe('Updated Name');
      expect(updated.description).toBe('Updated Desc');
    });

    it('should preserve createdAt on update', async () => {
      const course = await createCourse();
      const originalCreatedAt = course.createdAt;
      const handler = new UpdateCourseCommandHandler();
      const cmd = new UpdateCourseCommandBuilder(course.id).withName('New Name').build();

      await handler.handle(cmd);
      const updated = await course.reload();

      expect(updated.createdAt).toEqual(originalCreatedAt);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(new Date().getTime() - 1000);
    });

    it('should handle special characters in update', async () => {
      const course = await createCourse();
      const specialName = 'Course: TypeScript & Node.js 🚀';
      const specialDesc = "Learn <TypeScript> with 'quotes'";
      const handler = new UpdateCourseCommandHandler();
      const cmd = new UpdateCourseCommandBuilder(course.id).withName(specialName).withDescription(specialDesc).build();

      await handler.handle(cmd);
      const updated = await course.reload();

      expect(updated.name).toBe(specialName);
      expect(updated.description).toBe(specialDesc);
    });
  });
});
