import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {ClassDto} from '@/apps/classes/domain/models/class.dto';
import {ClassesRepositoryInterface} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {CLASS_TOKENS} from '@/apps/classes/infrastructure/di/tokens';

import {GetClassQuery} from './get-class.query';

@injectable()
@requestHandler(GetClassQuery)
export class GetClassQueryHandler implements RequestHandler<GetClassQuery, ClassDto | null> {
  constructor(@inject(CLASS_TOKENS.ClassesRepository) private readonly repository: ClassesRepositoryInterface) {}

  async handle(query: GetClassQuery): Promise<ClassDto | null> {
    return this.repository.getClass(query.classId, query.id);
  }
}
