import {sequelize} from '@/libs/tools/infrastructure/persistence/config/database';
import '@/libs/tools/domain/persistence/models';

beforeAll(async () => {
  await sequelize.sync({force: true});
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  // Clear all data between tests
  const models = Object.values(sequelize.models);
  for (const model of models) {
    await model.destroy({where: {}, truncate: true, cascade: true});
  }
});
