import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {ClassesRepositoryInterface} from '@/apps/classes/domain/persistence/classes.repository.interface';
import {CLASS_TOKENS} from '@/apps/classes/infrastructure/di/tokens';

import {DeleteClassCommand} from './delete-class.command';

@injectable()
@requestHandler(DeleteClassCommand)
export class DeleteClassCommandHandler implements RequestHandler<DeleteClassCommand, void> {
  constructor(@inject(CLASS_TOKENS.ClassesRepository) private readonly repository: ClassesRepositoryInterface) {}

  async handle(command: DeleteClassCommand): Promise<void> {
    return this.repository.deleteClass(command.courseId, command.id);
  }
}
