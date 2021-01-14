/* eslint-disable indent */
import {
  warn,
  assert,
  hasOwn,
  makeMap,
  rawWindow,
  rawObjectKeys,
} from '@garfish/utils';
import { documentOverride } from './modules/document';
import { XMLHttpRequestOverride } from './modules/xhr';
import { localStorageOverride } from './modules/storage';
import { listenerOverride } from './modules/eventListener';
import { timeoutOverride, intervalOverride } from './modules/timer';
import {
  Hooks,
  Module,
  FakeWindow,
  OverridesData,
  SandboxOptions,
} from './types';
import {
  bind,
  isModule,
  initHooks,
  isEsMethod,
  initContainer,
  addMoudleFlag,
  createFakeObject,
  parentModuleIndex,
} from './utils';

let sandboxId = 0;
const defaultModules: Record<string, Module> = {
  document: documentOverride,
  listener: listenerOverride,
  timeout: timeoutOverride,
  interval: intervalOverride,
  localStorage: localStorageOverride,
  XMLHttpRequest: __DEV__ ? XMLHttpRequestOverride : null,
};

export class Sandbox {
  public closed = true;
  public id = sandboxId++;
  public version = __VERSION__;
  public context?: FakeWindow;
  public options: SandboxOptions;
  public recovers: Array<() => void> = [];
  public globalStack: Array<FakeWindow> = [Sandbox.getGlobalObject()];
  public overrideContext: {
    recovers: Array<() => void>;
    overrides: Record<PropertyKey, any>;
    createds: Array<OverridesData['created']>;
  } = {
    overrides: {},
    recovers: [],
    createds: [],
  };

  private isProtectVariable: (p: PropertyKey) => boolean;
  private isInsulationVariable: (P: PropertyKey) => boolean;

  constructor(opts: SandboxOptions) {
    assert(opts && typeof opts === 'object', 'Miss options.');

    if (!opts.modules) opts.modules = {};
    if (!('useStrict' in opts)) opts.useStrict = true;
    if (!('proxyBody' in opts)) opts.proxyBody = true;
    if (!('openSandBox' in opts)) opts.openSandBox = true;

    initHooks(opts);
    initContainer(opts);
    this.isProtectVariable = makeMap(opts.protectVariable?.() || []);
    this.isInsulationVariable = makeMap(opts.insulationVariable?.() || []);

    this.options = opts;
    // new 一个沙箱的时候，默认启动
    this.start();
  }

  createContext() {
    assert(!this.closed, 'Sandbox is closed.');
    const fakeWindow = createFakeObject(rawWindow, this.isInsulationVariable);

    const baseHandlers = {
      get: (target: FakeWindow, p: PropertyKey) => {
        let value;
        const overrides = this.overrideContext.overrides;

        if (this.isProtectVariable(p)) {
          value = rawWindow[p];
        } else if (this.isInsulationVariable(p)) {
          value = target[p as any];
        } else {
          if (hasOwn(target, p)) {
            value = target[p as any];
          } else {
            value = rawWindow[p];
          }
        }

        if (
          isEsMethod(p) ||
          overrides[p as any] ||
          typeof value !== 'function'
        ) {
          return value;
        }
        return bind(value, rawWindow);
      },

      set: (target: FakeWindow, p: PropertyKey, value: unknown) => {
        if (this.isProtectVariable(p)) {
          rawWindow[p] = value;
        } else {
          target[p as any] = value;
        }
        return true;
      },

      deleteProperty: (target: FakeWindow, p: PropertyKey) => {
        if (hasOwn(target, p)) {
          delete target[p as any];
        } else if (__DEV__) {
          if (hasOwn(rawWindow, p) && this.isProtectVariable(p)) {
            warn(`The "${String(p)}" is global protect variable."`);
          }
        }
        return true;
      },
    };

    const parentHandlers = {
      ...baseHandlers,
      has: (target: FakeWindow, p: PropertyKey) => {
        return this.isProtectVariable(p) ? false : true;
      },
    };

    // 其实都是代理 window, 但是通过 has 能够解决 var xxx 的问题
    const proxy = new Proxy(fakeWindow, parentHandlers);
    const subProxy = new Proxy(fakeWindow, baseHandlers);

    proxy.self = subProxy;
    proxy.window = subProxy;
    proxy.globalThis = subProxy;
    proxy.unstable_sandbox = this;
    proxy.top = rawWindow.top === rawWindow ? subProxy : rawWindow.top;
    proxy.parent = rawWindow.parent === rawWindow ? subProxy : rawWindow.top;

    addMoudleFlag(proxy, rawWindow);

    this.globalStack.push(proxy);
    this.callHook('onCreateContext', [this]);

    return proxy;
  }

  // 获取所有重写的对象
  getOverrides() {
    assert(!this.closed, 'Sandbox is closed.');
    const overrides = {};
    const recovers = [];
    const createds = [];
    const { modules, openSandBox } = this.options;
    const needLoadModules = {
      ...(openSandBox ? defaultModules : {}),
      ...modules,
    };

    for (const key of rawObjectKeys(needLoadModules)) {
      const module = needLoadModules[key];
      if (typeof module === 'function') {
        const { recover, override, created } = module(this);
        if (recover) recovers.push(recover);
        if (created) createds.push(created);
        if (override) {
          for (const orkey in override) {
            // 这会覆盖已经存在的 override
            overrides[orkey] = override[orkey];
          }
        }
      }
    }
    return { recovers, createds, overrides };
  }

  execScript(code: string, sourceurl?: string, _?: boolean) {
    assert(!this.closed, 'Sandbox is closed');
    const { openSandBox } = this.options;
    const sourceURL = sourceurl ? `//@ sourceURL=${sourceurl}` : '';
    const refs = {
      code,
      context: this.context,
    };

    this.callHook('onInvokeBefore', [this, refs]);

    if (openSandBox) {
      new Function('window', `with(window) {${refs.code}\n}\n${sourceURL}`)(
        refs.context,
      );
    } else {
      const outerOverrides = this.overrideContext.overrides;
      const params = Object.keys(outerOverrides).join(',');

      new Function(
        'unstable_sandbox',
        `{${params}}`,
        `(function() {${refs.code}\n})();\n${sourceURL}`,
      )(this, outerOverrides);
    }

    this.callHook('onInvokeAfter', [this]);
  }

  callHook(hook: keyof Hooks, args: Array<any> = []) {
    const handlers = this.options.hooks![hook];
    if (handlers) {
      if (typeof handlers === 'function') {
        return [(handlers as any).apply(null, args as any)];
      } else if (Array.isArray(handlers)) {
        if (handlers.length === 0) {
          return false;
        }
        return (handlers as any).map((fn: Function) =>
          fn.apply(null, args),
        ) as Array<any>;
      }
    }
    return false;
  }

  clearEffects() {
    if (this.recovers && this.recovers.length > 0) {
      for (const fn of this.recovers) {
        if (typeof fn === 'function') {
          fn();
        }
      }
      this.recovers = [];
      this.callHook('onClearEffect', [this]);
    }
  }

  // start 实际上就重置 context
  start() {
    this.closed = false;
    this.callHook('onstart', [this]);
    this.context = this.createContext();
    this.overrideContext = this.getOverrides();
    this.recovers = this.overrideContext.recovers;

    // 覆盖全部的访问变量
    if (this.context) {
      const { createds, overrides } = this.overrideContext;
      if (overrides) {
        for (const key in overrides) {
          this.context[key] = overrides[key];
        }
      }
      if (createds) {
        createds.forEach((fn) => fn(this.context));
      }
    }
  }

  close() {
    if (!this.closed) {
      this.clearEffects();
      this.closed = true;
      this.globalStack.pop();
      (this.context as any) = null;
      this.callHook('onclose', [this]);
    }
  }

  // 调用 sandbox.reset 或 new Sandbox() 得到一份干净的沙箱系统
  reset() {
    this.close();
    this.start();
  }

  static getGlobalObject() {
    let module = window;
    while (isModule(module)) {
      module = (module as any)[parentModuleIndex];
    }
    return module;
  }

  static isBaseGlobal(module: Window) {
    return !isModule(module);
  }
}
