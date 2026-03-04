import {UserRepositoryInterface} from '@/apps/users/domain/persistence/user-repository-interface';
import {UserModel} from '@/libs/dto/domain';

const userRepositoryCreator = (): UserRepositoryInterface => {
  return {
    getUsers: async (take, skip) => {
      const {rows, count} = await UserModel.findAndCountAll({
        limit: take,
        offset: skip,
        order: [['createdAt', 'DESC']],
        useMaster: false, // slave — read replica
      });

      return {
        data: rows.map(user => user.toUserDto()),
        total: count,
      };
    },

    findById: async (id: string) => {
      const user = await UserModel.findOne({
        where: {id},
        useMaster: false, // slave — read replica
      });

      if (!user) return null;
      return user.toUserWithPasswordDto();
    },

    findByEmail: async (email: string) => {
      const user = await UserModel.findOne({
        where: {email},
        useMaster: false,
      });

      if (!user) return null;
      return user.toUserWithPasswordDto();
    },

    create: async user => {
      const newUser = await UserModel.create(
        {
          name: user.name,
          email: user.email,
          password: user.password,
        },
        {useMaster: true}
      );

      return newUser.toUserDto();
    },

    update: async (id, updates) => {
      const [result] = await UserModel.update(updates, {
        where: {id},
      });
      return result > 0;
    },

    delete: async (id: string) => {
      await UserModel.destroy({
        where: {id},
      });
    },
  };
};

export {userRepositoryCreator};
