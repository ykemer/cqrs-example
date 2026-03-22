import {GetUserProfileQueryHandler} from '@/slices/users/profile/profile';
import {GetUserProfileQuery} from '@/slices/users/profile/profile';
import {NotFoundError} from '@/shared';
import {createUser} from '../../utils/db';
import {GUID1} from '../../utils/fake-guilds';

describe('GetUserProfileQueryHandler', () => {
  describe('Edge cases', () => {
    it('should throw NotFoundError when user does not exist', async () => {
      const handler = new GetUserProfileQueryHandler();
      const query = new GetUserProfileQuery(GUID1);

      await expect(handler.handle(query)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Happy path', () => {
    it('should return user profile DTO with all fields', async () => {
      const user = await createUser({email: 'profile@test.com', name: 'Profile User'});

      const handler = new GetUserProfileQueryHandler();
      const query = new GetUserProfileQuery(user.id);

      const result = await handler.handle(query);

      expect(result.id).toBe(user.id);
      expect(result.email).toBe('profile@test.com');
      expect(result.name).toBe('Profile User');
      expect(result).toHaveProperty('role');
    });
  });
});
