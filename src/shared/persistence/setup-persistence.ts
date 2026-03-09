import {Sequelize} from 'sequelize';

import {sequelize} from '@/shared';

export async function setupPersistence(): Promise<{sequelize: Sequelize}> {
  await sequelize.authenticate();
  return {sequelize};
}
