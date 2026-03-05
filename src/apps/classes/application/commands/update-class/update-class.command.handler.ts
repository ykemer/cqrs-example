import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {ClassDto} from '@/apps/classes/domain/models/class.dto';
import {ClassesRepositoryInterface} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {CLASS_TOKENS} from '@/apps/classes/infrastructure/di/tokens';

import {UpdateClassCommand} from './update-class.command';

@injectable()
@requestHandler(UpdateClassCommand)
export class UpdateClassCommandHandler implements RequestHandler<UpdateClassCommand, ClassDto | null> {
  constructor(@inject(CLASS_TOKENS.ClassesRepository) private readonly repository: ClassesRepositoryInterface) {}

  async handle(command: UpdateClassCommand): Promise<ClassDto | null> {
    return this.repository.updateClass(command.courseId, command.id, command.payload);
  }
}
