import {
  noop,
  warn,
  error,
  hasOwn,
  isObject,
  rawObject,
  rawDocument,
  transformUrl,
} from '@garfish/utils';
import { Sandbox } from '../context';
import { __garfishGlobal__ } from '../symbolTypes';
import { FakeWindow, Hooks, SandboxOptions } from '../types';

export const hookNames: Array<keyof Hooks> = [
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

export function initContainer(opts: SandboxOptions) {
  const el = opts.el;
  if (typeof el === 'function') {
    opts.el = () => {
      const elm = el();
      return isObject(elm) ? elm : null;
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
      // prettier-ignore
      hooks[key] = key === 'onerror'
        ? error
        : noop as any;
    }
  }
  opts.hooks = hooks;
}

export function isModule(module: FakeWindow) {
  return isObject(module)
    ? // @ts-ignore
      module[__garfishGlobal__] !== undefined
    : false;
}

export function addFakeWindowType(
  module: FakeWindow,
  parentModule: FakeWindow,
) {
  if (!isModule(module)) {
    // @ts-ignore
    module[__garfishGlobal__] = parentModule;
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
  isWritable?: (PropertyKey) => boolean,
) {
  const fakeObject = {};
  const propertyMap = {};
  const storageBox = Object.create(null); // 存储改变后的值
  const propertyNames = rawObject.getOwnPropertyNames(target);

  const def = (p: string) => {
    const descriptor = rawObject.getOwnPropertyDescriptor(target, p);

    if (descriptor?.configurable) {
      const hasGetter = hasOwn(descriptor, 'get');
      const hasSetter = hasOwn(descriptor, 'set');
      const canWritable = typeof isWritable === 'function' && isWritable(p);

      if (hasGetter) {
        // prettier-ignore
        descriptor.get = () => hasOwn(storageBox, p)
          ? storageBox[p]
          : target[p];
      }

      if (hasSetter) {
        descriptor.set = (val) => {
          storageBox[p] = val;
          return true;
        };
      }

      // 更改为可写
      if (canWritable) {
        if (descriptor.writable === false) {
          descriptor.writable = true;
        } else if (hasGetter) {
          descriptor.set = (val) => {
            storageBox[p] = val;
            return true;
          };
        }
      }

      rawObject.defineProperty(fakeObject, p, rawObject.freeze(descriptor));
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

// 设置 document.currentScript 属性
// 由于暂时不支持 esm 模块的脚本，所以 import.meta 不需要做处理
export function setDocCurrentScript(
  sandbox: Sandbox,
  code: string,
  url?: string,
  async?: boolean,
) {
  const proxyDocument: Writeable<Document> = sandbox.context.document;
  if (!proxyDocument) return noop;
  const el = rawDocument.createElement('script');

  if (async) {
    el.setAttribute('async', 'true');
  }

  if (url) {
    el.setAttribute('src', url);
  } else if (code) {
    el.textContent = code;
  }

  const set = (val) => {
    try {
      proxyDocument.currentScript = val;
    } catch (e) {
      if (__DEV__) {
        warn(e);
      }
    }
  };

  set(el);
  return () => set(null);
}

export function isDataDescriptor(desc?: PropertyDescriptor) {
  if (desc === undefined) return false;
  return 'value' in desc || 'writable' in desc;
}

export function isAccessorDescriptor(desc?: PropertyDescriptor) {
  if (desc === undefined) return false;
  return 'get' in desc || 'set' in desc;
}

export function verifyDescriptor(target: any, p: PropertyKey, newValue: any) {
  const desc = Object.getOwnPropertyDescriptor(target, p);
  // https://tc39.es/ecma262/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
  if (desc !== undefined && desc.configurable === false) {
    if (isDataDescriptor(desc) && desc.writable === false) {
      // https://tc39.es/ecma262/#sec-object.is
      if (!Object.is(newValue, desc.value)) {
        if (__DEV__) {
          // prettier-ignore
          warn(`property "${String(p)}" is non-configurable and non-writable.`);
        }
        return 1;
      }
    } else if (isAccessorDescriptor(desc) && desc.get === undefined) {
      return 2;
    }
  }
  return 0;
}
