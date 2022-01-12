// Start a server first, and then pass the jest test
const { run, step } = require('./utils');

step('🔎 Unit testing...');

(async () => {
  try {
    await run('jest', process.argv.slice(2, process.argv.length));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
