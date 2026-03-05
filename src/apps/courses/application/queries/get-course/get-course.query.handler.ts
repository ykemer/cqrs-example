import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {CourseDto} from '@/apps/courses/domain/models/course.dto';
import {CoursesRepositoryInterface} from '@/apps/courses/domain/persistence/courses.repository.interface';
import {COURSE_TOKENS} from '@/apps/courses/infrastructure/di/tokens';
import {NotFoundError} from '@/libs/dto/domain';

import {GetCourseQuery} from './get-course.query';

@injectable()
@requestHandler(GetCourseQuery)
export class GetCourseQueryHandler implements RequestHandler<GetCourseQuery, CourseDto> {
  constructor(@inject(COURSE_TOKENS.CoursesRepository) private readonly repository: CoursesRepositoryInterface) {}

  async handle(input: GetCourseQuery): Promise<CourseDto> {
    const course = await this.repository.getCourse(input.id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return course;
  }
}
