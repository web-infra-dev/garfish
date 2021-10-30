// Start a server first, and then pass the jest test
const { run, step } = require('./utils');

function startMockServer() {
  const Koa = require('koa');
  const cors = require('@koa/cors');
  const route = require('koa-route');
  const app = new Koa();

  const cssCode = 'div { color: "#000" }';
  const htmlCode = `
    <!DOCTYPE html>
    <html>
      <link rel="stylesheet" href="./index.css">
      <script src="./index.js"></script>
    </html>
  `;
  const jsCode = `
    exports.provider = {
      render() {},
      destroy() {},
    };
  `;

  app
    .use(cors())
    .use(route.get('/get', (ctx) => (ctx.body = 'ok')))
    .use(route.get('/error', (ctx) => ctx.throw(400, 'error')))
    .use(route.get('/index.js', (ctx) => (ctx.body = jsCode)))
    .use(route.get('/index.css', (ctx) => (ctx.body = cssCode)))
    .use(route.get('/index.html', (ctx) => (ctx.body = htmlCode)))
    .listen(3333);
}

function startUnitTest() {
  const serverProcess = run(
    'node',
    ['./scripts/unit.js', '--startMockServer'],
    { detached: true },
  );
  const testProcess = run('jest', process.argv.slice(2, process.argv.length));
  process.on('SIGINT', () => serverProcess.kill());
  process.on('SIGHUP', () => serverProcess.kill());
  testProcess.on('close', () => serverProcess.kill());
}

if (process.argv.includes('--startMockServer')) {
  startMockServer();
} else {
  step('🔎 Unit testing...');
  startUnitTest();
}
