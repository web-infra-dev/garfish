'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/browser-snapshot.cjs.prod.js');
} else {
  module.exports = require('./dist/browser-snapshot.cjs.js');
}
