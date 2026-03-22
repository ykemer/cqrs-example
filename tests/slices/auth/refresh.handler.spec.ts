import {UpdateRefreshTokenCommandHandler} from '@/slices/auth/refresh/refresh';
import {UpdateRefreshTokenCommand} from '@/slices/auth/refresh/refresh';
import {BadRequestError} from '@/shared';
import {createUser} from '../../utils/db';
import {RefreshTokenBuilder} from '../../builders/refresh-token.builder';
import {container} from '@/shared/di/container';

describe('UpdateRefreshTokenCommandHandler', () => {
  describe('Edge cases', () => {
    it('should throw BadRequestError when refresh token does not exist', async () => {
      const handler = container.resolve(UpdateRefreshTokenCommandHandler);
      const cmd = new UpdateRefreshTokenCommand('invalid-token');

      await expect(handler.handle(cmd)).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError when refresh token is expired', async () => {
      const user = await createUser();
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24);

      const builder = new RefreshTokenBuilder(user.id);
      const token = await builder.build();
      // Manually set expiry to past date
      token.expiresAt = pastDate;
      await token.save();

      const handler = container.resolve(UpdateRefreshTokenCommandHandler);
      const cmd = new UpdateRefreshTokenCommand(token.token);

      await expect(handler.handle(cmd)).rejects.toThrow(BadRequestError);
    });
  });

  describe('Happy path', () => {
    it('should refresh token and return new token response', async () => {
      const user = await createUser();
      const builder = new RefreshTokenBuilder(user.id);
      const refreshToken = await builder.build();

      const handler = container.resolve(UpdateRefreshTokenCommandHandler);
      const cmd = new UpdateRefreshTokenCommand(refreshToken.token);

      const result = await handler.handle(cmd);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expires_in');
      expect(result.refreshToken).not.toBe(refreshToken.token);
    });
  });
});
