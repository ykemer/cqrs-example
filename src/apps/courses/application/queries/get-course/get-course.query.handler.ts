import {CourseDto} from '@/apps/courses/domain/models/course.dto';
import {CoursesRepositoryInterface} from '@/apps/courses/domain/persistence/courses.repository.interface';
import {NotFoundError} from '@/libs/dto/domain';
import {IHandler} from '@/libs/tools/domain';

import {GetCourseQuery} from './get-course.query';

export class GetCourseQueryHandler implements IHandler<GetCourseQuery, CourseDto> {
  constructor(private readonly repository: CoursesRepositoryInterface) {}

  async handle(input: GetCourseQuery): Promise<CourseDto> {
    const course = await this.repository.getCourse(input.id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return course;
  }
}
