import {BadRequestError} from '@/libs/dto/domain';
import {EnrollmentsModel} from '@/libs/tools/domain';

import {ClassBuilder} from '../../../../../tests/builders/class.builder';
import {CourseBuilder} from '../../../../../tests/builders/course.builder';
import {UserBuilder} from '../../../../../tests/builders/user.builder';
import {CoursesRepository} from './courses.repository';

describe('CoursesRepository', () => {
  let repository: CoursesRepository;

  beforeEach(() => {
    repository = new CoursesRepository();
  });

  describe('getCourse', () => {
    it('should return a course by id', async () => {
      const course = await new CourseBuilder().withName('Test Course').build();
      const result = await repository.getCourse(course.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(course.id);
      expect(result?.name).toBe('Test Course');
    });

    it('should return null if course does not exist', async () => {
      const result = await repository.getCourse('00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });
  });

  describe('getCoursesWithCount', () => {
    it('should return courses with total count', async () => {
      await new CourseBuilder().withName('Course 1').build();
      await new CourseBuilder().withName('Course 2').build();

      const result = await repository.getCoursesWithCount(10, 0);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('createCourse', () => {
    it('should create a new course', async () => {
      const payload = {name: 'New Course', description: 'Description'};
      const result = await repository.createCourse(payload);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Course');
      expect(result.id).toBeDefined();
    });
  });

  describe('updateCourse', () => {
    it('should update an existing course', async () => {
      const course = await new CourseBuilder().withName('Old Name').build();
      const payload = {name: 'New Name', description: 'New Description'};

      const result = await repository.updateCourse(course.id, payload);

      expect(result).toBeDefined();
      expect(result?.name).toBe('New Name');
    });

    it('should return null if course to update does not exist', async () => {
      const result = await repository.updateCourse('00000000-0000-0000-0000-000000000000', {
        name: 'Name',
        description: 'Desc',
      });
      expect(result).toBeNull();
    });
  });

  describe('deleteCourse', () => {
    it('should delete an existing course', async () => {
      const course = await new CourseBuilder().build();
      await repository.deleteCourse(course.id);

      const found = await repository.getCourse(course.id);
      expect(found).toBeNull();
    });

    it('should do nothing if course to delete does not exist', async () => {
      await expect(repository.deleteCourse('00000000-0000-0000-0000-000000000000')).resolves.not.toThrow();
    });

    it('should throw BadRequestError if course has enrolled users', async () => {
      const course = await new CourseBuilder().build();
      course.enrolledUsers = 1;
      await course.save();

      await expect(repository.deleteCourse(course.id)).rejects.toThrow(BadRequestError);
    });
  });

  describe('getCoursesForUser', () => {
    it('should return courses for user based on registration deadline or enrollment', async () => {
      const user = await new UserBuilder().build();
      const course1 = await new CourseBuilder().withName('Course with active deadline').build();
      await new ClassBuilder(course1.id)
        .withRegistrationDeadline(new Date(Date.now() + 1000 * 60 * 60 * 24)) // active
        .build();

      const course2 = await new CourseBuilder().withName('Course with passed deadline but enrolled').build();
      const class2 = await new ClassBuilder(course2.id)
        .withRegistrationDeadline(new Date(Date.now() - 1000 * 60 * 60 * 24)) // passed
        .build();
      await EnrollmentsModel.create({userId: user.id, classId: class2.id});

      const course3 = await new CourseBuilder().withName('Course with passed deadline and not enrolled').build();
      await new ClassBuilder(course3.id)
        .withRegistrationDeadline(new Date(Date.now() - 1000 * 60 * 60 * 24)) // passed
        .build();

      const result = await repository.getCoursesForUser(user.id, 10, 0);

      expect(result.total).toBe(2);
      const names = result.data.map(c => c.name);
      expect(names).toContain('Course with active deadline');
      expect(names).toContain('Course with passed deadline but enrolled');
      expect(names).not.toContain('Course with passed deadline and not enrolled');
    });
  });
});
