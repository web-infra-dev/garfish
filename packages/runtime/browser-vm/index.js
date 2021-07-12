'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/browser-vm.cjs.prod.js');
} else {
  module.exports = require('./dist/browser-vm.cjs.js');
}
