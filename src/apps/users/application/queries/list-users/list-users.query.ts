import {RequestData} from 'mediatr-ts';

import {ListUsersResponse} from '@/apps/users/application/queries/list-users/list-users.response';

export class ListUsersQuery extends RequestData<ListUsersResponse> {
  page: number;
  pageSize: number;
  take: number;
  skip: number;

  constructor(page: number = 1, pageSize: number = 10) {
    super();
    this.page = page;
    this.pageSize = pageSize;

    this.take = pageSize;
    this.skip = (page - 1) * pageSize;
  }
}
