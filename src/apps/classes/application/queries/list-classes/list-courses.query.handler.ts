import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {ListClassesResponse} from '@/apps/classes/application/queries/list-classes/list-courses.response';
import {ClassDto} from '@/apps/classes/domain/models/class.dto';
import {ClassesRepositoryInterface} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {CLASS_TOKENS} from '@/apps/classes/infrastructure/di/tokens';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

import {ListClassesQuery} from './list-classes.query';

@injectable()
@requestHandler(ListClassesQuery)
export class ListClassesQueryHandler implements RequestHandler<ListClassesQuery, ListClassesResponse> {
  constructor(@inject(CLASS_TOKENS.ClassesRepository) private readonly repository: ClassesRepositoryInterface) {}

  async handle(input: ListClassesQuery): Promise<ListClassesResponse> {
    const {take, skip, page, pageSize, role, userId, courseId} = input;

    let total: number;
    let data: ClassDto[];

    if (role === UserRole.admin) {
      // Admin: unrestricted paginated list
      ({total, data} = await this.repository.getClassesWithCount(courseId, take, skip));
    } else {
      // Regular user: courses they are enrolled in OR courses that have a class
      // with registration deadline in the future
      ({total, data} = await this.repository.getClassesForUser(courseId, userId, take, skip));
    }

    return new ListClassesResponse({data, total, page, pageSize});
  }
}
