import {ClassDto} from '@/apps/classes/domain/models/class.dto';
import {ClassesRepositoryInterface} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {IHandler} from '@/libs/tools/domain';

import {GetClassesForUserQuery} from './get-classes-for-user.query';

export class GetClassesForUserQueryHandler implements IHandler<
  GetClassesForUserQuery,
  {data: ClassDto[]; total: number}
> {
  constructor(private readonly repository: ClassesRepositoryInterface) {}

  async handle(query: GetClassesForUserQuery): Promise<{data: ClassDto[]; total: number}> {
    return this.repository.getClassesForUser(query.classId, query.userId, query.take, query.skip);
  }
}
