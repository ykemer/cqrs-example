import {BadRequestError} from '@/libs/dto/domain';
import {EnrollmentsModel} from '@/libs/tools/domain';

import {ClassBuilder} from '../../../../../tests/builders/class.builder';
import {CourseBuilder} from '../../../../../tests/builders/course.builder';
import {UserBuilder} from '../../../../../tests/builders/user.builder';
import {ClassesRepository} from './classes.repository';

describe('ClassesRepository', () => {
  let repository: ClassesRepository;

  beforeEach(() => {
    repository = new ClassesRepository();
  });

  describe('getClass', () => {
    it('should return a class by id and courseId', async () => {
      const course = await new CourseBuilder().build();
      const classObj = await new ClassBuilder(course.id).build();

      const result = await repository.getClass(course.id, classObj.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(classObj.id);
      expect(result?.courseId).toBe(course.id);
      expect(result?.name).toBe(course.name);
    });

    it('should return null if class does not exist for the course', async () => {
      const course = await new CourseBuilder().build();
      const result = await repository.getClass(course.id, '00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });
  });

  describe('getClassesWithCount', () => {
    it('should return classes for a course with total count', async () => {
      const course = await new CourseBuilder().build();
      await new ClassBuilder(course.id).build();
      await new ClassBuilder(course.id).build();

      const result = await repository.getClassesWithCount(course.id, 10, 0);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('createClass', () => {
    it('should create a new class for a course', async () => {
      const course = await new CourseBuilder().build();
      const payload = {
        maxUsers: 20,
        registrationDeadline: new Date(),
        startDate: new Date(),
        endDate: new Date(),
      };

      const result = await repository.createClass(course.id, payload);

      expect(result).toBeDefined();
      expect(result.courseId).toBe(course.id);
      expect(result.maxUsers).toBe(20);
    });
  });

  describe('updateClass', () => {
    it('should update an existing class', async () => {
      const course = await new CourseBuilder().build();
      const classObj = await new ClassBuilder(course.id).withMaxUsers(10).build();
      const payload = {
        maxUsers: 30,
        registrationDeadline: classObj.registrationDeadline,
        startDate: classObj.startDate,
        endDate: classObj.endDate,
      };

      const result = await repository.updateClass(course.id, classObj.id, payload);

      expect(result).toBeDefined();
      expect(result?.maxUsers).toBe(30);
    });

    it('should return null if class to update does not exist', async () => {
      const course = await new CourseBuilder().build();
      const result = await repository.updateClass(course.id, '00000000-0000-0000-0000-000000000000', {
        maxUsers: 10,
        registrationDeadline: new Date(),
        startDate: new Date(),
        endDate: new Date(),
      });
      expect(result).toBeNull();
    });
  });

  describe('deleteClass', () => {
    it('should delete an existing class', async () => {
      const course = await new CourseBuilder().build();
      const classObj = await new ClassBuilder(course.id).build();

      await repository.deleteClass(classObj.id);

      const found = await repository.getClass(course.id, classObj.id);
      expect(found).toBeNull();
    });

    it('should do nothing if class to delete does not exist', async () => {
      await expect(repository.deleteClass('00000000-0000-0000-0000-000000000000')).resolves.not.toThrow();
    });

    it('should throw BadRequestError if class has enrolled users', async () => {
      const course = await new CourseBuilder().build();
      const classObj = await new ClassBuilder(course.id).build();
      classObj.enrolledUsers = 1;
      await classObj.save();

      await expect(repository.deleteClass(classObj.id)).rejects.toThrow(BadRequestError);
    });
  });

  describe('getClassesForUser', () => {
    it('should return classes for user based on registration deadline or enrollment', async () => {
      const user = await new UserBuilder().build();
      const course = await new CourseBuilder().build();

      await new ClassBuilder(course.id)
        .withRegistrationDeadline(new Date(Date.now() + 1000 * 60 * 60 * 24)) // active
        .build();

      const class2 = await new ClassBuilder(course.id)
        .withRegistrationDeadline(new Date(Date.now() - 1000 * 60 * 60 * 24)) // passed
        .build();
      await EnrollmentsModel.create({userId: user.id, classId: class2.id});

      await new ClassBuilder(course.id)
        .withRegistrationDeadline(new Date(Date.now() - 1000 * 60 * 60 * 24)) // passed
        .build();

      const result = await repository.getClassesForUser(course.id, user.id, 10, 0);

      expect(result.total).toBe(2);
    });
  });
});
