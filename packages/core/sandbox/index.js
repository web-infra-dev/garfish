'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/sandbox.cjs.prod.js');
} else {
  module.exports = require('./dist/sandbox.cjs.js');
}
