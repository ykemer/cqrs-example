import {UserBuilder} from '../../../../../tests/builders/user.builder';
import {userRepositoryCreator} from './user-repository';

describe('UserRepository', () => {
  const repository = userRepositoryCreator();

  describe('findById', () => {
    it('should return user by id', async () => {
      const user = await new UserBuilder().build();
      const result = await repository.findById(user.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
    });

    it('should return null if user not found', async () => {
      const result = await repository.findById('00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const email = `find-${Math.random()}@example.com`;
      await new UserBuilder().withEmail(email).build();
      const result = await repository.findByEmail(email);
      expect(result).toBeDefined();
      expect(result?.email).toBe(email);
    });

    it('should return null if user with email not found', async () => {
      const result = await repository.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      await new UserBuilder().build();
      await new UserBuilder().build();
      const result = await repository.getUsers(10, 0);
      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      const email = `create-${Math.random()}@example.com`;
      const result = await repository.create({
        name: 'New User',
        email,
        password: 'password',
      });
      expect(result).toBeDefined();
      expect(result.email).toBe(email);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const user = await new UserBuilder().withName('Old Name').build();
      const success = await repository.update(user.id, {name: 'New Name'});
      expect(success).toBe(true);
      const updated = await repository.findById(user.id);
      expect(updated?.name).toBe('New Name');
    });

    it('should return false if update fails', async () => {
      const success = await repository.update('00000000-0000-0000-0000-000000000000', {name: 'New Name'});
      expect(success).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const user = await new UserBuilder().build();
      await repository.delete(user.id);
      const found = await repository.findById(user.id);
      expect(found).toBeNull();
    });
  });
});
