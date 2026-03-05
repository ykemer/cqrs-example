import {RequestData} from 'mediatr-ts';

import {CourseDto} from '@/apps/courses/domain/models/course.dto';

export class UpdateCourseCommand extends RequestData<CourseDto> {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string
  ) {
    super();
  }
}
