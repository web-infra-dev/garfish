// import { AsyncSeriesBailHook } from '@garfish/hooks';
import { SyncHook } from './hooks/synchook';
import { AsyncSeriesBailHook } from './hooks/asyncSeriesBailHook';
import { warn } from '@garfish/utils';
import { interfaces } from './interface';

export function keys<O>(o: O) {
  return Object.keys(o) as (keyof O)[];
}

export class Hooks {
  static globalHook = null;
  // public lifecycle: interfaces.Lifecycle;
  public lifecycle: any;
  public plugins: Array<interfaces.Plugin> = [];

  constructor(hasIntercept) {
    this.lifecycle = {
      // beforeInitialize: new SyncHook(['options']),
      // initialize: new SyncHook(['options']),
      // beforeBootstrap: new SyncHook(['options']),
      // bootstrap: new SyncHook(['options']),
      // beforeRegisterApp: new SyncHook(['appInfos']),
      // registerApp: new SyncHook(['appInfos']),
      // beforeLoad: new AsyncSeriesBailHook(['appInfo']),
      // afterLoad: new SyncHook(['appInfo', 'appInstance']),
      // processResource: new SyncHook(['appInfo', 'manager', 'resources']),
      // initializeApp: new AsyncSeriesBailHook([
      //   'context',
      //   'appInfo',
      //   'entryResManager',
      //   'resources',
      //   'isHtmlMode',
      // ]),
      // beforeEval: new SyncHook([
      //   'appInfo',
      //   'code',
      //   'env',
      //   'sourceUrl',
      //   'options',
      // ]),
      // afterEval: new SyncHook([
      //   'appInfo',
      //   'code',
      //   'env',
      //   'sourceUrl',
      //   'options',
      // ]),
      // beforeMount: new SyncHook(['appInfo', 'appInstance']),
      // afterMount: new SyncHook(['appInfo', 'appInstance']),
      // beforeUnMount: new SyncHook(['appInfo', 'appInstance']),
      // afterUnMount: new SyncHook(['appInfo', 'appInstance']),
      // errorLoadApp: new SyncHook(['appInfo', 'error']),
      // errorMountApp: new SyncHook(['appInfo', 'error']),
      // errorUnmountApp: new SyncHook(['appInfo', 'error']),
      // errorExecCode: new SyncHook(['appInfo', 'error']),
      initialize: new SyncHook(),
      beforeBootstrap: new SyncHook(),
      bootstrap: new SyncHook(),
      beforeRegisterApp: new SyncHook(),
      registerApp: new SyncHook(),
      beforeLoad: new AsyncSeriesBailHook(),
      afterLoad: new SyncHook(),
      processResource: new SyncHook(),
      // initializeApp: new AsyncSeriesBailHook([
      //   'context',
      //   'appInfo',
      //   'entryResManager',
      //   'resources',
      //   'isHtmlMode',
      // ]),
      beforeEval: new SyncHook(),
      afterEval: new SyncHook(),
      beforeMount: new SyncHook(),
      afterMount: new SyncHook(),
      beforeUnMount: new SyncHook(),
      afterUnMount: new SyncHook(),
      errorLoadApp: new SyncHook(),
      errorMountApp: new SyncHook(),
      errorUnmountApp: new SyncHook(),
      errorExecCode: new SyncHook(),
    };

    if (hasIntercept) {
      const globalHookLifecycle = Hooks.globalHook.lifecycle;
      Object.keys(globalHookLifecycle).forEach((lifeKey) => {
        globalHookLifecycle[lifeKey].intercept({
          async call(...args) {
            const appInfo = args[0];
            // hasAppInfo lifecycle
            if (
              appInfo &&
              appInfo.hooks &&
              appInfo.hooks.lifecycle &&
              appInfo.hooks.lifecycle[lifeKey]
            ) {
              const lifecycle = appInfo.hooks.lifecycle[lifeKey];
              return (
                typeof lifecycle.call === 'function' &&
                (await lifecycle.call(...args))
              );
            }
          },
        });
      });
    } else {
      Hooks.globalHook = this;
    }
  }

  public usePlugins(plugin: interfaces.Plugin) {
    const lifecycleKeys = keys(this.lifecycle);
    const pluginName = plugin.name;

    if (typeof plugin !== 'object')
      __DEV__ && warn('Plug-in must return object type');
    if (!pluginName) __DEV__ && warn('Plug-in must provide a name');

    if (this.plugins.indexOf(plugin) === -1) this.plugins.push(plugin);
    lifecycleKeys.forEach((key) => {
      const pluginLife = plugin[key];
      if (!pluginLife) return;

      // 区分不同的hooks类型，采用不同的注册策略
      (this.lifecycle[key] as any).tap(pluginName, pluginLife);
    });
  }
}

// export const hooks = Hooks();
