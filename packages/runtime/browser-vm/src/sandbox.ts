import {
  warn,
  assert,
  hasOwn,
  makeMap,
  isObject,
  evalWithEnv,
  emitSandboxHook,
  setDocCurrentScript,
  supportLetStatement,
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
import {
  createHas,
  createGetter,
  createSetter,
  createDefineProperty,
  createDeleteProperty,
} from './proxyInterceptor/global';

let id = 0;
const defaultModules: Record<string, Module> = {
  history: historyOverride,
  timeout: timeoutOverride,
  document: documentOverride,
  listener: listenerOverride,
  interval: intervalOverride,
  localStorage: localStorageOverride,
};

// Deal with hmr problem
if (__DEV__) {
  defaultModules.XMLHttpRequest = XMLHttpRequestOverride;
}

export class Sandbox {
  public version = __VERSION__;
  public id = id++;
  public type = 'vm';
  public closed = true;
  private optimizeCode = ''; // To optimize the with statement
  public global?: Window;
  public options: SandboxOptions;
  public recovers: Array<() => void> = [];
  public replaceGlobalVariables: {
    recovers: Array<() => void>;
    prepares: Array<() => void>;
    created: Array<OverridesData['created']>;
    overrides: Record<PropertyKey, any>;
  } = {
    created: [],
    prepares: [],
    recovers: [],
    overrides: {},
  };

  public initComplete = false;
  public isProtectVariable: (p: PropertyKey) => boolean;
  public isInsulationVariable: (P: PropertyKey) => boolean;
  public isExternalGlobalVariable: Set<PropertyKey> = new Set();

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

  createContext(moduleKeys: Array<string> = []) {
    const fakeWindow = createFakeObject(
      window,
      this.isInsulationVariable,
      makeMap(moduleKeys),
    );

    const baseHandlers = {
      get: createGetter(this),
      set: createSetter(this),
      defineProperty: createDefineProperty(this),
      deleteProperty: createDeleteProperty(this),
    };

    const parentHandlers = {
      ...baseHandlers,
      has: createHas(this),
    };

    // In fact, they are all proxy windows, but the problem of `var a = xx` can be solved through has
    const proxy = new Proxy(fakeWindow, parentHandlers);
    const subProxy = new Proxy(fakeWindow, baseHandlers);

    proxy.self = subProxy;
    proxy.window = subProxy;
    proxy.globalThis = subProxy;
    proxy.unstable_sandbox = this; // This attribute is used for debugger
    proxy.top = window.top === window ? subProxy : window.top;
    proxy.parent = window.parent === window ? subProxy : window.top;

    addFakeWindowType(proxy, window);
    this.callHook('onCreateContext', [this]);
    return proxy;
  }

  // 获取所有重写的对象
  getOverrides() {
    const overrides = {};
    const recovers = [];
    const created = [];
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
        if (created) created.push(created);
        if (prepare) prepares.push(prepare);

        if (override) {
          // 后面的会覆盖前面的变量
          for (const key in override) {
            overrides[key] = override[key];
          }
        }
      }
    }
    return { recovers, created, overrides, prepares };
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
      const source = url || this.options.baseUrl;
      const message = e instanceof Error ? e.message : String(e);

      if (typeof refs.context.onerror === 'function') {
        // @ts-ignore
        const fn = refs.context.onerror._native || refs.context.onerror;
        fn.call(window, message, source, null, null, e);
      }
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
    this.replaceGlobalVariables = this.getOverrides();

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
      module = module[__garfishGlobal__ as any] as Window & typeof globalThis;
    }
    return module;
  }

  static isBaseGlobal(module: Window) {
    return !isModule(module);
  }
}
