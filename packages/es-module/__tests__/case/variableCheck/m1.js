import * as m2 from './m2.js';
import { name } from './m2.js';

let a = name;
expect(a).toEqual(['m2']);

expect(() => (name = 2)).toThrow();

const b = m2;
expect(b[Symbol.toStringTag]).toBe('Module');

const c = m2.name;
expect(c).toEqual(['m2']);
expect(c === name).toBe(true);

const d = {
  [name[0]]: 1,
};
expect(d[name[0]]).toBe(1);
expect(Object.keys(d)[0]).toEqual('m2');

const { e, f, g = name, ...rest } = { e: 10, f: 20, c: name, d: 40 };
expect(g === rest.c).toBe(true);
expect(rest.c === name).toBe(true);

expect(`chentao.${name[0]}`).toBe('chentao.m2');
expect(`chentao.${m2.name[0]}`).toBe('chentao.m2');

function fn1() {
  expect(name).toEqual(['m2']);
  expect(() => (name = 2)).toThrow();

  (() => {
    ((m2) => {
      expect(m2).toBeUndefined();
      expect(name).toEqual(['m2']);
    })();
  })();

  const three = () => {
    return class {
      constructor() {
        this.name = name;
      }
      check() {
        expect(this.name === name).toBe(true);
      }
    };
  };

  return function () {
    let name = 2;
    expect(() => (name = 3)).not.toThrow();
    expect(name).toBe(3);

    const one = () => {
      const name = m2;
      expect(m2[Symbol.toStringTag]).toBe('Module');
      expect(name[Symbol.toStringTag]).toBe('Module');
      return name;
    };
    const two = () => {
      expect(m2[Symbol.toStringTag]).toBe('Module');
      expect(name).toBe(3);
    };
    return [one, two, three];
  };
}
const [one, two, three] = fn1()();
expect(one() === m2).toBe(true);
two();
const cls = new (three())();
expect(cls.name).toEqual(['m2']);
cls.check();

function fn2(
  name,
  b = () => {
    expect(name).toBe('chen');
    return name;
  },
) {
  expect(b()).toBe(name);
  expect(m2.name).toEqual(['m2']);
}
fn2('chen');

function fn3() {
  const r = name + 1;
  const name = '2';
  return r;
}
expect(fn3).toThrow();

function fn4() {
  const { a: m2 = name } = {};
  expect(m2 === name).toBe(true);
  (() => {
    const {
      a: {
        b: {
          c: [name],
        },
      },
    } = {
      a: {
        b: {
          c: [1],
        },
      },
    };
    expect(name).toBe(1);
  })();
}
fn4();

try {
  throw 1;
} catch (name) {
  expect(name).toBe(1);
}

try {
  throw 1;
} catch {
  expect(name).toEqual(['m2']);
}

for (let { name = 1 } of [{}]) {
  expect(name).toBe(1);
  name = 2;
  expect(name).toBe(2);
}

expect(name).toEqual(['m2']);
