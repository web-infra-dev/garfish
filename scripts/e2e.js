const execa = require('execa');
const waitOn = require('wait-on');
const killPort = require('kill-port');

const ports = [2333, 2444, 2555, 2666, 2777];

const opts = {
  resources: ports.map((port) => `http://localhost:${port}`),
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default if not provided
  },
};

// Usage with promises
Promise.all(ports.map((port) => killPort(port)))
  .then(() => waitOn(opts))
  .then(function () {
    // once here, all resources are available
    const spawnInstance = execa('yarn', [
      process.env.TEST_ENV_OPEN ? 'cy:open' : 'cy:run',
    ]);
    spawnInstance.stdout.on('data', function (msg) {
      console.log(msg.toString());
    });
  })
  .catch(function (err) {
    console.error(err);
    ports.forEach((port) => killPort(port));
  });
