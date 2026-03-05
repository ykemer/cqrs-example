import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {CoursesRepositoryInterface} from '@/apps/courses/domain/persistence/courses.repository.interface';
import {COURSE_TOKENS} from '@/apps/courses/infrastructure/di/tokens';
import {BadRequestError, NotFoundError} from '@/libs/dto/domain';

import {DeleteCourseCommand} from './delete-course.command';

@injectable()
@requestHandler(DeleteCourseCommand)
export class DeleteCourseCommandHandler implements RequestHandler<DeleteCourseCommand, void> {
  constructor(@inject(COURSE_TOKENS.CoursesRepository) private readonly repository: CoursesRepositoryInterface) {}

  async handle(input: DeleteCourseCommand): Promise<void> {
    const {id} = input;

    const course = await this.repository.getCourse(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.enrolledUsers > 0) {
      throw new BadRequestError('Cannot delete a course with enrolled users');
    }

    await this.repository.deleteCourse(id);
  }
}
