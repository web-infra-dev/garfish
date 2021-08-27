'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/hooks.cjs.prod.js');
} else {
  module.exports = require('./dist/hooks.cjs.js');
}
