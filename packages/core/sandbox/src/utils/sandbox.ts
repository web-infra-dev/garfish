import { noop, error, hasOwn, rawObject, transformUrl } from '@garfish/utils';
import { Sandbox } from '../context';
import { FakeWindow, Hooks, SandboxOptions } from '../types';

const hookNames: Array<keyof Hooks> = [
  'onerror',
  'onclose',
  'onstart',
  'onAppendNode',
  'onClearEffect',
  'onInvokeAfter',
  'onInvokeBefore',
  'onCreateContext',
];

// 容器节点，因为时刻变化着，随用随取
export function rootElm(sandbox: Sandbox) {
  const container = sandbox && (sandbox.options.el as any);
  return container && (container() as Element);
}

// 用 Symbol.for 而不用 Symbol 的原因是有一个接口可以在外部使用，方便内部代码调试
// const parentWindow = window[Symbol.for('__garModule__')]
export const parentModuleIndex = Symbol.for('__garModule__');

export function initContainer(opts: SandboxOptions) {
  const el = opts.el;
  if (typeof el === 'function') {
    opts.el = () => {
      const elm = el();
      return typeof elm === 'object' ? elm : null;
    };
  } else if (typeof el === 'string') {
    opts.el = () => document.querySelector(el);
  } else {
    opts.el = () => null;
  }
}

export function initHooks(opts: SandboxOptions) {
  const hooks = opts.hooks || {};
  for (const key of hookNames) {
    if (!hooks[key]) {
      if (key === 'onerror') {
        hooks[key] = error;
      } else {
        hooks[key] = noop as any;
      }
    }
  }
  opts.hooks = hooks;
}

export function isModule(module: FakeWindow) {
  return !module || typeof module !== 'object'
    ? false
    : (module as any)[parentModuleIndex] !== undefined;
}

export function addMoudleFlag(module: FakeWindow, parentModule: FakeWindow) {
  if (!isModule(module)) {
    (module as any)[parentModuleIndex] = parentModule;
  }
  return module;
}

export function toResolveUrl(sandbox: Sandbox, url: string) {
  if (sandbox.options.baseUrl) {
    return transformUrl(sandbox.options.baseUrl, url);
  }
  return url;
}

// 主要是 copy 一份 window 和 document
export function createFakeObject(
  target: Record<PropertyKey, any>,
  filter?: (PropertyKey) => boolean,
) {
  const fakeObject = {};
  const propertyMap = {};
  const storageBox = Object.create(null); // 存储 set 的值
  const propertyNames = rawObject.getOwnPropertyNames(target);

  const def = (p: string) => {
    const desc = rawObject.getOwnPropertyDescriptor(target, p);

    if (desc?.configurable) {
      if (hasOwn(desc, 'get')) {
        desc.get = () => (p in storageBox ? storageBox[p] : target[p]);
      }
      if (hasOwn(desc, 'set')) {
        desc.set = (value) => (storageBox[p] = value);
      }
      rawObject.defineProperty(fakeObject, p, rawObject.freeze(desc));
    }
  };

  propertyNames.forEach((p) => {
    if (typeof filter === 'function') {
      !filter(p) && def(p);
    } else {
      def(p);
    }
    propertyMap[p] = true;
  });

  // 有可能是原型链上的属性
  for (const prop in target) {
    !propertyMap[prop] && def(prop);
  }

  return fakeObject as any;
}
