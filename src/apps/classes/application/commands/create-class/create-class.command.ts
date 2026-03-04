import {UpsertClassPayload} from '@/apps/classes/domain/persistence/classes.repository.interface';

export class CreateClassCommand {
  constructor(
    public readonly courseId: string,
    public readonly payload: UpsertClassPayload
  ) {}
}
