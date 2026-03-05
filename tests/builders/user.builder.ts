import {UserModel, UserRole} from '@/libs/tools/domain';

export class UserBuilder {
  private email = `test-${Math.random()}@example.com`;
  private name = 'Test User';
  private password = 'password123';
  private role = UserRole.user;

  withEmail(email: string) {
    this.email = email;
    return this;
  }

  withName(name: string) {
    this.name = name;
    return this;
  }

  withRole(role: UserRole) {
    this.role = role;
    return this;
  }

  async build() {
    return await UserModel.create({
      email: this.email,
      name: this.name,
      password: this.password,
      role: this.role,
    });
  }
}
