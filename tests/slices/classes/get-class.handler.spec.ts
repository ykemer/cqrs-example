import {GetClassQueryHandler} from '@/slices/classes/get-class/get-class';
import {GetClassQuery} from '@/slices/classes/get-class/get-class';
import {NotFoundError} from '@/shared';
import {createCourse, createClass} from '../../utils/db';
import {GUID1, GUID2} from '../../utils/fake-guilds';

describe('GetClassQueryHandler', () => {
  describe('Edge cases', () => {
    it('should throw NotFoundError when course does not exist', async () => {
      const handler = new GetClassQueryHandler();
      const query = new GetClassQuery(GUID1, GUID2);

      await expect(handler.handle(query)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when class does not exist for course', async () => {
      const course = await createCourse();
      const handler = new GetClassQueryHandler();
      const query = new GetClassQuery(course.id, GUID2);

      await expect(handler.handle(query)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Happy path', () => {
    it('should return class DTO with all fields', async () => {
      const course = await createCourse({name: 'Math 101'});
      const klass = await createClass(course.id);

      const handler = new GetClassQueryHandler();
      const query = new GetClassQuery(course.id, klass.id);

      const result = await handler.handle(query);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(klass.id);
      expect(result!.courseId).toBe(course.id);
      expect(result!.maxUsers).toBe(10);
      expect(result!.enrolledUsers).toBe(0);
    });
  });
});
