import {CourseModel} from '@/shared/domain/models/course';

describe('CourseModel', () => {
  it('toCourseDto maps fields and defaults enrolledUsers to 0', () => {
    const c: any = CourseModel.build({id: '1', name: 'n', description: 'd', enrolledUsers: undefined});
    const dto = c.toCourseDto();
    expect(dto).toMatchObject({id: '1', name: 'n', description: 'd', enrolledUsers: 0});
  });

  it('toCourseDto keeps enrolledUsers when present', () => {
    const c: any = CourseModel.build({id: '2', name: 'n2', description: 'd2', enrolledUsers: 5});
    const dto = c.toCourseDto();
    expect(dto.enrolledUsers).toBe(5);
  });
});
