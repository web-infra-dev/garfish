import * as m2 from './m2.js';
import arr, { name } from './m2.js';

import('./m2.js').then((module) => {
  expect(module === m2).toBe(true);
  expect(module.default === arr).toBe(true);
  expect(module.name === name).toBe(true);
  expect(Object.keys(module).length).toBe(2);
});
