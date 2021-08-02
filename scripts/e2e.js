const waitOn = require('wait-on');
const sh = require('shell-exec');
const { spawn, exec } = require('child_process');
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
    const spawnInstance = spawn('yarn', ['cy:open']);
    spawnInstance.stdout.on('data', function (msg) {
      console.log(msg.toString());
    });
  })
  .catch(function (err) {
    console.error(err);
  });
