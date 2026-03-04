import {UpsertClassPayload} from '@/apps/classes/domain/persistence/classes.repository.interface';

export class UpdateClassCommand {
  constructor(
    public readonly courseId: string,
    public readonly id: string,
    public readonly payload: UpsertClassPayload
  ) {}
}
