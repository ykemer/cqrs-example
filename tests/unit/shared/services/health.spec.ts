describe('health service', () => {
  it('returns true when db.authenticate resolves', async () => {
    const mockDb: any = {authenticate: jest.fn().mockResolvedValue(undefined)};
    const {createHealthService} = require('../../../../src/shared/services/health-service');
    const s = createHealthService(mockDb);
    expect(await s.checkDatabase()).toBe(true);
  });

  it('returns false when db.authenticate throws', async () => {
    const mockDb: any = {authenticate: jest.fn().mockRejectedValue(new Error('nope'))};
    const {createHealthService} = require('../../../../src/shared/services/health-service');
    const s = createHealthService(mockDb);
    expect(await s.checkDatabase()).toBe(false);
  });
});
