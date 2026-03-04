import {CourseDto} from '@/apps/courses/domain/models/course.dto';
import {PaginatedResponse} from '@/libs/dto/domain';

export class GetCourseResponse extends PaginatedResponse<CourseDto> {}
