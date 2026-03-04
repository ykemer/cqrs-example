type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

type UserCreateRequest = Omit<User, 'id'>;
type UserUpdateRequest = Partial<UserCreateRequest>;

export type {User, UserCreateRequest, UserUpdateRequest};
