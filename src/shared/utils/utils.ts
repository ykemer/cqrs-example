const getEnvironmentVariables = (keys: string[]): string[] => {
  const output: string[] = [];
  for (const key of keys) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} not found`);
    }
    output.push(value);
  }

  return output;
};

const isNumber = (value: unknown): value is number => typeof value === 'number';

const isNumberString = (value: unknown): value is string => typeof value === 'string' && /^\d+$/.test(value);

const isArray = (value: unknown): value is Array<unknown> => Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const omit = <ObjectType extends Record<string, unknown>, KeyType extends (keyof ObjectType)[]>(
  source: ObjectType,
  excludedKeys: KeyType
): Omit<ObjectType, KeyType[number]> =>
  Object.fromEntries(Object.entries(source).filter(([key]) => !excludedKeys.includes(key))) as Omit<
    ObjectType,
    KeyType[number]
  >;

export {getEnvironmentVariables, isArray, isNumber, isNumberString, isObject, isString, omit};
