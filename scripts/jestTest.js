// Start a server first, and then pass the jest test
const argv = process.argv;

if (argv.includes('--startMockServer')) {
  const port = 3333;
  const url = require('url');
  const http = require('http');

  const indexHtml = `
    <!DOCTYPE html>
    <html>
      <link rel="stylesheet" href="./index.css">
      <div>Garfish</div>
      <script src="./index.js"></script>
    </html>
  `;

  const indexCss = 'div { color: "#000" }';

  const indexJs = `
    exports.provider = () => ({
      render() {},
      destroy() {},
    });
  `;

  http
    .createServer((req, res) => {
      const { pathname } = url.parse(req.url || '');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');

      if (pathname.includes('error')) {
        res.statusCode = 400;
        res.end('');
        return;
      }

      const resource = pathname.includes('index.html')
        ? indexHtml
        : pathname.includes('index.js')
        ? indexJs
        : pathname.includes('index.css')
        ? indexCss
        : '';

      res.end(resource);
    })
    .listen(port);
} else {
  const { run, step } = require('./utils');
  const childProcess = require('child_process');

  console.clear();
  step('🔎 Jest testing...');

  const serverProcess = childProcess.spawn(
    'node',
    ['./scripts/jestTest.js', '--startMockServer'],
    {
      stdio: 'ignore',
      detached: true,
    },
  );
  const testProcess = run('jest', argv.slice(2, argv.length));

  process.on('SIGINT', () => serverProcess.kill());
  process.on('SIGHUP', () => serverProcess.kill());
  testProcess.on('close', () => serverProcess.kill());
}
