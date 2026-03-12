import {RefreshTokenModel} from '@/shared/domain/models/refresh-token';

describe('RefreshTokenModel', () => {
  it('isValid returns false when expiresAt in past (expired)', () => {
    const past = new Date(Date.now() - 1000);
    const r: any = RefreshTokenModel.build({id: 'r1', token: 't', userId: 'u1', expiresAt: past});
    expect(r.isValid()).toBe(false);
  });

  it('isValid returns true when expiresAt in future (not expired)', () => {
    const future = new Date(Date.now() + 1000 * 60);
    const r: any = RefreshTokenModel.build({id: 'r2', token: 't2', userId: 'u2', expiresAt: future});
    expect(r.isValid()).toBe(true);
  });
});
