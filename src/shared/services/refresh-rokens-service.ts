import {randomBytes, randomUUID} from 'crypto';

type RefreshTokenEntity = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  revoked?: boolean;
  createdAt?: Date;
  revokedAt?: Date | null;
};

export type RefreshTokenServiceInterface = {
  generateRefreshToken: (userId: string) => RefreshTokenEntity;
};

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
