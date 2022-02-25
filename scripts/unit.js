// Start a server first, and then pass the jest test
const Koa = require('koa');
const path = require('path');
const serve = require('koa-static');
const destroyable = require('server-destroy');
const { run, step } = require('./utils');

step('🔎 Unit testing...');

(async () => {
  const app = new Koa();
  app.use(serve(path.resolve(__dirname, '../packages')));

  try {
    const server = app.listen(3310);
    destroyable(server);
    await run('jest', process.argv.slice(2, process.argv.length));
    server.destroy();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
