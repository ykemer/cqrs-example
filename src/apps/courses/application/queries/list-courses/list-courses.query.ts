import {RequestData} from 'mediatr-ts';

import {PaginatedRequest} from '@/libs/dto/domain';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

import {ListCoursesResponse} from './list-courses.response';

export class ListCoursesQuery extends RequestData<ListCoursesResponse> implements PaginatedRequest {
  public readonly page: number;
  public readonly pageSize: number;
  public readonly take: number;
  public readonly skip: number;

  constructor(
    page: number = 1,
    pageSize: number = 10,
    public readonly role: UserRole,
    public readonly userId: string
  ) {
    super();
    this.page = page;
    this.pageSize = pageSize;
    this.take = pageSize;
    this.skip = (page - 1) * pageSize;
  }
}
