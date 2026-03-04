import {ClassDto} from '@/apps/classes/domain/models/class.dto';
import {ClassesRepositoryInterface} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {IHandler} from '@/libs/tools/domain';

import {GetClassQuery} from './get-class.query';

export class GetClassQueryHandler implements IHandler<GetClassQuery, ClassDto | null> {
  constructor(private readonly repository: ClassesRepositoryInterface) {}

  async handle(query: GetClassQuery): Promise<ClassDto | null> {
    return this.repository.getClass(query.classId, query.id);
  }
}
