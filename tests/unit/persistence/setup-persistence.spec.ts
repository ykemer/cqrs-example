describe('setup-persistence', () => {
  it('calls sequelize.authenticate and returns sequelize', async () => {
    const fakeSequelize: any = {authenticate: jest.fn().mockResolvedValue(undefined)};
    jest.isolateModules(() => {
      jest.mock('@/shared', () => ({sequelize: fakeSequelize}));
      const {setupPersistence} = require('../../../src/shared/persistence/setup-persistence');
      const res = setupPersistence();
      return expect(res).resolves.toEqual({sequelize: fakeSequelize});
    });
  });
});
