module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@scalar/express-api-reference$': '<rootDir>/tests/mocks/express-api-reference.mock.js',
    '^@scalar/express-api-reference/(.*)$': '<rootDir>/tests/mocks/express-api-reference.mock.js',
    '^@/shared/utils$': '<rootDir>/src/shared/utils/utils.ts',
  },
  // setupFiles run before the test framework is installed - use for env + reflect metadata
  setupFiles: ['<rootDir>/tests/setupEnv.ts'],
  // setupFilesAfterEnv runs after test framework (Jest) is installed and provides globals like beforeAll
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // Ignore tests directory from coverage and node_modules/dist build artifacts
  coveragePathIgnorePatterns: [
    '<rootDir>/tests/',
    '<rootDir>/dist/',
    '<rootDir>/src/shared/mediator',
    '<rootDir>/src/shared/persistence',
    '<rootDir>/src/shared/swagger',
    '<rootDir>/src/shared/utils/ajv.ts',
    '<rootDir>/src/shared/services/jwt-service.ts',
    '<rootDir>/src/shared/services/log-service.ts',
  ],
  coverageThreshold: {
    './src/slices/courses/create-course/*': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
