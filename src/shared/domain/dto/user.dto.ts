import {UserRole} from '@/shared';

type UserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type UserWithPasswordDto = UserDto & {
  password: string;
};

export type {UserDto, UserWithPasswordDto};
