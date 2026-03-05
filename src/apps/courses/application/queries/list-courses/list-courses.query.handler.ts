import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {CourseDto} from '@/apps/courses/domain/models/course.dto';
import {CoursesRepositoryInterface} from '@/apps/courses/domain/persistence/courses.repository.interface';
import {COURSE_TOKENS} from '@/apps/courses/infrastructure/di/tokens';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

import {ListCoursesQuery} from './list-courses.query';
import {ListCoursesResponse} from './list-courses.response';

@injectable()
@requestHandler(ListCoursesQuery)
export class ListCoursesQueryHandler implements RequestHandler<ListCoursesQuery, ListCoursesResponse> {
  constructor(@inject(COURSE_TOKENS.CoursesRepository) private readonly repository: CoursesRepositoryInterface) {}

  async handle(input: ListCoursesQuery): Promise<ListCoursesResponse> {
    const {take, skip, page, pageSize, role, userId} = input;

    let total: number;
    let data: CourseDto[];

    if (role === UserRole.admin) {
      // Admin: unrestricted paginated list
      ({total, data} = await this.repository.getCoursesWithCount(take, skip));
    } else {
      // Regular user: courses they are enrolled in OR courses that have a class
      // with registration deadline in the future
      ({total, data} = await this.repository.getCoursesForUser(userId, take, skip));
    }

    return new ListCoursesResponse({data, total, page, pageSize});
  }
}
