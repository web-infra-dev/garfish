// m3.js 和 m4.js 用来测试循环引用
import { _name } from './m2.js';
import { _name as m2name } from './m2.js';
import * as m2 from './m2.js';
import * as _m2 from './m2.js?a=1';
import * as __m2 from './../circularReference/m2.js';

export const name = 'm1';
// 只要最终是一个文件就行，但是带 hash 就代表不是同一个资源了
expect(m2 === _m2).toBe(false);
expect(m2 === __m2).toBe(true);
expect(_name).toBe('m2');
expect(m2name).toBe('m2');
expect(m2._name).toBe('m2');
