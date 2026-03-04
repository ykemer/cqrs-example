import {Sequelize} from 'sequelize';

import '@/libs/tools/domain/persistence/models';

import {sequelize} from './config/database';

export async function setupPersistence(): Promise<{sequelize: Sequelize}> {
  await sequelize.authenticate();
  return {sequelize};
}
