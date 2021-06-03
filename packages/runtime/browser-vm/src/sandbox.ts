import {
  warn,
  assert,
  hasOwn,
  makeMap,
  isObject,
  rawWindow,
  evalWithEnv,
  emitSandboxHook,
  setDocCurrentScript,
  supportLetStatement,
  createKey,
} from '@garfish/utils';
import {
  Hooks,
  Module,
  FakeWindow,
  OverridesData,
  SandboxOptions,
  ExecScriptOptions,
} from './types';
import {
  bind,
  isModule,
  initHooks,
  isEsMethod,
  isConstructor,
  initContainer,
  verifyDescriptor,
  verifySetDescriptor,
  createFakeObject,
  addFakeWindowType,
  optimizeMethods,
  // setDocCurrentScript,
} from './utils';
import { historyOverride } from './modules/history';
import { documentOverride } from './modules/document';
import { XMLHttpRequestOverride } from './modules/xhr';
import { localStorageOverride } from './modules/storage';
import { listenerOverride } from './modules/eventListener';
import { timeoutOverride, intervalOverride } from './modules/timer';
import { __windowBind__, __garfishGlobal__ } from './symbolTypes';

let sandboxId = 0;
const defaultModules: Record<string, Module> = {
  history: historyOverride,
  timeout: timeoutOverride,
  document: documentOverride,
  listener: listenerOverride,
  interval: intervalOverride,
  localStorage: localStorageOverride,
  XMLHttpRequest: __DEV__ ? XMLHttpRequestOverride : null,
};

export class Sandbox {
  public type = 'vm';
  public closed = true;
  public id = `${createKey()}_${sandboxId++}`;
  public version = __VERSION__;
  public context?: FakeWindow;
  public options: SandboxOptions;
  private attachedCode = ''; // To optimize the with statement
  public recovers: Array<() => void> = [];
  public overrideContext: {
    recovers: Array<() => void>;
    overrides: Record<PropertyKey, any>;
    createds: Array<OverridesData['created']>;
    prepares: Array<() => void>;
  } = {
    createds: [],
    prepares: [],
    recovers: [],
    overrides: {},
  };

  private initComplete = false;
  private isProtectVariable: (p: PropertyKey) => boolean;
  private isInsulationVariable: (P: PropertyKey) => boolean;
  private isExternalGlobalVariable: Set<PropertyKey> = new Set();

  constructor(opts: SandboxOptions) {
    assert(isObject(opts), 'Miss options.');

    if (!opts.modules) opts.modules = {};
    if (!('useStrict' in opts)) opts.useStrict = false;
    if (!('openSandbox' in opts)) opts.openSandbox = true;
    if (!('requestConfig' in opts)) opts.requestConfig = {};
    if (!('strictIsolation' in opts)) opts.strictIsolation = true;

    initHooks(opts);
    initContainer(opts);
    this.isProtectVariable = makeMap(opts.protectVariable?.() || []);
    this.isInsulationVariable = makeMap(opts.insulationVariable?.() || []);

    this.options = opts;
    this.start(); // The default startup sandbox
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
          return Reflect.get(rawWindow, p);
        } else if (this.isInsulationVariable(p)) {
          value = Reflect.get(target, p, receiver);
        } else {
          value = hasOwn(target, p)
            ? Reflect.get(target, p, receiver)
            : Reflect.get(rawWindow, p);
        }

        if (typeof value === 'function') {
          // 以下几种情况不需要 bind
          // 1. 原生的 es 标准上的全局方法
          // 2. 沙箱内部或用户重写的方法
          // 3. 构造函数
          // 当过滤掉自定义和原生 es 的函数后，就只剩下 bom，dom 上的函数
          // 对这些环境有关的函数做构造函数等判断，进一步缩小需要 bind 的范围
          if (
            isEsMethod(p) ||
            hasOwn(overrides, p) ||
            isConstructor(value) ||
            this.isExternalGlobalVariable.has(p)
          ) {
            return value;
          }
        } else {
          return value;
        }

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

      set: (
        target: FakeWindow,
        p: PropertyKey,
        value: unknown,
        receiver: any,
      ) => {
        const verifyResult = verifySetDescriptor(
          // prettier-ignore
          this.isProtectVariable(p)
            ? rawWindow
            : receiver
              ? receiver
              : target,
          p,
          value,
        );
        // 值相同，直接返回设置成功。不可设置直接返回失败，在safari里面Reflect.set默认没有进行这部分处理
        if (verifyResult > 0) {
          if (verifyResult === 1 || verifyResult === 2) return false;
          if (verifyResult === 3) return true;
        }

        if (this.isProtectVariable(p)) {
          return Reflect.set(rawWindow, p, value);
        } else {
          const success = Reflect.set(target, p, value, receiver);
          if (success) {
            if (this.initComplete) {
              this.isExternalGlobalVariable.add(p);
            }
            // Update need optimization variables
            if (this.context) {
              const { $optimizeMethods, $optimizeUpdateStack } = this.context;
              if (Array.isArray($optimizeMethods)) {
                if ($optimizeMethods.indexOf(p) > -1) {
                  $optimizeUpdateStack.forEach((fn) => fn(p, value));
                }
              }
            }
          }
          return success;
        }
      },

      defineProperty: (
        target: FakeWindow,
        p: PropertyKey,
        descriptor: PropertyDescriptor,
      ) => {
        if (this.isProtectVariable(p)) {
          return Reflect.defineProperty(rawWindow, p, descriptor);
        } else {
          const success = Reflect.defineProperty(target, p, descriptor);
          if (this.initComplete && success) {
            this.isExternalGlobalVariable.add(p);
          }
          return success;
        }
      },

      deleteProperty: (target: FakeWindow, p: PropertyKey) => {
        if (hasOwn(target, p)) {
          delete target[p as any];
          if (this.initComplete && this.isExternalGlobalVariable.has(p)) {
            this.isExternalGlobalVariable.delete(p);
          }
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
    const prepares = [];
    const { modules, openSandbox } = this.options;
    const needLoadModules = {
      ...(openSandbox ? defaultModules : {}),
      ...modules,
    };

    for (const key of Object.keys(needLoadModules)) {
      const module = needLoadModules[key];
      if (typeof module === 'function') {
        const { recover, override, created, prepare } = module(this);
        if (recover) recovers.push(recover);
        if (created) createds.push(created);
        if (prepare) prepares.push(prepare);

        if (override) {
          // 后面的会覆盖前面的变量
          for (const key in override) {
            overrides[key] = override[key];
          }
        }
      }
    }
    return { recovers, createds, overrides, prepares };
  }

  execScript(code: string, env = {}, url = '', options?: ExecScriptOptions) {
    assert(!this.closed, 'Sandbox is closed');
    // 执行代码前初始环境时调用
    const { prepares } = this.overrideContext;
    if (prepares) prepares.forEach((fn) => fn());

    const { async } = options || {};
    const context = this.context;
    const refs = { url, code, context };

    this.callHook('onInvokeBefore', [this, refs]);
    const revertCurrentScript = setDocCurrentScript(
      this.context.document,
      code,
      false,
      url,
      async,
    );

    try {
      const sourceUrl = url ? `//# sourceURL=${url}\n` : '';
      let code = `${refs.code}\n${sourceUrl}`;
      code = !this.options.useStrict
        ? `with(window) {;${this.attachedCode + code}}`
        : code;

      if (this.options.openSandbox) {
        evalWithEnv(code, {
          window: refs.context,
          ...this.overrideContext.overrides,
          unstable_sandbox: this,
          ...env,
        });
      } else {
        evalWithEnv(code, {
          unstable_sandbox: this,
          ...env,
        });
      }
    } catch (e) {
      // 触发 window.onerror
      // const source = url || this.options.baseUrl;
      // const message = e instanceof Error ? e.message : String(e);

      // if (typeof refs.context.onerror === 'function') {
      //   // @ts-ignore
      //   const fn = refs.context.onerror._native || refs.context.onerror;
      //   fn.call(window, message, source, null, null, e);
      // }
      throw e;
    }

    revertCurrentScript();
    this.callHook('onInvokeAfter', [this, refs]);
  }

  optimizeGlobalMethod() {
    assert(!this.closed, 'Sandbox is closed');
    let code = '';
    const { context } = this;
    const methods = optimizeMethods.filter((p) => {
      return (
        p && !this.isProtectVariable(p) && hasOwn(context, p) // 如果当前环境不存在该方法，则不用管
      );
    });

    if (methods.length > 0) {
      code = methods.reduce((prevCode, method) => {
        // 只能用 let, 如果用 var，声明提前的特性会造成去 with 里面取，造成递归死循环
        return `${prevCode} let ${method} = window.${method};`;
      }, code);
      // 用于 `window.x = xx` 更新后，同步更新变量
      context.$optimizeMethods = methods;
      context.$optimizeUpdateStack = [];
      code += '$optimizeUpdateStack.push(function(key,val){eval(key+"=val")});';
    }
    return code;
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
    if (supportLetStatement) {
      this.attachedCode = this.optimizeGlobalMethod();
    }
    this.initComplete = true;
  }

  close() {
    if (!this.closed) {
      this.clearEffects();
      this.initComplete = false;
      this.closed = true;
      this.context = null;
      this.attachedCode = '';
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
