import {RequestData} from 'mediatr-ts';

import {ClassDto} from '@/apps/classes/domain/models/class.dto';
import {UpsertClassPayload} from '@/apps/classes/domain/persistence/classes.repository.interface';

export class UpdateClassCommand extends RequestData<ClassDto | null> {
  constructor(
    public readonly courseId: string,
    public readonly id: string,
    public readonly payload: UpsertClassPayload
  ) {
    super();
  }
}
