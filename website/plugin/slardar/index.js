const path = require('path');

module.exports = function pluginSlardar(context, options) {
  return {
    name: 'plugin-slardar',
    getClientModules() {
      return [path.resolve(__dirname, 'initSlardar.js')];
    },
  };
};
