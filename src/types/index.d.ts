import {UserDto} from '@/libs/dto/domain';

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserDto;
      traceId: string;
    }
  }
}

// Sequelize's CreateOptions does not extend Poolable, so `useMaster` is missing.
// Augment it here so write operations can explicitly target the master node.
declare module 'sequelize' {
  interface CreateOptions<TAttributes = any> {
    useMaster?: boolean;
  }
}
