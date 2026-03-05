import {RequestData} from 'mediatr-ts';

import {CourseDto} from '@/apps/courses/domain/models/course.dto';

export class CreateCourseCommand extends RequestData<CourseDto> {
  constructor(
    public readonly name: string,
    public readonly description: string
  ) {
    super();
  }
}
