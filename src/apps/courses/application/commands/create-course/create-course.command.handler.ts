import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {CourseDto} from '@/apps/courses/domain/models/course.dto';
import {CoursesRepositoryInterface} from '@/apps/courses/domain/persistence/courses.repository.interface';
import {COURSE_TOKENS} from '@/apps/courses/infrastructure/di/tokens';

import {CreateCourseCommand} from './create-course.command';

@injectable()
@requestHandler(CreateCourseCommand)
export class CreateCourseCommandHandler implements RequestHandler<CreateCourseCommand, CourseDto> {
  constructor(@inject(COURSE_TOKENS.CoursesRepository) private readonly repository: CoursesRepositoryInterface) {}

  async handle(input: CreateCourseCommand): Promise<CourseDto> {
    const {name, description} = input;
    return this.repository.createCourse({name, description});
  }
}
