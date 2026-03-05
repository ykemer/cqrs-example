import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {USER_TOKENS} from '@/apps/users/infrastructure/di/tokens';
import {BadRequestError, NotFoundError} from '@/libs/dto/domain';
import {PasswordServiceInterface} from '@/libs/tools/domain';

import {UpdateUserCommand} from './update-user.command';

@injectable()
@requestHandler(UpdateUserCommand)
export class UpdateUserCommandHandler implements RequestHandler<UpdateUserCommand, void> {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: UserRepositoryInterface,
    @inject(USER_TOKENS.PasswordService) private readonly passwordService: PasswordServiceInterface
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
