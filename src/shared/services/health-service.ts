import {Sequelize} from 'sequelize';

export type HealthServiceInterface = {
  checkDatabase(): Promise<boolean>;
};

export const createHealthService = (db: Sequelize): HealthServiceInterface => ({
  checkDatabase: async () => {
    try {
      await db.authenticate();
      return true;
    } catch {
      return false;
    }
  },
});
