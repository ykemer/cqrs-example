import {RequestData} from 'mediatr-ts';

import {ClassDto} from '@/apps/classes/domain/models/class.dto';
import {UpsertClassPayload} from '@/apps/classes/domain/persistence/classes.repository.interface';

export class CreateClassCommand extends RequestData<ClassDto> {
  constructor(
    public readonly courseId: string,
    public readonly payload: UpsertClassPayload
  ) {
    super();
  }
}
