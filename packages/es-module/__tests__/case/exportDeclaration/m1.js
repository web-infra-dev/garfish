import dd, {
  name,
  a,
  b,
  c,
  d,
  aa,
  fn1,
  fn2,
  _fn3,
  cls,
  name1,
  bar,
  default as dd2,
} from './m2.js';

expect(name).toBe('m2');
expect(dd.length).toBe(1);
expect(dd[0]).toBe('default');
expect(dd2 === dd).toBe(true);
expect(a).toBe(1);
expect(b).toBe(2);
expect(c).toBe(3);
expect(d).toBe(4);
expect(aa).toBe(1);
expect(fn1()).toBe('fn1');
expect(fn2()).toBe('fn2');
expect(_fn3()).toBe('fn3');
expect(new cls().world()).toBe('cls.world');
expect(name1).toBe('n1');
expect(bar).toBe('n2');

setTimeout(() => {
  expect(a).toBe('aa');
});
