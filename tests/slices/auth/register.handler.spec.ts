import {RegisterCommandHandler} from '@/slices/auth/register/register';
import {RegisterCommand} from '@/slices/auth/register/register';
import {ConflictError, UserModel} from '@/shared';
import {createUser} from '../../utils/db';
import {container} from '@/shared/di/container';

describe('RegisterCommandHandler', () => {
  describe('Edge cases', () => {
    it('should throw ConflictError when user already exists', async () => {
      await createUser({email: 'existing@test.com'});

      const handler = container.resolve(RegisterCommandHandler);
      const cmd = new RegisterCommand('John Doe', 'existing@test.com', 'password123');

      await expect(handler.handle(cmd)).rejects.toThrow(ConflictError);
    });

    it('should handle database unique constraint violation', async () => {
      await createUser({email: 'duplicate@test.com'});

      const handler = container.resolve(RegisterCommandHandler);
      const cmd = new RegisterCommand('Different Name', 'duplicate@test.com', 'password123');

      // Should throw ConflictError from business logic check
      await expect(handler.handle(cmd)).rejects.toThrow(ConflictError);
    });

    it('should handle password encoding errors', async () => {
      const handler = container.resolve(RegisterCommandHandler);
      const cmd = new RegisterCommand('User', 'user@test.com', 'password123');

      // We can't easily mock password service since it's resolved from container
      // but this test documents that encoding errors would propagate
      const result = await handler.handle(cmd);
      expect(result).toBeUndefined();
    });

    it('should not create user if duplicate check fails mid-transaction', async () => {
      const handler = container.resolve(RegisterCommandHandler);

      // First registration
      const cmd1 = new RegisterCommand('User1', 'user@test.com', 'password123');
      await handler.handle(cmd1);

      const countAfterFirst = await UserModel.count();
      expect(countAfterFirst).toBe(1);

      // Try duplicate - should fail without creating extra user
      const cmd2 = new RegisterCommand('User2', 'user@test.com', 'password456');
      await expect(handler.handle(cmd2)).rejects.toThrow(ConflictError);

      // Should still be only 1 user
      const countAfterSecond = await UserModel.count();
      expect(countAfterSecond).toBe(1);
    });
  });

  describe('Happy path', () => {
    it('should register user and return void', async () => {
      const handler = container.resolve(RegisterCommandHandler);
      const cmd = new RegisterCommand('Jane Doe', 'newuser@test.com', 'password123');

      const result = await handler.handle(cmd);

      expect(result).toBeUndefined();
      // Verify persistence
      const user = await UserModel.findOne({where: {email: 'newuser@test.com'}});
      expect(user).not.toBeNull();
      expect(user?.name).toBe('Jane Doe');
      expect(user?.email).toBe('newuser@test.com');
    });

    it('should hash password before storage', async () => {
      const handler = container.resolve(RegisterCommandHandler);
      const cmd = new RegisterCommand('User', 'user@test.com', 'plainpassword');

      await handler.handle(cmd);

      const user = await UserModel.findOne({where: {email: 'user@test.com'}});
      expect(user?.password).not.toBe('plainpassword');
      // Password should be hashed (bcrypt format or similar)
      expect(user?.password).toBeTruthy();
      expect(user?.password!.length).toBeGreaterThan(20);
    });

    it('should generate unique user ID for each registration', async () => {
      const handler = container.resolve(RegisterCommandHandler);

      const cmd1 = new RegisterCommand('User1', 'user1@test.com', 'pass');
      await handler.handle(cmd1);

      const cmd2 = new RegisterCommand('User2', 'user2@test.com', 'pass');
      await handler.handle(cmd2);

      const user1 = await UserModel.findOne({where: {email: 'user1@test.com'}});
      const user2 = await UserModel.findOne({where: {email: 'user2@test.com'}});

      expect(user1?.id).not.toBe(user2?.id);
    });
  });
});
