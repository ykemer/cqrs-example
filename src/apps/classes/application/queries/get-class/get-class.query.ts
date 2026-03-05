import {RequestData} from 'mediatr-ts';

import {ClassDto} from '@/apps/classes/domain/models/class.dto';

export class GetClassQuery extends RequestData<ClassDto | null> {
  constructor(
    public readonly classId: string,
    public readonly id: string
  ) {
    super();
  }
}
