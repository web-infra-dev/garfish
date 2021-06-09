'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/garfish.cjs.prod.js');
} else {
  module.exports = require('./dist/garfish.cjs.js');
}
