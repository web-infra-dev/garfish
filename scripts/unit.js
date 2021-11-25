// Start a server first, and then pass the jest test
const { run, step } = require('./utils');

step('🔎 Unit testing...');
run('jest', process.argv.slice(2, process.argv.length));
