import {ListClassesQueryHandler} from '@/slices/classes/list-classes/list-classes';
import {ListClassesQuery} from '@/slices/classes/list-classes/list-classes';
import {UserRole} from '@/shared/domain/models/user';
import {createCourse, createClass, createUser, createEnrollment} from '../../utils/db';

describe('ListClassesQueryHandler', () => {
  describe('Admin', () => {
    it('should return all classes for a course paginated', async () => {
      const course = await createCourse();
      await createClass(course.id);
      await createClass(course.id);

      const handler = new ListClassesQueryHandler();
      const query = new ListClassesQuery(course.id, 1, 10, UserRole.admin, 'admin-id');

      const result = await handler.handle(query);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should respect pagination limits', async () => {
      const course = await createCourse();
      await createClass(course.id);
      await createClass(course.id);
      await createClass(course.id);

      const handler = new ListClassesQueryHandler();
      const query = new ListClassesQuery(course.id, 1, 2, UserRole.admin, 'admin-id');

      const result = await handler.handle(query);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(3);
    });
  });

  describe('User', () => {
    it('should return classes with future registration deadline', async () => {
      const user = await createUser({email: 'user@test.com'});
      const course = await createCourse();
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);

      await createClass(course.id, {registrationDeadline: futureDate});

      const handler = new ListClassesQueryHandler();
      const query = new ListClassesQuery(course.id, 1, 10, UserRole.user, user.id);

      const result = await handler.handle(query);

      expect(result.data).toHaveLength(1);
    });

    it('should return enrolled classes even if deadline passed', async () => {
      const user = await createUser({email: 'user@test.com'});
      const course = await createCourse();
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24);
      const klass = await createClass(course.id, {registrationDeadline: pastDate});

      await createEnrollment(klass.id, user.id);

      const handler = new ListClassesQueryHandler();
      const query = new ListClassesQuery(course.id, 1, 10, UserRole.user, user.id);

      const result = await handler.handle(query);

      expect(result.data).toHaveLength(1);
    });
  });
});
