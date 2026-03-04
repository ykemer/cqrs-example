import {ListUsersQuery} from '@/apps/users/application/queries/list-users/list-users.query';
import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {IHandler} from '@/libs/tools/domain';

import {ListUsersResponse} from './list-users.response';

export class ListUsersCommandHandler implements IHandler<ListUsersQuery, ListUsersResponse> {
  constructor(private readonly repository: UserRepositoryInterface) {}

  async handle(input: ListUsersQuery): Promise<ListUsersResponse> {
    const {total, data} = await this.repository.getUsers(input.take, input.skip);

    return new ListUsersResponse({
      data,
      total,
      page: input.page,
      pageSize: input.pageSize,
    });
  }
}
