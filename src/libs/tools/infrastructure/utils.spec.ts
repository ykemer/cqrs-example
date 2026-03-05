import {getEnvironmentVariables} from './utils';

describe('utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {...originalEnv};
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return environment variables', () => {
    process.env.TEST_VAR = 'test_value';
    const [val] = getEnvironmentVariables(['TEST_VAR']);
    expect(val).toBe('test_value');
  });

  it('should throw error if environment variable is missing', () => {
    delete process.env.MISSING_VAR;
    expect(() => getEnvironmentVariables(['MISSING_VAR'])).toThrow('Environment variable MISSING_VAR not found');
  });
});
