import bcrypt from 'bcrypt';

import {PasswordServiceInterface} from '@/libs/tools/domain';

const passwordServiceCreator = (): PasswordServiceInterface => {
  return {
    encode: async (password: string) => {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    },
    compare: async (suppliedPassword: string, storedPassword: string) => {
      return await bcrypt.compare(suppliedPassword, storedPassword);
    },
  };
};

export {passwordServiceCreator};
