import { AsyncHook } from './asyncHook';

export { SyncHook } from './syncHook';
export { AsyncHook } from './asyncHook';
export { LoaderPlugin } from './loaderPlugin';

console.log(1111);

const e = new AsyncHook();

e.on(async (...args) => {
  console.log('on1', args);
});

e.once((...args) => {
  console.log('once1', args);
  return new Promise((resolve) => {
    setTimeout(() => resolve(false), 3000);
  });
});

e.on(async (...args) => {
  console.log('on2', args);
  return 'fffff';
});
(window as any).e = e;
