type RefreshTokenEntity = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  revoked?: boolean;
  createdAt?: Date;
  revokedAt?: Date | null;
};

type RefreshTokenRepositoryInterface = {
  create: (entity: RefreshTokenEntity) => Promise<void>;
  findByToken: (token: string) => Promise<any | null>;
  delete: (id: string) => Promise<void>;
};

export type {RefreshTokenEntity, RefreshTokenRepositoryInterface};
