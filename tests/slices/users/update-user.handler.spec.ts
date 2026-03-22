import {UpdateUserCommandHandler} from '@/slices/users/update-user/update-user';
import {UpdateUserCommand} from '@/slices/users/update-user/update-user';
import {NotFoundError} from '@/shared';
import {createUser} from '../../utils/db';
import {GUID1} from '../../utils/fake-guilds';
import {container} from '@/shared/di/container';

describe('UpdateUserCommandHandler', () => {
  describe('Edge cases', () => {
    it('should throw NotFoundError when user does not exist', async () => {
      const handler = container.resolve(UpdateUserCommandHandler);
      const cmd = new UpdateUserCommand(GUID1, 'New Name', 'newpassword');

      await expect(handler.handle(cmd)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Happy path', () => {
    it('should update user and return void', async () => {
      const user = await createUser({email: 'update@test.com', name: 'Old Name'});

      const handler = container.resolve(UpdateUserCommandHandler);
      const cmd = new UpdateUserCommand(user.id, 'Updated Name', 'newpassword123');

      const result = await handler.handle(cmd);

      expect(result).toBeUndefined();
      // Verify persistence
      const updated = await user.reload();
      expect(updated.name).toBe('Updated Name');
    });
  });
});
