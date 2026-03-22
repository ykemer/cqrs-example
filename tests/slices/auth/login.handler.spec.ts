import {LoginCommandHandler} from '@/slices/auth/login/login';
import {LoginCommand} from '@/slices/auth/login/login';
import {BadRequestError, UserModel, RefreshTokenModel} from '@/shared';
import {createUser} from '../../utils/db';
import {container} from '@/shared/di/container';

describe('LoginCommandHandler', () => {
  describe('Edge cases', () => {
    it('should throw BadRequestError when user does not exist', async () => {
      const handler = container.resolve(LoginCommandHandler);
      const cmd = new LoginCommand('nonexistent@test.com', 'password123');

      await expect(handler.handle(cmd)).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError when password is incorrect', async () => {
      await createUser({email: 'user@test.com', name: 'Test User'});

      const handler = container.resolve(LoginCommandHandler);
      const cmd = new LoginCommand('user@test.com', 'wrongpassword');

      await expect(handler.handle(cmd)).rejects.toThrow(BadRequestError);
    });

    it('should not expose whether user exists or password is wrong (security)', async () => {
      const handler = container.resolve(LoginCommandHandler);

      // Try nonexistent user
      const cmd1 = new LoginCommand('fake@test.com', 'password123');
      const err1 = await handler.handle(cmd1).catch(e => e);

      // Try wrong password for real user
      await createUser({email: 'real@test.com'});
      const cmd2 = new LoginCommand('real@test.com', 'wrongpass');
      const err2 = await handler.handle(cmd2).catch(e => e);

      // Both should throw same error with same message
      expect(err1.message).toBe('Invalid credentials');
      expect(err2.message).toBe('Invalid credentials');
    });

    it('should handle database errors during user lookup', async () => {
      const handler = container.resolve(LoginCommandHandler);
      const cmd = new LoginCommand('user@test.com', 'password123');

      const findSpy = jest.spyOn(UserModel, 'findOne').mockRejectedValueOnce(new Error('Database connection lost'));

      await expect(handler.handle(cmd)).rejects.toThrow('Database connection lost');

      findSpy.mockRestore();
    });

    it('should handle refresh token creation failure', async () => {
      const user = await createUser({email: 'user@test.com'});
      const handler = container.resolve(LoginCommandHandler);
      const cmd = new LoginCommand('user@test.com', 'password123');

      const createSpy = jest
        .spyOn(RefreshTokenModel, 'create')
        .mockRejectedValueOnce(new Error('Token storage failed'));

      await expect(handler.handle(cmd)).rejects.toThrow('Token storage failed');

      createSpy.mockRestore();
    });
  });

  describe('Happy path', () => {
    it('should authenticate user and return token response', async () => {
      await createUser({email: 'user@test.com', name: 'Test User'});

      const handler = container.resolve(LoginCommandHandler);
      const cmd = new LoginCommand('user@test.com', 'password123');

      const result = await handler.handle(cmd);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expires_in');
      expect(typeof result.access_token).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
      expect(typeof result.expires_in).toBe('number');
    });

    it('should generate unique refresh token per login attempt', async () => {
      await createUser({email: 'user@test.com'});
      const handler = container.resolve(LoginCommandHandler);

      const cmd1 = new LoginCommand('user@test.com', 'password123');
      const result1 = await handler.handle(cmd1);

      // Wait a tiny bit to ensure different timing
      await new Promise(resolve => setTimeout(resolve, 1));

      const cmd2 = new LoginCommand('user@test.com', 'password123');
      const result2 = await handler.handle(cmd2);

      // Refresh tokens must be unique for security
      expect(result1.refreshToken).not.toBe(result2.refreshToken);
      expect(result1.refreshToken).toBeTruthy();
      expect(result2.refreshToken).toBeTruthy();
    });

    it('should persist refresh token to database', async () => {
      const user = await createUser({email: 'user@test.com'});
      const handler = container.resolve(LoginCommandHandler);
      const cmd = new LoginCommand('user@test.com', 'password123');

      const result = await handler.handle(cmd);

      // Verify refresh token was persisted
      const token = await RefreshTokenModel.findOne({where: {token: result.refreshToken}});
      expect(token).not.toBeNull();
      expect(token?.userId).toBe(user.id);
    });
  });
});
