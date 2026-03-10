import {ClassModel} from '@/shared/domain/models/class';

describe('ClassModel', () => {
  it('toClassDto maps fields correctly', () => {
    const now = new Date();
    const c: any = ClassModel.build({
      id: 'c1',
      courseId: 'course1',
      maxUsers: 10,
      enrolledUsers: 2,
      registrationDeadline: now,
      startDate: now,
      endDate: now,
    });

    const dto = c.toClassDto('Course Name');
    expect(dto).toMatchObject({
      id: 'c1',
      courseId: 'course1',
      name: 'Course Name',
      maxUsers: 10,
      enrolledUsers: 2,
    });
  });
});
