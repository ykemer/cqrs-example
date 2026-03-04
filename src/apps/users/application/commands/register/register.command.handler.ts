import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {ConflictError} from '@/libs/dto/domain';
import {IHandler} from '@/libs/tools/domain';
import {PasswordServiceInterface} from '@/libs/tools/domain';

import {RegisterCommand} from './register.command';

export class RegisterCommandHandler implements IHandler<RegisterCommand, void> {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly passwordService: PasswordServiceInterface
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
