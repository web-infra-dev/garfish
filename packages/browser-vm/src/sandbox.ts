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
import { historyModule } from './modules/history';
import { networkModule } from './modules/network';
import { documentModule } from './modules/document';
import { UiEventOverride } from './modules/uiEvent';
import { localStorageModule } from './modules/storage';
import { listenerModule } from './modules/eventListener';
import { timeoutModule, intervalModule } from './modules/timer';
import { makeElInjector } from './dynamicNode';
import { sandboxLifecycle } from './lifecycle';
import { optimizeMethods, createFakeObject } from './utils';
import { __garfishGlobal__, GARFISH_OPTIMIZE_NAME } from './symbolTypes';
import {
  Module,
  SandboxOptions,
  ExecScriptOptions,
  ReplaceGlobalVariables,
} from './types';
import {
  createHas,
  createGetter,
  createSetter,
  createDefineProperty,
  createDeleteProperty,
} from './proxyInterceptor/global';

let id = 0;
const defaultModules: Array<Module> = [
  networkModule,
  timeoutModule,
  intervalModule,
  historyModule,
  documentModule,
  listenerModule,
  UiEventOverride,
  localStorageModule,
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
  public global?: Window;
  public loader: Loader;
  public options: SandboxOptions;
  public hooks = sandboxLifecycle();
  public replaceGlobalVariables: ReplaceGlobalVariables;
  public deferClearEffects: Set<() => void> = new Set();
  public isExternalGlobalVariable: Set<PropertyKey> = new Set();
  public isProtectVariable: (p: PropertyKey) => boolean;
  public isInsulationVariable: (P: PropertyKey) => boolean;

  private optimizeCode = ''; // To optimize the with statement

  constructor(options: SandboxOptions) {
    // Default sandbox config
    const defaultOptions = {
      baseUrl: '',
      namespace: '',
      modules: [],
      sourceList: [],
      disableWith: false,
      openSandbox: true,
      strictIsolation: false,
      el: () => null,
      protectVariable: () => [],
      insulationVariable: () => [],
    };
    this.options = isPlainObject(options)
      ? deepMerge(defaultOptions, options)
      : defaultOptions;
    // SourceUrl Using a reference type, make its can be changed
    options.sourceList && (this.options.sourceList = options.sourceList);

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
    makeElInjector();
    // The default startup sandbox
    this.start();
  }

  start() {
    this.closed = false;
    this.replaceGlobalVariables = this.getModuleData();
    const { createdList, overrideList } = this.replaceGlobalVariables;
    this.global = this.createProxyWindow(Object.keys(overrideList));

    if (overrideList) {
      for (const key in overrideList) {
        this.global[key] = overrideList[key];
      }
    }
    if (createdList) {
      createdList.forEach((fn) => fn(this.global));
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
    this.global = null;
    this.optimizeCode = '';
    this.initComplete = false;
    this.deferClearEffects.clear();
    this.isExternalGlobalVariable.clear();
    this.replaceGlobalVariables.createdList = [];
    this.replaceGlobalVariables.prepareList = [];
    this.replaceGlobalVariables.recoverList = [];
    this.replaceGlobalVariables.overrideList = [];
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
    safeWrapper(() => {
      // Cross-domain errors may occur during access
      proxy.top = window.top === window ? subProxy : window.top;
      proxy.parent = window.parent === window ? subProxy : window.parent;
    });

    addProxyWindowType(proxy, window);
    return proxy;
  }

  getModuleData() {
    const recoverList = [];
    const createdList = [];
    const prepareList = [];
    const overrideList = {};
    const { modules, openSandbox } = this.options;
    const allModules = openSandbox ? defaultModules.concat(modules) : modules;

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

  optimizeGlobalMethod() {
    let code = '';
    const methods = optimizeMethods.filter((p) => {
      return (
        // If the method does not exist in the current environment, do not care
        p && !this.isProtectVariable(p) && hasOwn(this.global, p)
      );
    });
    if (methods.length === 0) return code;

    code = methods.reduce((prevCode, name) => {
      // You can only use `let`, if you use `var`,
      // declaring the characteristics in advance will cause you to fetch from with,
      // resulting in a recursive loop
      return `${prevCode} let ${name} = window.${name};`;
    }, code);
    // Used to update the variables synchronously after `window.x = xx` is updated
    this.global[`${GARFISH_OPTIMIZE_NAME}Methods`] = methods;
    this.global[`${GARFISH_OPTIMIZE_NAME}UpdateStack`] = [];
    code += `window.${GARFISH_OPTIMIZE_NAME}UpdateStack.push(function(k,v){eval(k+"=v")});`;
    return code;
  }

  execScript(code: string, env = {}, url = '', options?: ExecScriptOptions) {
    const { async } = options || {};
    const { disableWith, openSandbox } = this.options;
    const { prepareList, overrideList } = this.replaceGlobalVariables;

    this.hooks.lifecycle.beforeInvoke.emit(url, env, options);

    if (prepareList) {
      prepareList.forEach((fn) => fn && fn());
    }

    const revertCurrentScript = setDocCurrentScript(
      this.global.document,
      code,
      false,
      url,
      async,
    );

    try {
      code += `\n${url ? `//# sourceURL=${url}\n` : ''}`;
      code = !disableWith
        ? `with(window) {;${this.optimizeCode + code}}`
        : code;

      if (openSandbox) {
        evalWithEnv(
          code,
          {
            window: this.global,
            ...overrideList,
            ...env,
          },
          this.global,
        );
      } else {
        evalWithEnv(code, env, window);
      }
    } catch (e) {
      this.hooks.lifecycle.invokeError.emit(e, url, env, options);
      // dispatch `window.onerror`
      if (typeof this.global.onerror === 'function') {
        const source = url || this.options.baseUrl;
        const message = e instanceof Error ? e.message : String(e);
        safeWrapper(() => {
          this.global.onerror.call(this.global, message, source, null, null, e);
        });
      }
      throw e;
    } finally {
      revertCurrentScript();
    }
    this.hooks.lifecycle.afterInvoke.emit(url, env, options);
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
      } catch {
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
