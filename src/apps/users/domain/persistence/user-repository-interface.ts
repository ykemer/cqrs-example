import {UserDto, UserWithPasswordDto} from '@/libs/dto/domain';

import {UserCreateRequest, UserUpdateRequest} from '../models/user';

type UserRepositoryInterface = {
  getUsers: (take: number, skip: number) => Promise<{data: UserDto[]; total: number}>;
  findById: (id: string) => Promise<UserWithPasswordDto | null>;
  findByEmail: (email: string) => Promise<UserWithPasswordDto | null>;
  create: (user: UserCreateRequest) => Promise<UserDto>;
  update: (id: string, user: UserUpdateRequest) => Promise<boolean>;
  delete: (id: string) => Promise<void>;
};

export type {UserRepositoryInterface};
