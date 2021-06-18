import { hasOwn, isObject, transformUrl } from '@garfish/utils';
import { Sandbox } from '../sandbox';
import { __garfishGlobal__ } from '../symbolTypes';

// Container node, because it changes all the time, take it as you use it
export function rootElm(sandbox: Sandbox) {
  const container = sandbox && (sandbox.options.el as any);
  return container && (container() as Element);
}

export function isModule(module: Window) {
  return isObject(module)
    ? // @ts-ignore
      module[__garfishGlobal__] !== undefined
    : false;
}

export function addProxyWindowType(module: Window, parentModule: Window) {
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

// Copy "window" and "document"
export function createFakeObject(
  target: Record<PropertyKey, any>,
  filter?: (PropertyKey) => boolean,
  isWritable?: (PropertyKey) => boolean,
) {
  const fakeObject = {};
  const propertyMap = {};
  const storageBox = Object.create(null); // Store changed value
  const propertyNames = Object.getOwnPropertyNames(target);
  const def = (p: string) => {
    const descriptor = Object.getOwnPropertyDescriptor(target, p);

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
      Object.defineProperty(fakeObject, p, Object.freeze(descriptor));
    }
  };
  propertyNames.forEach((p) => {
    propertyMap[p] = true;
    typeof filter === 'function' ? !filter(p) && def(p) : def(p);
  });
  // "prop" maybe in prototype chain
  for (const prop in target) {
    !propertyMap[prop] && def(prop);
  }
  return fakeObject as any;
}
