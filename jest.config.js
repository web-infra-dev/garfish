// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['__tests__', '/node_modules/'],
  coverageProvider: 'v8',
  globals: {
    __DEV__: true,
    __TEST__: true,
    __BROWSER__: false,
    __VERSION__: '"unknow"',
  },
  preset: 'ts-jest',
  transformIgnorePatterns: [
    // Change MODULE_NAME_HERE to your module that isn't being compiled
    '/node_modules/(?!(@garfish)).+\\.js$',
  ],
  transform: { '\\.js$': ['babel-jest'], '\\.ts$': 'ts-jest' },
  rootDir: __dirname,
  testMatch: ['<rootDir>/packages/runtime/**/__tests__/**/*spec.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dev/'],
  moduleNameMapper: {
    '@garfish/(.*)': '<rootDir>packages/runtime/$1/src',
  },
};
