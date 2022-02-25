import * as m2 from './m2.js';
import * as m3 from './m3.js';
import * as m5 from './m5.js';
import m2Default from './m2.js';
import { d } from './m2.js';

// 模块对象是不能扩展的
expect(() => {
  m2.toString = () => {};
}).toThrow();
// 模块对象的原型为 null
expect(Object.getPrototypeOf(m2)).toBe(null);

expect(m2.toString).toBeUndefined();
expect(m2[Symbol.toStringTag]).toBe('Module');

expect(d).toBe(1);
expect(m2Default).toEqual([3]);

expect(Object.keys(m2).length).toBe(10);
expect(m2._name).toBe('m2');
expect(m2.a).toEqual([1]);
expect(m2.b).toEqual([2]);
expect(m2.d).toBe(1);
expect(m2.default).toEqual([3]);
expect(m2.m3Namespace === m3).toBe(true);
expect(m2.n1).toBe('m3');
expect(m2.n2).toBe('m3');
expect(m2.name).toBe('m3');
expect(m2.nn).toBe('m3');

// export * 中有相同的字段，会被忽略，default 字段也会被忽略
expect('name' in m5).toBe(false);
expect('default' in m5).toBe(false);
