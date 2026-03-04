import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {NotFoundError} from '@/libs/dto/domain';
import {IHandler} from '@/libs/tools/domain';

import {DeleteUserCommand} from './delete-user.command';

export class DeleteUserCommandHandler implements IHandler<DeleteUserCommand, void> {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async handle(input: DeleteUserCommand): Promise<void> {
    const {id} = input;
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('Invalid user');
    }

    await this.userRepository.delete(existingUser.id);
  }
}
