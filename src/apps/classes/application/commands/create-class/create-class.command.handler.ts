import {CreateClassCommand} from '@/apps/classes/application/commands/create-class/create-class.command';
import {ClassDto} from '@/apps/classes/domain/models/class.dto';
import {ClassesRepositoryInterface} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {IHandler} from '@/libs/tools/domain';

export class CreateClassCommandHandler implements IHandler<CreateClassCommand, ClassDto> {
  constructor(private readonly repository: ClassesRepositoryInterface) {}

  async handle(command: CreateClassCommand): Promise<ClassDto> {
    return this.repository.createClass(command.courseId, command.payload);
  }
}
