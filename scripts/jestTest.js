// 先启动一个 server，再通过 jest 测试
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

      // prettier-ignore
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
  const chalk = require('chalk');
  const execa = require('execa');
  const childProcess = require('child_process');

  console.clear();
  console.log(chalk.blue.bold('🔎 Jest testing...'));
  const serverProcess = childProcess.spawn(
    'node',
    ['./scripts/jestTest.js', '--startMockServer'],
    {
      stdio: 'ignore',
      detached: true,
    },
  );

  const testProcess = execa('jest', argv.slice(2, argv.length), {
    stdio: 'inherit',
  });

  process.on('SIGINT', () => serverProcess.kill());
  process.on('SIGHUP', () => serverProcess.kill());
  testProcess.on('close', () => serverProcess.kill());
}
