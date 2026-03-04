import {UserRole} from '@/libs/tools/domain/persistence/models/user';

type UserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type UserWithPasswordDto = UserDto & {
  password: string;
};

export type {UserDto, UserRole, UserWithPasswordDto};
