// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  testTimeout: 20000,
  testEnvironment: 'jsdom',
  preset: 'jest-puppeteer',
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['__tests__', '/node_modules/'],
  coverageProvider: 'v8',
  globals: {
    __DEV__: true,
    __TEST__: true,
    __VERSION__: '"unknow"',
  },
  preset: 'ts-jest',
  transformIgnorePatterns: [
    // Change MODULE_NAME_HERE to your module that isn't being compiled
    '/node_modules/(?!(@garfish)).+\\.js$',
  ],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  rootDir: __dirname,
  testMatch: ['<rootDir>/packages/**/__tests__/**/*spec.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dev/'],
  moduleNameMapper: {
    '@garfish/(.*)': '<rootDir>packages/$1/src',
  },
};
