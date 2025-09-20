module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/test/**',
    '!jest.config.js',
    '!coverage/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/test/**/*.test.js', '**/test/**/*.spec.js'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
};
