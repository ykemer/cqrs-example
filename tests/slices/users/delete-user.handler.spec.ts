import {DeleteUserCommandHandler} from '@/slices/users/delete-user/delete-user';
import {DeleteUserCommand} from '@/slices/users/delete-user/delete-user';
import {NotFoundError, UserModel} from '@/shared';
import {createUser} from '../../utils/db';
import {GUID1} from '../../utils/fake-guilds';

describe('DeleteUserCommandHandler', () => {
  describe('Edge cases', () => {
    it('should throw NotFoundError when user does not exist', async () => {
      const handler = new DeleteUserCommandHandler();
      const cmd = new DeleteUserCommand(GUID1);

      await expect(handler.handle(cmd)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Happy path', () => {
    it('should delete user and return void', async () => {
      const user = await createUser({email: 'delete@test.com'});

      const handler = new DeleteUserCommandHandler();
      const cmd = new DeleteUserCommand(user.id);

      const result = await handler.handle(cmd);

      expect(result).toBeUndefined();
      // Verify deletion
      const deleted = await UserModel.findByPk(user.id);
      expect(deleted).toBeNull();
    });
  });
});
