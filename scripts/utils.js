const execa = require('execa');
const chalk = require('chalk');

const step = (msg) => {
  console.log(chalk.cyan(msg));
};

const run = (bin, args, opts = {}) => {
  return execa(bin, args, { stdio: 'inherit', ...opts });
};

module.exports = {
  run,
  step,
};
