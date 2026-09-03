const base = require('./jest.config');

/**
 * Integration tests: a real database, a real Nest application, no mocks.
 *
 * @type {import('jest').Config}
 */
module.exports = {
  ...base,
  testRegex: '.*\\.integration\\.spec\\.ts$',
  testPathIgnorePatterns: ['/node_modules/'],
  // Serial. Isolation is a TRUNCATE between tests, so two workers sharing the
  // one container would empty each other's fixtures mid-assertion — and the
  // failure would land in whichever spec happened to be slower, not in the one
  // at fault. One worker is also what makes the rate limit counter, which is
  // keyed by address and shared by the whole suite, behave predictably.
  maxWorkers: 1,
  // Booting a Nest application per suite and applying migrations is well past
  // the 5 s default.
  testTimeout: 60000,
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/test/setup-integration.ts'],
};
