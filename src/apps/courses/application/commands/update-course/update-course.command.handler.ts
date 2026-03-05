import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {CourseDto} from '@/apps/courses/domain/models/course.dto';
import {CoursesRepositoryInterface} from '@/apps/courses/domain/persistence/courses.repository.interface';
import {COURSE_TOKENS} from '@/apps/courses/infrastructure/di/tokens';
import {NotFoundError} from '@/libs/dto/domain';

import {UpdateCourseCommand} from './update-course.command';

@injectable()
@requestHandler(UpdateCourseCommand)
export class UpdateCourseCommandHandler implements RequestHandler<UpdateCourseCommand, CourseDto> {
  constructor(@inject(COURSE_TOKENS.CoursesRepository) private readonly repository: CoursesRepositoryInterface) {}

  async handle(input: UpdateCourseCommand): Promise<CourseDto> {
    const {id, name, description} = input;

    const updated = await this.repository.updateCourse(id, {name, description});
    if (!updated) {
      throw new NotFoundError('Course not found');
    }

    return updated;
  }
}
