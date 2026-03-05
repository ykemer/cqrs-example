import {RequestData} from 'mediatr-ts';

import {CourseDto} from '@/apps/courses/domain/models/course.dto';

export class GetCourseQuery extends RequestData<CourseDto> {
  constructor(public readonly id: string) {
    super();
  }
}
