import { Loader } from '@garfish/loader';
import {
  warn,
  hasOwn,
  makeMap,
  isObject,
  deepMerge,
  evalWithEnv,
  safeWrapper,
  isPlainObject,
  setDocCurrentScript,
} from '@garfish/utils';
import type { interfaces } from '@garfish/core';
import { historyModule } from './modules/history';
import { networkModule } from './modules/network';
import { documentModule } from './modules/document';
import { UiEventOverride } from './modules/uiEvent';
import { localStorageModule } from './modules/storage';
import { listenerModule } from './modules/eventListener';
import { observerModule } from './modules/mutationObserver';
import { timeoutModule, intervalModule } from './modules/timer';
import { makeElInjector } from './dynamicNode';
import { sandboxLifecycle } from './lifecycle';
import { optimizeMethods, createFakeObject, sandboxMap } from './utils';
import { __garfishGlobal__, GARFISH_OPTIMIZE_NAME } from './symbolTypes';
import { Module, SandboxOptions, ReplaceGlobalVariables } from './types';
import {
  createHas,
  createGetter,
  createSetter,
  createDefineProperty,
  createDeleteProperty,
} from './proxyInterceptor/global';
import { messageChannel } from './modules/messageChannel';
import { matchMediaModule } from './modules/matchMedia';

let id = 0;
const defaultModules: Array<Module> = [
  networkModule,
  timeoutModule,
  intervalModule,
  historyModule,
  documentModule,
  listenerModule,
  observerModule,
  UiEventOverride,
  localStorageModule,
  messageChannel,
  matchMediaModule,
];

const isModule = (module: Window) => {
  return isObject(module)
    ? module[__garfishGlobal__ as any] !== undefined
    : false;
};

const addProxyWindowType = (module: Window, parentModule: Window) => {
  if (!isModule(module)) {
    module[__garfishGlobal__ as any] = parentModule;
  }
  return module;
};

export class Sandbox {
  public id = id++;
  public type = 'vm';
  public closed = true;
  public initComplete = false;
  public version = __VERSION__;
  public global?: Window & typeof globalThis;
  public loader: Loader;
  public options: SandboxOptions;
  public hooks = sandboxLifecycle();
  public replaceGlobalVariables: ReplaceGlobalVariables;
  public deferClearEffects: Set<() => void> = new Set();
  public isExternalGlobalVariable: Set<PropertyKey> = new Set();
  public isProtectVariable: (p: PropertyKey) => boolean;
  public isInsulationVariable: (P: PropertyKey) => boolean;
  public dynamicStyleSheetElementSet = new Set<HTMLStyleElement>();
  public styledComponentCSSRulesMap = new WeakMap<
    HTMLStyleElement,
    CSSRuleList
  >();

  private optimizeCode = ''; // To optimize the with statement
  private envVariable = '__GARFISH_SANDBOX_ENV_VAR__';

  constructor(options: SandboxOptions) {
    // Default sandbox config
    const defaultOptions: SandboxOptions = {
      baseUrl: '',
      namespace: '',
      modules: [],
      fixBaseUrl: false,
      disableWith: false,
      strictIsolation: false,
      el: () => null,
      styleScopeId: () => '',
      protectVariable: () => [],
      insulationVariable: () => [],
    };
    this.options = isPlainObject(options)
      ? deepMerge(defaultOptions, options)
      : defaultOptions;

    const { loaderOptions, protectVariable, insulationVariable } = this.options;
    this.loader = new Loader(loaderOptions);
    this.isProtectVariable = makeMap(protectVariable?.() || []);
    this.isInsulationVariable = makeMap(insulationVariable?.() || []);

    this.replaceGlobalVariables = {
      createdList: [],
      prepareList: [],
      recoverList: [],
      overrideList: {},
    };
    // Inject Global capture
    makeElInjector(this.options);
    // The default startup sandbox
    this.start();
    sandboxMap.set(this);
  }

  start() {
    this.closed = false;
    this.replaceGlobalVariables = this.getModuleData();
    const { createdList, overrideList } = this.replaceGlobalVariables;
    this.global = this.createProxyWindow(Object.keys(overrideList));

    if (overrideList && this.global) {
      for (const key in overrideList) {
        this.global[key] = overrideList[key];
      }
    }
    if (createdList) {
      createdList.forEach((fn) => fn && fn(this.global));
    }
    if (!this.options.disableWith) {
      this.optimizeCode = this.optimizeGlobalMethod();
    }
    this.initComplete = true;
    this.hooks.lifecycle.stared.emit(this.global);
  }

  close() {
    if (this.closed) return;
    this.clearEffects();
    this.closed = true;
    this.global = undefined;
    this.optimizeCode = '';
    this.initComplete = false;
    this.deferClearEffects.clear();
    this.isExternalGlobalVariable.clear();
    this.dynamicStyleSheetElementSet.clear();
    this.replaceGlobalVariables.createdList = [];
    this.replaceGlobalVariables.prepareList = [];
    this.replaceGlobalVariables.recoverList = [];
    this.replaceGlobalVariables.overrideList = [];
    sandboxMap.del(this);
    this.hooks.lifecycle.closed.emit();
  }

  reset() {
    this.close();
    this.start();
  }

  createProxyWindow(moduleKeys: Array<string> = []) {
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
      getPrototypeOf() {
        return Object.getPrototypeOf(window);
      },
    };

    const parentHandlers = {
      ...baseHandlers,
      has: createHas(this),
      getPrototypeOf() {
        return Object.getPrototypeOf(window);
      },
    };

    // In fact, they are all proxy windows, but the problem of `var a = xx` can be solved through has
    const proxy = new Proxy(fakeWindow, parentHandlers);
    const subProxy = new Proxy(fakeWindow, baseHandlers);

    proxy.self = subProxy;
    proxy.window = subProxy;
    proxy.globalThis = subProxy;
    proxy.__debug_sandbox__ = this; // This attribute is used for debugger
    safeWrapper(() => {
      // Cross-domain errors may occur during access
      proxy.top = window.top === window ? subProxy : window.top;
      proxy.parent = window.parent === window ? subProxy : window.parent;
    });

    addProxyWindowType(proxy, window);
    return proxy;
  }

  getModuleData() {
    const recoverList: Array<() => void> = [];
    const createdList: Array<(context: Window | undefined) => void> = [];
    const prepareList: Array<() => void> = [];
    const overrideList = {};
    const allModules = defaultModules.concat(this.options.modules ?? []);

    for (const module of allModules) {
      if (typeof module === 'function') {
        const { recover, override, created, prepare } = module(this) || {};
        if (recover) recoverList.push(recover);
        if (created) createdList.push(created);
        if (prepare) prepareList.push(prepare);
        if (override) {
          // The latter will overwrite the previous variable
          for (const key in override) {
            if (__DEV__ && overrideList[key]) {
              warn(`"${key}" global variables are overwritten.`);
            }
            overrideList[key] = override[key];
          }
        }
      }
    }
    return { recoverList, createdList, overrideList, prepareList };
  }

  clearEffects() {
    this.hooks.lifecycle.beforeClearEffect.emit();
    this.replaceGlobalVariables.recoverList.forEach((fn) => fn && fn());
    // `deferClearEffects` needs to be put at the end
    this.deferClearEffects.forEach((fn) => fn && fn());
    this.hooks.lifecycle.afterClearEffect.emit();
  }

  optimizeGlobalMethod(tempEnvKeys: Array<string> = []) {
    let code = '';
    const methods = optimizeMethods.filter((p) => {
      return (
        // If the method does not exist in the current environment, do not care
        p &&
        !this.isProtectVariable(p) &&
        !tempEnvKeys.includes(p) &&
        hasOwn(this.global, p)
      );
    });

    if (methods.length > 0) {
      code = methods.reduce((prevCode, name) => {
        // Can only use `let`, if you use `var`,
        // declaring the characteristics in advance will cause you to fetch from with,
        // resulting in a recursive loop
        return `${prevCode} let ${name} = window.${name};`;
      }, code);

      if (this.global) {
        this.global[`${GARFISH_OPTIMIZE_NAME}Methods`] = methods;
        this.global[`${GARFISH_OPTIMIZE_NAME}UpdateStack`] = [];
      }
      code += `window.${GARFISH_OPTIMIZE_NAME}UpdateStack.push(function(k,v){eval(k+"=v")});`;
    }

    if (tempEnvKeys.length > 0) {
      code = tempEnvKeys.reduce((prevCode, name) => {
        return `${prevCode} let ${name} = ${this.envVariable}.${name};`;
      }, code);
    }
    return code;
  }

  createExecParams(codeRef: { code: string }, env: Record<string, any>) {
    const { disableWith } = this.options;
    const { prepareList, overrideList } = this.replaceGlobalVariables;

    if (prepareList) {
      prepareList.forEach((fn) => fn && fn());
    }

    const params = {
      window: this.global,
      ...overrideList,
    };

    if (disableWith) {
      Object.assign(params, env);
    } else {
      const envKeys = Object.keys(env);
      const optimizeCode =
        envKeys.length > 0
          ? this.optimizeGlobalMethod(envKeys)
          : this.optimizeCode;

      codeRef.code = `with(window) {;${optimizeCode + codeRef.code}\n}`;
      params[this.envVariable] = env;
    }

    return params;
  }

  processExecError(
    e: any,
    url?: string,
    env?: Record<string, any>,
    options?: interfaces.ExecScriptOptions,
  ) {
    this.hooks.lifecycle.invokeError.emit(e, url, env, options);
    // dispatch `window.onerror`
    if (this.global && typeof this.global.onerror === 'function') {
      const source = url || this.options.baseUrl;
      const message = e instanceof Error ? e.message : String(e);
      safeWrapper(() => {
        this.global?.onerror?.call(this.global, message, source, null, null, e);
      });
    }
    throw e;
  }

  execScript(
    code: string,
    env = {},
    url = '',
    options?: interfaces.ExecScriptOptions,
  ) {
    const codeRef = { code };
    const { async, defer } = options || {};

    this.hooks.lifecycle.beforeInvoke.emit(codeRef, url, env, options);

    const revertCurrentScript = setDocCurrentScript(
      this.global?.document,
      codeRef.code,
      false,
      url,
      async,
      defer,
      options?.originScript,
    );

    try {
      const params = this.createExecParams(codeRef, env);
      codeRef.code += `\n${url ? `//# sourceURL=${url}\n` : ''}`;
      evalWithEnv(codeRef.code, params, this.global);
    } catch (e) {
      this.processExecError(e, url, env, options);
    } finally {
      Promise.resolve().then(revertCurrentScript);
    }

    this.hooks.lifecycle.afterInvoke.emit(codeRef, url, env, options);
  }

  static getNativeWindow() {
    let module = window;
    while (isModule(module)) {
      module = module[__garfishGlobal__ as any] as Window & typeof globalThis;
    }
    return module;
  }

  static canSupport() {
    let support = true;
    if (
      !window.Proxy ||
      !Array.prototype.includes ||
      !String.prototype.includes
    ) {
      support = false;
    }
    // let statement
    if (support) {
      try {
        new Function('let a = 666;');
      } catch (e) {
        support = false;
      }
    }
    if (!support) {
      warn(
        'The current environment does not support "vm sandbox",' +
          'Please use the "snapshot sandbox" instead.',
      );
    }
    return support;
  }
}
