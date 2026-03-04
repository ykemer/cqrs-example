import {ClassDto} from '@/apps/classes/domain/models/class.dto';
import {ClassesRepositoryInterface} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {IHandler} from '@/libs/tools/domain';

import {GetClassesWithCountQuery} from './get-classes-with-count.query';

export class GetClassesWithCountQueryHandler implements IHandler<
  GetClassesWithCountQuery,
  {data: ClassDto[]; total: number}
> {
  constructor(private readonly repository: ClassesRepositoryInterface) {}

  async handle(query: GetClassesWithCountQuery): Promise<{data: ClassDto[]; total: number}> {
    return this.repository.getClassesWithCount(query.classId, query.take, query.skip);
  }
}
