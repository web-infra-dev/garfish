const { run, step } = require('./utils');

(async () => {
  try {
    step('🔎 Unit testing...');

    await run('jest', process.argv.slice(2, process.argv.length));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
