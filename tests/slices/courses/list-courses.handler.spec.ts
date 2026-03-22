import {ListCoursesQueryHandler} from '@/slices/courses/list-courses/list-courses';
import {ListCoursesQuery} from '@/slices/courses/list-courses/list-courses';
import {UserRole} from '@/shared/domain/models/user';
import {createCourse, createClass, createUser, createEnrollment} from '../../utils/db';

describe('ListCoursesQueryHandler', () => {
  describe('Admin', () => {
    it('should return all courses paginated for admin', async () => {
      await createCourse({name: 'Course 1'});
      await createCourse({name: 'Course 2'});

      const handler = new ListCoursesQueryHandler();
      const query = new ListCoursesQuery(1, 10, UserRole.admin, 'admin-id');

      const result = await handler.handle(query);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should respect pagination limits', async () => {
      await createCourse();
      await createCourse();
      await createCourse();

      const handler = new ListCoursesQueryHandler();
      const query = new ListCoursesQuery(1, 2, UserRole.admin, 'admin-id');

      const result = await handler.handle(query);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(3);
    });
  });

  describe('User - Future deadline', () => {
    it('should return courses with future registration deadline', async () => {
      const user = await createUser({email: 'user@test.com'});
      const course = await createCourse();
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);

      await createClass(course.id, {registrationDeadline: futureDate});

      const handler = new ListCoursesQueryHandler();
      const query = new ListCoursesQuery(1, 10, UserRole.user, user.id);

      const result = await handler.handle(query);

      expect(result.data).toHaveLength(1);
    });
  });

  describe('User - Enrolled courses', () => {
    it('should return enrolled courses even if deadline passed', async () => {
      const user = await createUser({email: 'user@test.com'});
      const course = await createCourse();
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24);
      const klass = await createClass(course.id, {registrationDeadline: pastDate});

      await createEnrollment(klass.id, user.id);

      const handler = new ListCoursesQueryHandler();
      const query = new ListCoursesQuery(1, 10, UserRole.user, user.id);

      const result = await handler.handle(query);

      expect(result.data).toHaveLength(1);
    });

    it('should not return closed courses user is not enrolled in', async () => {
      const user = await createUser({email: 'user@test.com'});
      const course = await createCourse();
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24);

      await createClass(course.id, {registrationDeadline: pastDate});

      const handler = new ListCoursesQueryHandler();
      const query = new ListCoursesQuery(1, 10, UserRole.user, user.id);

      const result = await handler.handle(query);

      expect(result.data).toHaveLength(0);
    });
  });
});
