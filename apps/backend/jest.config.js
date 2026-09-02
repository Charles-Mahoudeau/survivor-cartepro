/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest/presets/default-esm',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { useESM: true }],
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  modulePathIgnorePatterns: ['dist', 'node_modules'],
  // Unit run only. Integration specs need the ephemeral container that
  // `jest.integration.config.js` starts, and would fail here with a connection
  // error that says nothing about the code.
  testPathIgnorePatterns: ['/node_modules/', '\\.integration\\.spec\\.ts$'],
};

module.exports = config;
