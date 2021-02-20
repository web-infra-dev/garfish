import {
  warn,
  assert,
  hasOwn,
  makeMap,
  isObject,
  rawWindow,
  evalWithEnv,
  emitSandboxHook,
} from '@garfish/utils';
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
  verifyDescriptor,
  createFakeObject,
  addFakeWindowType,
  setDocCurrentScript,
} from './utils';
import { histroyOverride } from './modules/histroy';
import { documentOverride } from './modules/document';
import { XMLHttpRequestOverride } from './modules/xhr';
import { localStorageOverride } from './modules/storage';
import { listenerOverride } from './modules/eventListener';
import { timeoutOverride, intervalOverride } from './modules/timer';
import { __windowBind__, __garfishGlobal__ } from './symbolTypes';

let sandboxId = 0;
const defaultModules: Record<string, Module> = {
  history: histroyOverride,
  timeout: timeoutOverride,
  document: documentOverride,
  listener: listenerOverride,
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
  public overrideContext: {
    recovers: Array<() => void>;
    overrides: Record<PropertyKey, any>;
    createds: Array<OverridesData['created']>;
  } = {
    recovers: [],
    createds: [],
    overrides: {},
  };

  private isProtectVariable: (p: PropertyKey) => boolean;
  private isInsulationVariable: (P: PropertyKey) => boolean;

  constructor(opts: SandboxOptions) {
    assert(isObject(opts), 'Miss options.');

    if (!opts.modules) opts.modules = {};
    if (!('useStrict' in opts)) opts.useStrict = true;
    if (!('openSandBox' in opts)) opts.openSandbox = true;
    if (!('strictIsolation' in opts)) opts.strictIsolation = true;

    initHooks(opts);
    initContainer(opts);
    this.isProtectVariable = makeMap(opts.protectVariable?.() || []);
    this.isInsulationVariable = makeMap(opts.insulationVariable?.() || []);

    this.options = opts;
    this.start(); // 默认启动沙箱
  }

  callHook(name: keyof Hooks, args = []) {
    return emitSandboxHook(this.options.hooks, name, args);
  }

  createContext(moduleKeys?: Array<string>) {
    assert(!this.closed, 'Sandbox is closed.');
    const fakeWindow = createFakeObject(
      rawWindow,
      this.isInsulationVariable,
      makeMap(moduleKeys || []),
    );

    const baseHandlers = {
      get: (target: FakeWindow, p: PropertyKey, receiver: any) => {
        let value;
        const overrides = this.overrideContext.overrides;

        if (this.isProtectVariable(p)) {
          // receiver 不要传，否则会造成 this 指向不对
          value = Reflect.get(rawWindow, p);
        } else if (this.isInsulationVariable(p)) {
          value = Reflect.get(target, p, receiver);
        } else {
          value = hasOwn(target, p)
            ? Reflect.get(target, p, receiver)
            : Reflect.get(rawWindow, p);
        }

        if (
          isEsMethod(p) ||
          hasOwn(overrides, p) ||
          typeof value !== 'function'
        ) {
          return value;
        }

        // TODO: 即使不能很完美的解决，也应该缩小范围
        // `window.a = function b() {};`
        // `window.a === b; true;`
        const newValue = hasOwn(value, __windowBind__)
          ? value[__windowBind__]
          : bind(value, rawWindow);
        const verifyResult = verifyDescriptor(target, p, newValue);

        if (verifyResult > 0) {
          if (verifyResult === 1) return value;
          if (verifyResult === 2) return undefined;
        }

        value[__windowBind__] = newValue;
        return newValue;
      },

      set: (target: FakeWindow, p: PropertyKey, value: any, receiver?: any) => {
        return this.isProtectVariable(p)
          ? Reflect.set(rawWindow, p, value)
          : Reflect.set(target, p, value, receiver);
      },

      defineProperty: (
        target: FakeWindow,
        p: PropertyKey,
        descriptor: PropertyDescriptor,
      ) => {
        return this.isProtectVariable(p)
          ? Reflect.defineProperty(rawWindow, p, descriptor)
          : Reflect.defineProperty(target, p, descriptor);
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
      has: (_: FakeWindow, p: PropertyKey) => {
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

    // prettier-ignore
    proxy.top = rawWindow.top === rawWindow
      ? subProxy
      : rawWindow.top;

    // prettier-ignore
    proxy.parent = rawWindow.parent === rawWindow
      ? subProxy
      : rawWindow.top;

    addFakeWindowType(proxy, rawWindow);
    this.callHook('onCreateContext', [this]);

    return proxy;
  }

  // 获取所有重写的对象
  getOverrides() {
    assert(!this.closed, 'Sandbox is closed.');
    const overrides = {};
    const recovers = [];
    const createds = [];
    const { modules, openSandbox } = this.options;
    const needLoadModules = {
      ...(openSandbox ? defaultModules : {}),
      ...modules,
    };

    for (const key of Object.keys(needLoadModules)) {
      const module = needLoadModules[key];
      if (typeof module === 'function') {
        const { recover, override, created } = module(this);
        if (recover) recovers.push(recover);
        if (created) createds.push(created);
        if (override) {
          // 后面的会覆盖前面的变量
          for (const key in override) {
            overrides[key] = override[key];
          }
        }
      }
    }
    return { recovers, createds, overrides };
  }

  execScript(code: string, url = '', async?: boolean) {
    assert(!this.closed, 'Sandbox is closed');
    const context = this.context;
    const refs = { url, code, context };

    this.callHook('onInvokeBefore', [this, refs]);
    const revertCurrentScript = setDocCurrentScript(this, code, url, async);

    try {
      if (this.options.openSandbox) {
        evalWithEnv(`with(window) {${refs.code}\n}`, url, {
          window: refs.context,
        });
      } else {
        const outerOverrides = this.overrideContext.overrides;
        evalWithEnv(`with(window) {${refs.code}\n}`, url, {
          ...outerOverrides,
          window: refs.context,
          unstable_sandbox: this,
        });
      }
    } catch (e) {
      // 触发 window.onerror
      const source = url || this.options.baseUrl;
      const message = e instanceof Error ? e.message : String(e);

      if (typeof refs.context.onerror === 'function') {
        const fn =
          (refs.context.onerror as any)._native || refs.context.onerror;
        fn.call(window, message, source, null, null, e);
      }
      throw e;
    }

    revertCurrentScript();
    this.callHook('onInvokeAfter', [this, refs]);
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

  start() {
    this.closed = false;
    this.callHook('onstart', [this]);
    this.overrideContext = this.getOverrides();

    const { createds, overrides, recovers } = this.overrideContext;

    this.recovers = recovers;
    this.context = this.createContext(Object.keys(overrides));

    // 覆盖全部的访问变量
    if (this.context) {
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
      this.context = null;
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
      module = module[__garfishGlobal__];
    }
    return module;
  }

  static isBaseGlobal(module: Window) {
    return !isModule(module);
  }
}
