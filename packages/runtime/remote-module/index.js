'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/remote-module.cjs.prod.js');
} else {
  module.exports = require('./dist/remote-module.cjs.js');
}
