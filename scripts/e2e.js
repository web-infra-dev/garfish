#!/usr/bin/env zx
const { runAllExample, ports } = require('./utils/runExample.js');
const execa = require('execa');
const chalk = require('chalk');

const step = (msg) => {
  console.log(chalk.cyan(msg));
};

runAllExample().then(function () {
  // once here, all resources are available
  step('\n start e2e test...');
  const spawnInstance = execa('pnpm', [
    process.env.TEST_ENV_OPEN ? 'cy:open' : 'cy:run',
  ]);
  spawnInstance.stdout.on('data', function (msg) {
    console.log(chalk.cyan(msg.toString()));
  });
});
