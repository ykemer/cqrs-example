import {CourseDto} from '@/apps/courses/domain/models/course.dto';
import {CoursesRepositoryInterface} from '@/apps/courses/domain/persistence/courses.repository.interface';
import {NotFoundError} from '@/libs/dto/domain';
import {IHandler} from '@/libs/tools/domain';

import {UpdateCourseCommand} from './update-course.command';

export class UpdateCourseCommandHandler implements IHandler<UpdateCourseCommand, CourseDto> {
  constructor(private readonly repository: CoursesRepositoryInterface) {}

  async handle(input: UpdateCourseCommand): Promise<CourseDto> {
    const {id, name, description} = input;

    const updated = await this.repository.updateCourse(id, {name, description});
    if (!updated) {
      throw new NotFoundError('Course not found');
    }

    return updated;
  }
}
