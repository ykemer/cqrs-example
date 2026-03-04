import {ClassDto} from '@/apps/classes/domain/models/class.dto';
import {ClassesRepositoryInterface} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {IHandler} from '@/libs/tools/domain';

import {UpdateClassCommand} from './update-class.command';

export class UpdateClassCommandHandler implements IHandler<UpdateClassCommand, ClassDto | null> {
  constructor(private readonly repository: ClassesRepositoryInterface) {}

  async handle(command: UpdateClassCommand): Promise<ClassDto | null> {
    return this.repository.updateClass(command.courseId, command.id, command.payload);
  }
}
