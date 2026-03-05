import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {ClassDto} from '@/apps/classes/domain/models/class.dto';
import {ClassesRepositoryInterface} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {CLASS_TOKENS} from '@/apps/classes/infrastructure/di/tokens';

import {CreateClassCommand} from './create-class.command';

@injectable()
@requestHandler(CreateClassCommand)
export class CreateClassCommandHandler implements RequestHandler<CreateClassCommand, ClassDto> {
  constructor(@inject(CLASS_TOKENS.ClassesRepository) private readonly repository: ClassesRepositoryInterface) {}

  async handle(command: CreateClassCommand): Promise<ClassDto> {
    return this.repository.createClass(command.courseId, command.payload);
  }
}
