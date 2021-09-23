const { runAllExample, ports } = require('./utils/runExample.js');
const execa = require('execa');
const chalk = require('chalk');

runAllExample().then(function () {
  // once here, all resources are available
  const spawnInstance = execa('yarn', [
    process.env.TEST_ENV_OPEN ? 'cy:open' : 'cy:run',
  ]);
  spawnInstance.stdout.on('data', function (msg) {
    console.log(chalk.cyan(msg.toString()));
  });
});
