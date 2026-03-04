import {ClassesRepositoryInterface} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {IHandler} from '@/libs/tools/domain';

import {DeleteClassCommand} from './delete-class.command';

export class DeleteClassCommandHandler implements IHandler<DeleteClassCommand, void> {
  constructor(private readonly repository: ClassesRepositoryInterface) {}

  async handle(command: DeleteClassCommand): Promise<void> {
    return this.repository.deleteClass(command.courseId, command.id);
  }
}
