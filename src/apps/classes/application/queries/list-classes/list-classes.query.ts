import {RequestData} from 'mediatr-ts';

import {PaginatedRequest} from '@/libs/dto/domain';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

import {ListClassesResponse} from './list-courses.response';

export class ListClassesQuery extends RequestData<ListClassesResponse> implements PaginatedRequest {
  public readonly courseId: string;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly take: number;
  public readonly skip: number;

  constructor(
    courseId: string,
    page: number = 1,
    pageSize: number = 10,
    public readonly role: UserRole,
    public readonly userId: string
  ) {
    super();
    this.courseId = courseId;
    this.page = page;
    this.pageSize = pageSize;
    this.take = pageSize;
    this.skip = (page - 1) * pageSize;
  }
}
