// Start a server first, and then pass the jest test
const { run, step } = require('./utils');

function startMockServer() {
  const port = 3333;
  const url = require('url');
  const http = require('http');

  const css = 'div { color: "#000" }';
  const html = `
    <!DOCTYPE html>
    <html>
      <link rel="stylesheet" href="./index.css">
      <div>Garfish</div>
      <script src="./index.js"></script>
    </html>
  `;
  const js = `
    exports.provider = {
      render() {},
      destroy() {},
    };
  `;

  http
    .createServer((req, res) => {
      let code = '';
      const { pathname } = url.parse(req.url || '');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');

      if (pathname.includes('error')) {
        res.statusCode = 400;
      } else {
        if (pathname.includes('index.html')) {
          code = html;
        } else if (pathname.includes('index.js')) {
          code = js;
        } else if (pathname.includes('index.css')) {
          code = css;
        }
      }
      res.end(code);
    })
    .listen(port);
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
