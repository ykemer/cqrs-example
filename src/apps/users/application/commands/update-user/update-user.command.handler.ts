import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {BadRequestError, NotFoundError} from '@/libs/dto/domain';
import {IHandler} from '@/libs/tools/domain';
import {PasswordServiceInterface} from '@/libs/tools/domain';

import {UpdateUserCommand} from './update-user.command';

export class UpdateUserCommandHandler implements IHandler<UpdateUserCommand, void> {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly passwordService: PasswordServiceInterface
  ) {}

  async handle(input: UpdateUserCommand): Promise<void> {
    const {id, updates} = input;

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    if (Object.keys(updates).length === 0) {
      throw new BadRequestError('User could not be updated');
    }

    if (updates.password) {
      updates.password = await this.passwordService.encode(updates.password);
    }

    await this.userRepository.update(id, updates);
  }
}
