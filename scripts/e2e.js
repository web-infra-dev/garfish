const { run, step } = require('./utils');
const { runAllExample } = require('./runExample');

runAllExample().then(() => {
  // once here, all resources are available
  step('\n start e2e test...');
  const spawnInstance = run('pnpm', [
    process.env.TEST_ENV_OPEN ? 'cy:open' : 'cy:run',
  ]);
  spawnInstance.stdout.on('data', (msg) => step(msg.toString()));
});
