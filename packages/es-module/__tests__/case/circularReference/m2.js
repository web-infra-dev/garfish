import { name } from './m1.js';
import * as m1 from './m1.js';

export const _name = 'm2';

expect(() => name).toThrowError(/.?name.?/g);
expect(() => m1.name).toThrowError(/.?name.?/g);

setTimeout(() => {
  expect(name).toBe('m1');
  expect(m1.name).toBe('m1');
});
