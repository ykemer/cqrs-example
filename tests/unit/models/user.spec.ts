import {UserModel, UserRole} from '@/shared/domain/models/user';

describe('UserModel', () => {
  it('toUserDto map fields', () => {
    const u: any = UserModel.build({id: 'u1', name: 'Name', email: 'a@b', password: 'p', role: UserRole.admin});

    const dto = u.toUserDto();
    expect(dto).toMatchObject({id: 'u1', name: 'Name', email: 'a@b', role: UserRole.admin});
  });
});
