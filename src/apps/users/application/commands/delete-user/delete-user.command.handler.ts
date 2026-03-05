import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {USER_TOKENS} from '@/apps/users/infrastructure/di/tokens';
import {NotFoundError} from '@/libs/dto/domain';

import {DeleteUserCommand} from './delete-user.command';

@injectable()
@requestHandler(DeleteUserCommand)
export class DeleteUserCommandHandler implements RequestHandler<DeleteUserCommand, void> {
  constructor(@inject(USER_TOKENS.UserRepository) private readonly userRepository: UserRepositoryInterface) {}

  async handle(input: DeleteUserCommand): Promise<void> {
    const {id} = input;
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('Invalid user');
    }

    await this.userRepository.delete(existingUser.id);
  }
}
