import {randomBytes, randomUUID} from 'crypto';

import {RefreshTokenServiceInterface} from '@/apps/users/domain/services';

export const refreshTokenServiceCreator = (): RefreshTokenServiceInterface => ({
  generateRefreshToken: (userId: string) => {
    const newToken = randomBytes(64).toString('hex');
    return {
      id: randomUUID(),
      userId,
      token: newToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // TODO: use env variable
      createdAt: new Date(),
    };
  },
});
