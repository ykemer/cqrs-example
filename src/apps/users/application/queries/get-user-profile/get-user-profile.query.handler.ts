import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {NotFoundError, UserDto} from '@/libs/dto/domain';
import {IHandler} from '@/libs/tools/domain';

import {GetUserProfileQuery} from './get-user-profile.query';

export class GetUserProfileQueryHandler implements IHandler<GetUserProfileQuery, UserDto> {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

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
