import {GetCourseQueryHandler} from '@/slices/courses/get-course/get-course';
import {GetCourseQuery} from '@/slices/courses/get-course/get-course';
import {NotFoundError, CourseModel} from '@/shared';
import {createCourse} from '../../utils/db';
import {GUID1} from '../../utils/fake-guilds';

describe('GetCourseQueryHandler', () => {
  describe('Edge cases', () => {
    it('should throw NotFoundError when course does not exist', async () => {
      const handler = new GetCourseQueryHandler();
      const query = new GetCourseQuery(GUID1);

      await expect(handler.handle(query)).rejects.toThrow(NotFoundError);
    });

    it('should handle database query errors', async () => {
      const handler = new GetCourseQueryHandler();
      const query = new GetCourseQuery(GUID1);
      const findSpy = jest.spyOn(CourseModel, 'findByPk').mockRejectedValueOnce(new Error('Connection timeout'));

      await expect(handler.handle(query)).rejects.toThrow('Connection timeout');
      findSpy.mockRestore();
    });

    it('should handle null result from database', async () => {
      const handler = new GetCourseQueryHandler();
      const query = new GetCourseQuery(GUID1);
      const findSpy = jest.spyOn(CourseModel, 'findByPk').mockResolvedValueOnce(null);

      await expect(handler.handle(query)).rejects.toThrow(NotFoundError);
      findSpy.mockRestore();
    });
  });

  describe('Happy path', () => {
    it('should return course DTO with all fields', async () => {
      const course = await createCourse({name: 'React Basics', description: 'Learn React'});
      const handler = new GetCourseQueryHandler();
      const query = new GetCourseQuery(course.id);

      const result = await handler.handle(query);

      expect(result.id).toBe(course.id);
      expect(result.name).toBe('React Basics');
      expect(result.description).toBe('Learn React');
      expect(result.enrolledUsers).toBe(0);
    });

    it('should return correct DTO shape', async () => {
      const course = await createCourse();
      const handler = new GetCourseQueryHandler();
      const query = new GetCourseQuery(course.id);

      const result = await handler.handle(query);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('enrolledUsers');
      expect(Object.keys(result).length).toBe(4);
    });

    it('should return course with enrolled users count', async () => {
      const course = await createCourse();
      await course.update({enrolledUsers: 5});
      const handler = new GetCourseQueryHandler();
      const query = new GetCourseQuery(course.id);

      const result = await handler.handle(query);

      expect(result.enrolledUsers).toBe(5);
    });
  });
});
