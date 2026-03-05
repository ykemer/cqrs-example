import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {USER_TOKENS} from '@/apps/users/infrastructure/di/tokens';
import {ConflictError} from '@/libs/dto/domain';
import {PasswordServiceInterface} from '@/libs/tools/domain';

import {RegisterCommand} from './register.command';

@injectable()
@requestHandler(RegisterCommand)
export class RegisterCommandHandler implements RequestHandler<RegisterCommand, void> {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: UserRepositoryInterface,
    @inject(USER_TOKENS.PasswordService) private readonly passwordService: PasswordServiceInterface
  ) {}

  async handle(input: RegisterCommand): Promise<void> {
    const {name, email, password} = input;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    const hashedPassword = await this.passwordService.encode(password);
    await this.userRepository.create({name, email, password: hashedPassword});
  }
}
