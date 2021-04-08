module.exports = {
  preset: 'jest-puppeteer',
  launch: {
    dumpio: true,
    headless: false,
    devtools: true,
  },
  browser: 'chromium',
  browserContext: 'default',
  testMatch: ['<rootDir>/packages/runtime/**/__tests__/**/*spec.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dev/'],
};
