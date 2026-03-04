import {PaginatedRequest} from '@/libs/dto/domain';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

export class ListCoursesQuery extends PaginatedRequest {
  constructor(
    page: number = 1,
    pageSize: number = 10,
    public readonly role: UserRole,
    public readonly userId: string
  ) {
    super(page, pageSize);
  }
}
