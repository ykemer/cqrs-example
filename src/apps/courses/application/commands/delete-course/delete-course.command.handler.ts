import {CoursesRepositoryInterface} from '@/apps/courses/domain/persistence/courses.repository.interface';
import {BadRequestError, NotFoundError} from '@/libs/dto/domain';
import {IHandler} from '@/libs/tools/domain';

import {DeleteCourseCommand} from './delete-course.command';

export class DeleteCourseCommandHandler implements IHandler<DeleteCourseCommand, void> {
  constructor(private readonly repository: CoursesRepositoryInterface) {}

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
