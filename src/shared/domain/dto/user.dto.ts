import {UserRole} from '@/shared';

export type UserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
