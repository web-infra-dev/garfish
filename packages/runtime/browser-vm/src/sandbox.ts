import {
  warn,
  assert,
  hasOwn,
  makeMap,
  isObject,
  deepMerge,
  evalWithEnv,
  setDocCurrentScript,
} from '@garfish/utils';
import {
  Module,
  SandboxOptions,
  ExecScriptOptions,
  ReplaceGlobalVariables,
} from './types';
import {
  isModule,
  optimizeMethods,
  createFakeObject,
  addProxyWindowType,
} from './utils';
import { defaultConfig } from './config';
import { historyOverride } from './modules/history';
import { documentOverride } from './modules/document';
import { XMLHttpRequestOverride } from './modules/xhr';
import { localStorageOverride } from './modules/storage';
import { listenerOverride } from './modules/eventListener';
import { timeoutOverride, intervalOverride } from './modules/timer';
import { __garfishGlobal__, GAR_OPTIMIZE_NAME } from './symbolTypes';
import {
  createHas,
  createGetter,
  createSetter,
  createDefineProperty,
  createDeleteProperty,
} from './proxyInterceptor/global';

let id = 0;
const defaultModules: Array<Module> = [
  historyOverride,
  timeoutOverride,
  documentOverride,
  listenerOverride,
  intervalOverride,
  localStorageOverride,
];

// Deal with hmr problem
if (__DEV__) {
  defaultModules.push(XMLHttpRequestOverride);
}

export class Sandbox {
  public version = __VERSION__;
  public id = id++;
  public type = 'vm';
  public closed = true;
  public initComplete = false;
  public global?: Window;
  public options: SandboxOptions;
  public recovers: Array<() => void> = [];
  public replaceGlobalVariables: ReplaceGlobalVariables;
  public isProtectVariable: (p: PropertyKey) => boolean;
  public isInsulationVariable: (P: PropertyKey) => boolean;
  public isExternalGlobalVariable: Set<PropertyKey> = new Set();

  private optimizeCode = ''; // To optimize the with statement

  constructor(options: SandboxOptions) {
    this.options = isObject(options)
      ? deepMerge(defaultConfig, options)
      : deepMerge({}, options);

    const { protectVariable, insulationVariable } = this.options;
    this.isProtectVariable = makeMap(protectVariable?.() || []);
    this.isInsulationVariable = makeMap(insulationVariable?.() || []);

    this.replaceGlobalVariables = {
      createdList: [],
      prepareList: [],
      recoverList: [],
      overrideList: {},
    };
    this.start(); // The default startup sandbox
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
    this.optimizeCode = this.optimizeGlobalMethod();
    this.initComplete = true;
  }

  close() {
    if (!this.closed) return;
    this.clearEffects();
    this.closed = true;
    this.global = null;
    this.optimizeCode = '';
    this.initComplete = false;
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
    proxy.top = window.top === window ? subProxy : window.top;
    proxy.parent = window.parent === window ? subProxy : window.top;
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
        const { recover, override, created, prepare } = module(this);
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
    const recovers = this.replaceGlobalVariables.recoverList || [];
    recovers.forEach((fn) => fn && fn());
  }

  optimizeGlobalMethod() {
    assert(!this.closed, 'Sandbox is closed');
    let code = '';
    const methods = optimizeMethods.filter((p) => {
      return (
        // If the method does not exist in the current environment, do not care
        p && !this.isProtectVariable(p) && hasOwn(this.global, p)
      );
    });
    if (methods.length === 0) return code;

    code = methods.reduce((prevCode, name) => {
      // You can only use let, if you use var,
      // declaring the characteristics in advance will cause you to fetch from with,
      // resulting in a recursive loop
      return `${prevCode} let ${name} = window.${name};`;
    }, code);
    // Used to update the variables synchronously after `window.x = xx` is updated
    this.global[`${GAR_OPTIMIZE_NAME}Methods`] = methods;
    this.global[`${GAR_OPTIMIZE_NAME}UpdateStack`] = [];
    code += `${GAR_OPTIMIZE_NAME}UpdateStack.push(function(k,v){eval(k+"=v") });`;
    return code;
  }

  execScript(code: string, env = {}, url = '', options?: ExecScriptOptions) {
    const { async } = options || {};
    const { useStrict, openSandbox } = this.options;
    const { prepareList, overrideList } = this.replaceGlobalVariables;
    if (prepareList) prepareList.forEach((fn) => fn && fn());

    const revertCurrentScript = setDocCurrentScript(
      this.global.document,
      code,
      false,
      url,
      async,
    );

    try {
      code += `\n${url ? `//# sourceURL=${url}\n` : ''}`;
      code = !useStrict ? `with(window) {;${this.optimizeCode + code}}` : code;
      if (openSandbox) {
        evalWithEnv(code, {
          window: this.global,
          ...overrideList,
          ...env,
        });
      } else {
        evalWithEnv(code, {
          unstable_sandbox: this,
          ...env,
        });
      }
    } catch (e) {
      // dispatch `window.onerror`
      const source = url || this.options.baseUrl;
      const message = e instanceof Error ? e.message : String(e);
      if (typeof this.global.onerror === 'function') {
        const errorFn =
          (this.global.onerror as any)._native || this.global.onerror;
        errorFn.call(window, message, source, null, null, e);
      }
      throw e;
    }
    revertCurrentScript();
  }

  static getNativeWindow() {
    let module = window;
    while (isModule(module)) {
      module = module[__garfishGlobal__ as any] as Window & typeof globalThis;
    }
    return module;
  }
}
