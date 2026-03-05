import {RefreshTokenBuilder} from '../../../../../tests/builders/refresh-token.builder';
import {UserBuilder} from '../../../../../tests/builders/user.builder';
import {refreshTokenRepositoryCreator} from './refresh-token-repository';

describe('RefreshTokenRepository', () => {
  const repository = refreshTokenRepositoryCreator();

  describe('create', () => {
    it('should create a refresh token', async () => {
      const user = await new UserBuilder().build();
      const expiresAt = new Date(Date.now() + 1000 * 60);
      const payload = {
        id: `id-${Math.random()}`,
        userId: user.id,
        token: `token-${Math.random()}`,
        expiresAt,
        createdAt: new Date(),
      };

      await repository.create(payload);
      const found = await repository.findByToken(payload.token);
      expect(found).toBeDefined();
      expect(found?.userId).toBe(user.id);
    });
  });

  describe('findByToken', () => {
    it('should find token by token string', async () => {
      const user = await new UserBuilder().build();
      await new RefreshTokenBuilder(user.id).withToken('find-me').build();
      const result = await repository.findByToken('find-me');
      expect(result).toBeDefined();
      expect(result?.token).toBe('find-me');
    });

    it('should return null if token not found', async () => {
      const result = await repository.findByToken('not-found');
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a refresh token', async () => {
      const user = await new UserBuilder().build();
      const token = await new RefreshTokenBuilder(user.id).build();
      await repository.delete(token.id);
      const result = await repository.findByToken(token.token);
      expect(result).toBeNull();
    });
  });
});
