import {CoursesRepositoryInterface} from '@/apps/courses/domain/persistence/courses.repository.interface';
import {IHandler} from '@/libs/tools/domain';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

import {ListCoursesQuery} from './list-courses.query';
import {ListCoursesResponse} from './list-courses.response';

export class ListCoursesQueryHandler implements IHandler<ListCoursesQuery, ListCoursesResponse> {
  constructor(private readonly repository: CoursesRepositoryInterface) {}

  async handle(input: ListCoursesQuery): Promise<ListCoursesResponse> {
    const {take, skip, page, pageSize, role, userId} = input;

    let total: number;
    let data;

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
