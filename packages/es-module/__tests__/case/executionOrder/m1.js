expect(globalThis.orderIndex).toBe(2);
globalThis.orderIndex++;

import './m2.js';

expect(globalThis.orderIndex).toBe(3);
globalThis.orderIndex++;

import './m3.js';

expect(globalThis.orderIndex).toBe(4);
globalThis.orderIndex++;
