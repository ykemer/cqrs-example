import {Sequelize} from 'sequelize';

import {HealthServiceInterface} from '@/libs/tools/domain';

const createHealthService = (db: Sequelize): HealthServiceInterface => ({
  checkDatabase: async () => {
    try {
      await db.authenticate();
      return true;
    } catch {
      return false;
    }
  },
});

export {createHealthService};
