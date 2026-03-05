import {RequestData} from 'mediatr-ts';

import {UserWithPasswordDto} from '@/libs/dto/domain';

export class UpdateUserCommand extends RequestData<void> {
  constructor(
    public readonly id: string,
    public readonly updates: Partial<Omit<UserWithPasswordDto, 'id'>>
  ) {
    super();
  }
}
