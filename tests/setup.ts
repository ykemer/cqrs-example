// Setup that requires Jest globals (beforeAll/afterAll)
import {sequelize} from '@/shared/persistence/database';
import '@/shared/domain/models';
import {mediatR} from '@/shared/mediatr';

beforeAll(async () => {
  await sequelize.sync({force: true});
  // Mock publish to resolve by default, as notification handlers might not be loaded or necessary for integration tests
  jest.spyOn(mediatR, 'publish').mockResolvedValue(undefined);
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
