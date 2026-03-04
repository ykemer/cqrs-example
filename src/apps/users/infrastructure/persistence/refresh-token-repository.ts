import {
  RefreshTokenEntity,
  RefreshTokenRepositoryInterface,
} from '@/apps/users/domain/persistence/refresh-token-repository-interface';
import {RefreshTokenModel} from '@/libs/tools/domain/persistence/models/refresh-token';

const refreshTokenRepositoryCreator = (): RefreshTokenRepositoryInterface => {
  return {
    create: async (entity: RefreshTokenEntity) => {
      await RefreshTokenModel.create(
        {
          id: entity.id,
          userId: entity.userId,
          token: entity.token,
          expiresAt: entity.expiresAt,
          createdAt: entity.createdAt ?? new Date(),
        },
        {useMaster: true}
      );
    },

    findByToken: async (token: string) => {
      const rt = await RefreshTokenModel.findOne({where: {token}, useMaster: false});
      if (!rt) return null;
      return rt.toJSON();
    },

    delete: async (id: string) => {
      await RefreshTokenModel.destroy({
        where: {id},
      });
    },
  };
};

export {refreshTokenRepositoryCreator};
