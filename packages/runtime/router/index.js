'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/router.cjs.prod.js');
} else {
  module.exports = require('./dist/router.cjs.js');
}
