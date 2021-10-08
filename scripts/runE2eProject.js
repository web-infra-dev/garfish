const { $ } = require('zx');
const waitOn = require('wait-on');
const killPort = require('kill-port');
const { step } = require('./utils');

const portMap = {
  'cypress/project/main': {
    pkgName: '@garfish-cypress/main',
    port: 2333,
  },
  'cypress/project/react': {
    pkgName: '@garfish-cypress/react',
    port: 2444,
  },
  'cypress/project/vue-sub': {
    pkgName: '@garfish-cypress/vue-sub',
    port: 2555,
  },
  'cypress/project/vue': {
    pkgName: '@garfish-cypress/vue',
    port: 2666,
  },
  'cypress/project/vue2': {
    pkgName: '@garfish-cypress/vue2',
    port: 2777,
  },
};

const ports = Object.keys(portMap).map((pkgPath) => portMap[pkgPath].port);

const opts = {
  resources: ports.map((port) => `http://localhost:${port}`),
  validateStatus(status) {
    return status >= 200 && status < 300; // default if not provided
  },
};

function runAllExample() {
  // Usage with promises
  return (
    Promise.all(ports.map((port) => killPort(port)))
      // build all demo or dev all example
      .then(() => {
        if (process.env.CI) {
          step('\n building dev project...');
          return $`pnpm run build --parallel --filter "@garfish-cypress/*"`;
        } else {
          step('\n run dev project...');
          return $`npx cross-env TEST_ENV=true pnpm start --filter "@garfish-cypress/*" --parallel`;
        }
      })
      // http-server all demo
      .then(() => {
        if (process.env.CI) {
          step('\n http-server dev dist...');
          Object.keys(portMap).forEach((pkgPath) => {
            // historyapifallback
            if (pkgPath === 'dev/main') {
              $`pnpm --filter ${portMap[pkgPath].pkgName} exec -- http-server ./dist --cors -p ${portMap[pkgPath].port} --proxy http://localhost:${portMap['dev/main'].port}?`;
            } else {
              $`pnpm --filter ${portMap[pkgPath].pkgName} exec -- http-server ./dist --cors -p ${portMap[pkgPath].port}`;
            }
          });
        }
      })
      .then(() => waitOn(opts))
      .catch((err) => {
        console.error(err);
        ports.forEach((port) => killPort(port));
      })
  );
}

module.exports = {
  ports,
  runAllExample,
};
