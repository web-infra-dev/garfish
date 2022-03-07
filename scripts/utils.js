const execa = require('execa');
const chalk = require('chalk');

const step = (msg) => {
  console.log(chalk.cyan(msg));
};

const run = async (bin, args, opts = {}) => {
  return await execa(bin, args, { stdio: 'inherit', ...opts });
};

module.exports = {
  run,
  step,
};
