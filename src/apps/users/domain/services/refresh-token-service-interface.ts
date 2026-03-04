import {RefreshTokenEntity} from '@/apps/users/domain/persistence/refresh-token-repository-interface';

export type RefreshTokenServiceInterface = {
  generateRefreshToken: (userId: string) => RefreshTokenEntity;
};
