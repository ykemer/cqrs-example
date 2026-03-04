import {CourseDto} from '@/apps/courses/domain/models/course.dto';
import {CoursesRepositoryInterface} from '@/apps/courses/domain/persistence/courses.repository.interface';
import {IHandler} from '@/libs/tools/domain';

import {CreateCourseCommand} from './create-course.command';

export class CreateCourseCommandHandler implements IHandler<CreateCourseCommand, CourseDto> {
  constructor(private readonly repository: CoursesRepositoryInterface) {}

  async handle(input: CreateCourseCommand): Promise<CourseDto> {
    const {name, description} = input;
    return this.repository.createCourse({name, description});
  }
}
