import {UserWithPasswordDto} from '@/libs/dto/domain';

export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly updates: Partial<Omit<UserWithPasswordDto, 'id'>>
  ) {}
}
