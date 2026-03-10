import {passwordServiceCreator} from '@/shared/services/password-service';
import {refreshTokenServiceCreator} from '@/shared/services/refresh-rokens-service';

describe('password and refresh token services', () => {
  it('password encode and compare', async () => {
    const s = passwordServiceCreator();
    const encoded = await s.encode('mypassword');
    expect(typeof encoded).toBe('string');
    const same = await s.compare('mypassword', encoded);
    expect(same).toBe(true);
    const notSame = await s.compare('wrong', encoded);
    expect(notSame).toBe(false);
  });

  it('refresh token generator returns expected shape', () => {
    const r = refreshTokenServiceCreator();
    const token = r.generateRefreshToken('user1');
    expect(token).toHaveProperty('id');
    expect(token.userId).toBe('user1');
    expect(token).toHaveProperty('token');
    expect(token).toHaveProperty('expiresAt');
  });
});
