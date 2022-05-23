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

function runAllExample() {
  // Usage with promises
  if (process.env.CI) {
    return Promise.all(ports.map((port) => killPort(port)))
      .then(() => {
        step('\n building dev project...');
        return $`pnpm build --parallel --filter "@garfish-dev/*" --filter "@garfish/*"`;
      })
      .then(() => {
        step('\n http-server dev dist...');
        Object.keys(portMap).forEach((pkgPath) => {
          // history api fallback
          if (pkgPath === 'dev/main') {
            $`pnpm --filter ${portMap[pkgPath].pkgName} exec -- http-server ./dist --cors -p ${portMap[pkgPath].port} --proxy http://localhost:${portMap[pkgPath].port}?`;
          } else {
            $`pnpm --filter ${portMap[pkgPath].pkgName} exec -- http-server ./dist --cors -p ${portMap[pkgPath].port}`;
          }
        });
      })
      .then(() => waitOn(opts))
      .catch((err) => {
        console.error(err);
        ports.forEach((port) => killPort(port));
      });
  } else {
    return (
      Promise.all(ports.map((port) => killPort(port)))
        // build all demo or dev all example
        .then(() => {
          step('\n run dev project...');
          $`npx cross-env TEST_ENV=false pnpm start --filter "@garfish-dev/*" --parallel`;
        })
        .then(() => waitOn(opts))
        .catch((err) => {
          console.error(err);
          ports.forEach((port) => killPort(port));
        })
    );
  }
}

module.exports = {
  ports,
  runAllExample,
};
