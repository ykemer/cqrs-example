import {CourseDto} from '@/apps/courses/domain/models/course.dto';
import {PaginatedResponse} from '@/libs/dto/domain';

export class ListCoursesResponse extends PaginatedResponse<CourseDto> {}
