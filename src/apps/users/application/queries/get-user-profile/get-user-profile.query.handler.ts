import {RequestHandler, requestHandler} from 'mediatr-ts';
import {inject, injectable} from 'tsyringe';

import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {USER_TOKENS} from '@/apps/users/infrastructure/di/tokens';
import {NotFoundError, UserDto} from '@/libs/dto/domain';

import {GetUserProfileQuery} from './get-user-profile.query';

@injectable()
@requestHandler(GetUserProfileQuery)
export class GetUserProfileQueryHandler implements RequestHandler<GetUserProfileQuery, UserDto> {
  constructor(@inject(USER_TOKENS.UserRepository) private readonly userRepository: UserRepositoryInterface) {}

  async handle(input: GetUserProfileQuery): Promise<UserDto> {
    const {id} = input;
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    const {password: _password, ...userDto} = existingUser;
    return userDto;
  }
}
