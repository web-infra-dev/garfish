const { $ } = require('zx');
const waitOn = require('wait-on');
const killPort = require('kill-port');
const { step } = require('./utils');
const portMap = require('../dev/config.json');

const ports = Object.keys(portMap).map((pkgPath) => portMap[pkgPath].port);

const opts = {
  resources: ports.map((port) => `http://localhost:${port}`),
  validateStatus(status) {
    return status >= 200 && status < 300; // default if not provided
  },
};

async function runAllExample() {
  console.time('runAllExample');
  try {
    if (process.env.CI) {
      await Promise.all(ports.map((port) => killPort(port)));

      step('\n building dev project...');
      await $`pnpm --parallel --filter "@garfish-dev/*" build`;

      step('\n http-server dev dist...');
      Object.keys(portMap).forEach((pkgPath) => {
        // history api fallback
        if (pkgPath === 'dev/main') {
          $`pnpm --filter ${portMap[pkgPath].pkgName} exec -- http-server ./dist --cors -p ${portMap[pkgPath].port} --proxy http://localhost:${portMap[pkgPath].port}?`;
        } else {
          $`pnpm --filter ${portMap[pkgPath].pkgName} exec -- http-server ./dist --cors -p ${portMap[pkgPath].port}`;
        }
      });

      await waitOn(opts);
    } else {
      await Promise.all(ports.map((port) => killPort(port)));

      step('\n building package...');
      await $`pnpm run build`;

      step('\n run dev project...');
      $`npx cross-env TEST_ENV=false pnpm start --filter "@garfish-dev/*" --parallel`;

      await waitOn(opts);
    }
  } catch (err) {
    console.error(err);
    ports.forEach((port) => killPort(port));
  }
  console.timeEnd('runAllExample');
}

module.exports = {
  ports,
  runAllExample,
};
