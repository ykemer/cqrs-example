import {
  getEnvironmentVariables,
  isNumber,
  isNumberString,
  isArray,
  isString,
  isObject,
  omit,
} from '@/shared/utils/utils';

describe('shared utils', () => {
  describe('getEnvironmentVariables', () => {
    const OLD = process.env;
    beforeEach(() => {
      process.env = {...OLD};
      process.env.TEST_VAR = 'value';
    });
    afterEach(() => {
      process.env = OLD;
    });

    it('returns values for keys', () => {
      const result = getEnvironmentVariables(['TEST_VAR']);
      expect(result).toEqual(['value']);
    });

    it('throws if a variable missing', () => {
      delete process.env.TEST_VAR;
      expect(() => getEnvironmentVariables(['TEST_VAR'])).toThrow(/Environment variable TEST_VAR not found/);
    });
  });

  it('type guards work', () => {
    expect(isNumber(5)).toBe(true);
    expect(isNumber('5')).toBe(false);

    expect(isNumberString('123')).toBe(true);
    expect(isNumberString('12a')).toBe(false);

    expect(isArray([1, 2, 3])).toBe(true);
    expect(isArray({})).toBe(false);

    expect(isString('abc')).toBe(true);
    expect(isString(1)).toBe(false);

    expect(isObject({a: 1})).toBe(true);
    expect(isObject(null)).toBe(false);
    expect(isObject([1, 2])).toBe(false);
  });

  it('omit removes keys from object', () => {
    const src = {a: 1, b: 2, c: 3};
    const res = omit(src, ['b']);
    expect((res as {a?: number; b?: number; c?: number}).a).toBe(1);
    expect((res as {a?: number; b?: number; c?: number}).b).toBeUndefined();
    expect((res as {a?: number; b?: number; c?: number}).c).toBe(3);
  });
});
