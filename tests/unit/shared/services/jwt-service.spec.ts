import jwt from 'jsonwebtoken';

describe('jwt service', () => {
  const OLD = process.env;
  beforeEach(() => {
    process.env = {...OLD};
    process.env.JWT_SIGN_KEY = 'sign';
    process.env.JWT_KEY_ISSUER = 'iss';
    process.env.JWT_KEY_AUDIENCE = 'aud';
    process.env.JWT_EXPIRATION_TIME = '3600';
  });
  afterEach(() => {
    process.env = OLD;
    jest.restoreAllMocks();
  });

  it('creates signed token response with expires_in', () => {
    jest.isolateModules(() => {
      // Mock shared/utils to avoid pulling shared barrel and container initialization
      jest.mock('@/shared/utils', () => ({
        getEnvironmentVariables: (_: string[]) => ['sign', 'iss', 'aud', '3600'],
        isObject: (v: unknown) => typeof v === 'object' && v !== null && !Array.isArray(v),
        isString: (v: unknown) => typeof v === 'string',
      }));
      const {jwtServiceCreator} = require('../../../../src/shared/services/jwt-service');
      const svc = jwtServiceCreator();
      const payload: {id: string; email: string; role: string; name: string} = {
        id: '1',
        email: 'a@b',
        role: 'admin',
        name: 'n',
      };
      const res = svc.getSignedJwtTokenResponse(payload);
      expect(res).toHaveProperty('access_token');
      expect(res).toHaveProperty('expires_in', 3600);
    });
  });

  it('returns payload for valid token', () => {
    jest.isolateModules(() => {
      const {jwtServiceCreator} = require('../../../../src/shared/services/jwt-service');
      const svc = jwtServiceCreator();
      const token = jwt.sign({id: '1', email: 'a@b', role: 'admin', name: 'n'}, 'sign', {
        issuer: 'iss',
        audience: 'aud',
      });
      const payload = svc.getPayload(token);
      expect(payload).not.toBeNull();
      expect((payload as unknown as {id: string}).id).toBe('1');
    });
  });

  it('returns null for invalid token', () => {
    jest.isolateModules(() => {
      const {jwtServiceCreator} = require('../../../../src/shared/services/jwt-service');
      const svc = jwtServiceCreator();
      expect(svc.getPayload('badtoken')).toBeNull();
    });
  });
});
