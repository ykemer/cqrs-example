import {ListUsersCommandHandler} from '@/slices/users/list-users/list-users';
import {ListUsersQuery} from '@/slices/users/list-users/list-users';
import {createUser} from '../../utils/db';

describe('ListUsersCommandHandler', () => {
  describe('Happy path', () => {
    it('should return all users paginated', async () => {
      const u1 = await createUser({email: 'user1@test.com'});
      const u2 = await createUser({email: 'user2@test.com'});

      const handler = new ListUsersCommandHandler();
      const query = new ListUsersQuery(1, 10);

      const result = await handler.handle(query);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.data.some(u => u.id === u1.id)).toBe(true);
      expect(result.data.some(u => u.id === u2.id)).toBe(true);
    });

    it('should respect pagination limits', async () => {
      await createUser({email: 'user1@test.com'});
      await createUser({email: 'user2@test.com'});
      await createUser({email: 'user3@test.com'});

      const handler = new ListUsersCommandHandler();
      const query = new ListUsersQuery(1, 2);

      const result = await handler.handle(query);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(2);
    });

    it('should paginate to second page correctly', async () => {
      const u1 = await createUser({email: 'user1@test.com'});
      const u2 = await createUser({email: 'user2@test.com'});
      const u3 = await createUser({email: 'user3@test.com'});

      const handler = new ListUsersCommandHandler();
      const query = new ListUsersQuery(2, 2);

      const result = await handler.handle(query);

      expect(result.data).toHaveLength(1);
      expect(result.page).toBe(2);
    });
  });
});
