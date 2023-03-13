import {
  def,
  noop,
  warn,
  error,
  hasOwn,
  assert,
  remove,
  unique,
  makeMap,
  createKey,
  toBoolean,
  deepMerge,
  isAbsolute,
  isPrimitive,
} from '../src/utils';

describe('Garfish shared runtimeUtils', () => {
  it('noop', () => {
    expect(noop.length).toBe(0);
    expect(noop()).toBe(undefined);
  });

  it('warn', () => {
    let calledCount = 0;
    (warn as any)._oncalled = function (msg: string) {
      calledCount++;
      expect(msg.includes('[Garfish warning]: test warn')).toBe(true);
    };
    warn(false as any);
    warn('test warn');
    warn(new Error('test warn'));
    expect(calledCount).toBe(2);
    delete (warn as any)._oncalled;
  });

  it('error', () => {
    const errMath = /\[Garfish warning\]: test error/;
    expect(() => error(false as any)).not.toThrow();
    expect(() => error('test error')).toThrowError(errMath);
    expect(() => error(new Error('test error'))).toThrowError(errMath);
  });

  it('assert', () => {
    expect(() => assert(false)).toThrowError('unknow reason');
    expect(() => assert(true, 'test assert')).not.toThrow();
    expect(() => assert(false, 'test assert')).toThrowError(
      /\[Garfish warning\]: test assert/,
    );

    // throw error
    expect(() => {
      assert(false, 'false error');
    }).toThrowError(/false error/);

    expect(() => {
      assert(null, 'null error');
    }).toThrowError(/null error/);

    expect(() => {
      assert(undefined, 'undefined error');
    }).toThrowError(/undefined error/);

    expect(() => {
      assert('', 'string error');
    }).toThrowError(/string error/);

    expect(() => {
      assert(0, 'number error');
    }).toThrowError(/number error/);

    assert(true, 'true error');
    assert({}, 'object error');
    assert(1, 'number error');
    assert([], 'array error');
    assert('string', 'string error');
  });

  it('toBoolean', () => {
    expect(toBoolean('')).toBe(true);
    expect(toBoolean('false')).toBe(false);
    [0, 1, 'a', false, true, null, undefined, {}, () => {}].forEach((val) => {
      expect(toBoolean(val)).toBe(Boolean(val));
    });
  });

  it('createKey', () => {
    const record: Array<string> = [];
    for (let i = 0; i < 100; i++) {
      const v = createKey();
      expect(record.includes(v)).toBe(false);
      record.push(v);
    }
  });

  it('hasOwn', () => {
    const obj = Object.create(
      { b: 1 },
      {
        a: {
          value: 1,
        },
      },
    );
    expect('a' in obj).toBe(true);
    expect('b' in obj).toBe(true);
    expect(hasOwn(obj, 'a')).toBe(true);
    expect(hasOwn(obj, 'b')).toBe(false);
  });

  it('def', () => {
    const obj: { a?: number } = {};
    def(obj, 'a', 1);
    expect(obj.a).toBe(1);
    expect(() => (obj.a = 2)).toThrow();
  });

  it('makeMap', () => {
    const has = makeMap('a,b,c,d,e'.split(','));
    expect(typeof has === 'function').toBe(true);
    'a,b,c,d,e'.split(',').forEach((v) => expect(has(v)).toBe(true));
    'f,g,h,i,j'.split(',').forEach((v) => expect(has(v)).toBe(false));
  });

  it('remove', () => {
    const list = [1, 2, 3, 2];
    const set = new Set([1, 2, 3, 2]);
    remove(list, 2);
    remove(set, 2);
    expect(list).toEqual([1, 3, 2]);
    expect(set).toEqual(new Set([1, 3]));
  });

  it('unique', () => {
    const arr = [1, 2, 3, 4, 3, 2, 1];
    const newArr = unique(arr);
    expect(arr).toEqual([1, 2, 3, 4, 3, 2, 1]);
    expect(newArr.sort()).toEqual([1, 2, 3, 4]);
  });

  it('isPrimitive', () => {
    ['a', 0, 1, false, true, null, undefined, Symbol()].forEach((v) => {
      expect(isPrimitive(v)).toBe(true);
    });
    [{}, [], () => {}].forEach((v) => {
      expect(isPrimitive(v)).toBe(false);
    });
  });

  it('isAbsolute', () => {
    expect(isAbsolute('http://x.com/a.js')).toBe(true);
    expect(isAbsolute('http://x.com/a.js?x=1')).toBe(true);
    expect(isAbsolute('data:text/html;base64,YQ==')).toBe(true);
    expect(
      isAbsolute(
        'blob:https://garfishjs.org/832a2821-8580-4099-85c8-509bf48aee50',
      ),
    ).toBe(true);
    expect(isAbsolute('a.js')).toBe(false);
    expect(isAbsolute('/a.js')).toBe(false);
    expect(isAbsolute('./a.js')).toBe(false);
  });

  it('deepMerge', () => {
    expect(deepMerge.length).toBe(4);
    const s1 = Symbol();
    const s2 = Symbol();
    const one = {
      a: 1,
      b: {
        aa: 1,
        bb: 2,
        dd: [1, 2],
        ee: [1, 2, 1],
      },
      c: [1, 2],
      d: {},
      e: (_: any) => {},
      f: s1,
      g: 5,
      h: /garfish/,
    };
    const two = {
      a: 2,
      b: {
        aa: 2,
        cc: 3,
        dd: [2, 3],
      },
      c: [2, 3],
      d: 4,
      e: (_: any, __: any) => {},
      f: s2,
    };

    const clonedOne = deepMerge(one, {});
    const clonedTwo = deepMerge(two, {});
    const destObject = (dp?: boolean) => ({
      a: 2,
      b: {
        aa: 2,
        bb: 2,
        cc: 3,
        dd: dp ? [1, 2, 3] : [1, 2, 2, 3],
        ee: dp ? [1, 2] : [1, 2, 1],
      },
      c: dp ? [1, 2, 3] : [1, 2, 2, 3],
      d: 4,
      f: s2,
      g: 5,
      h: /garfish/,
    });

    const res1 = deepMerge(one, two);
    expect(res1.e.length).toBe(2);
    expect(res1).not.toEqual(one);
    expect(res1).not.toEqual(two);
    expect(res1).toMatchObject(destObject());
    expect(Object.prototype.toString.call(res1.h)).toBe('[object RegExp]');

    one.g = 6;
    one.b.dd.push(3);
    two.d = 6;
    two.b.dd.push(3);

    expect(res1).toMatchObject(destObject());
    expect(one).toMatchObject({
      b: {
        aa: 1,
        bb: 2,
        dd: [1, 2, 3],
      },
      g: 6,
    });
    expect(two).toMatchObject({
      b: {
        aa: 2,
        cc: 3,
        dd: [2, 3, 3],
      },
      d: 6,
    });

    const res2 = deepMerge(clonedOne, clonedTwo, true);
    expect(res2.e.length).toBe(2);
    expect(res2).toMatchObject(destObject(true));
    // The inversion results should be the same
    expect(deepMerge(one, {})).toMatchObject(one);
    expect(deepMerge({}, one)).toMatchObject(one);
    expect(deepMerge(two, {})).toMatchObject(two);
    expect(deepMerge({}, two)).toMatchObject(two);
  });

  it('deepMerge circular reference', () => {
    const a: any = {
      a1: {},
      b1: {
        aa: null,
      },
      c1: [],
      d1: {},
    };
    const b: any = {
      c1: [],
      d1: {},
      e1: {
        aa: null,
      },
    };

    a.a1 = a;
    a.b1.aa = a;
    a.c1.push(a);
    a.d1 = a;

    b.d1 = b;
    b.c1.push(b);
    b.e1.aa = b;

    const cfn = (a, b, dp = false) => {
      const cloned = deepMerge(a, b, dp);
      expect(cloned !== a).toBe(true);
      expect(cloned !== b).toBe(true);
      expect(Object.keys(cloned).length).toBe(5);
      expect(Object.keys(cloned.d1).length).toBe(5);
      expect(cloned.a1 === cloned).toBe(true);
      expect(cloned.b1.aa === cloned).toBe(true);
      expect(cloned.d1 === cloned).toBe(true);
      expect(cloned.e1.aa === cloned).toBe(true);
      if (dp) {
        expect(cloned.c1.length).toBe(1);
        expect(cloned.c1[0] === cloned).toBe(true);
      } else {
        expect(cloned.c1.length).toBe(2);
        expect(cloned.c1[0] === cloned).toBe(true);
        expect(cloned.c1[1] === cloned).toBe(true);
      }
      return cloned;
    };
    expect(cfn(a, b, true));
    expect(cfn(a, b) !== cfn(b, a)).toBe(true);
  });
});
