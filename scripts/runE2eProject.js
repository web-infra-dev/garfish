#!/usr/bin/env zx
const { $ } = require('zx');
const waitOn = require('wait-on');
const killPort = require('kill-port');
const { step } = require('./utils');
const portMap = require('../dev/config.json');

const ports = Object.keys(portMap).map((pkgPath) => portMap[pkgPath].port);

const opts = {
  // use get method to get resource，default method is head
  resources: ports.map((port) => `http-get://localhost:${port}`),
  log: true,
  // vite project need to accept headers
  headers: {
    accept: '*/*',
  },
  validateStatus(status) {
    return status >= 200 && status < 300; // default if not provided
  },
};

async function runAllExample() {
  console.time('runAllExample');

  try {
    if (process.env.CI) {
      step('\n clear ports...');
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
      step('\n clear ports...');
      await Promise.all(ports.map((port) => killPort(port)));

      step('\n building package...');
      await $`pnpm run build`;

      step('\n run dev project...');
      $`pnpm  run dev`;

      step('\n wait project start...');
      await waitOn(opts);

      step('\n start e2e test...');
    }
  } catch (err) {
    ports.forEach((port) => killPort(port));
    throw err;
  }
  console.timeEnd('runAllExample');
}

module.exports = {
  ports,
  runAllExample,
};
