// 测试各种 export 和变量更改检测
export const name = 'm2';

export var a = 1;
export const b = 2;
export let c = 3,
  d = 4;

export function fn1() {
  return 'fn1';
}
export const fn2 = () => 'fn2';

export class cls {
  world() {
    return 'cls.world';
  }
}

function fn3() {
  return 'fn3';
}

export { a as aa, fn3 as _fn3 };

export default ['default'];

const obj = {
  name1: 'n1',
  name2: 'n2',
};

export const { name1, name2: bar } = obj;

setTimeout(() => {
  a = 'aa';
});
