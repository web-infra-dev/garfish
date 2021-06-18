import { SyncHook, AsyncSeriesBailHook } from '@garfish/hooks';
import { warn } from '@garfish/utils';
import { interfaces } from './interface';

export function keys<O>(o: O) {
  return Object.keys(o) as (keyof O)[];
}

export class Hooks {
  public lifecycle: interfaces.Lifecycle;
  public plugins: Array<interfaces.Plugin> = [];

  constructor(hasIntercept) {
    this.lifecycle = {
      // beforeInitialize: SyncHook(['options']),
      initialize: SyncHook(['options']),
      beforeBootstrap: SyncHook(['options']),
      bootstrap: SyncHook(['options']),
      beforeRegisterApp: SyncHook(['appInfos']),
      registerApp: SyncHook(['appInfos']),
      beforeLoad: AsyncSeriesBailHook(['appInfo']),
      afterLoad: SyncHook(['appInfo', 'appInstance']),
      processResource: SyncHook(['appInfo', 'manager', 'resources']),
      initializeApp: AsyncSeriesBailHook([
        'context',
        'appInfo',
        'entryResManager',
        'resources',
        'isHtmlMode',
      ]),
      errorLoadApp: SyncHook(['appInfo', 'error']),
      beforeEval: SyncHook(['appInfo', 'code', 'env', 'sourceUrl', 'options']),
      afterEval: SyncHook(['appInfo', 'code', 'env', 'sourceUrl', 'options']),
      beforeMount: SyncHook(['appInfo', 'appInstance']),
      afterMount: SyncHook(['appInfo', 'appInstance']),
      errorMount: SyncHook(['appInfo', 'error']),
      beforeUnMount: SyncHook(['appInfo', 'appInstance']),
      afterUnMount: SyncHook(['appInfo', 'appInstance']),
      errorExecCode: SyncHook(['appInfo', 'error']),
    };

    if (hasIntercept) {
      Object.keys(this.lifecycle).forEach((lifeKey) => {
        this.lifecycle[lifeKey].intercept({
          async call(...args) {
            const appInfo = args[0];
            // hasAppInfo lifecycle
            if (
              appInfo &&
              appInfo.hooks &&
              appInfo.hooks.lifecycle &&
              appInfo.hooks.lifecycle[lifeKey]
            ) {
              if (lifeKey === 'beforeLoad') {
                await appInfo.hooks.lifecycle[lifeKey].promise(...args);
              } else {
                appInfo.hooks.lifecycle[lifeKey].call(...args);
              }
            }
          },
        });
      });
    }
  }

  public usePlugins(plugin: interfaces.Plugin) {
    const lifecycleKeys = keys(this.lifecycle);
    const pluginName = plugin.name;

    if (typeof plugin !== 'object')
      __DEV__ && warn('Plug-in must return object type');
    if (pluginName) __DEV__ && warn('Plug-in must provide a name');

    if (this.plugins.indexOf(plugin) === -1) this.plugins.push(plugin);
    lifecycleKeys.forEach((key) => {
      const pluginLife = plugin[key];
      if (!pluginLife) return;

      const cst = this.lifecycle[key].constructor;
      // 区分不同的hooks类型，采用不同的注册策略
      if (cst === AsyncSeriesBailHook) {
        (this.lifecycle[key] as any).tapPromise(pluginName, pluginLife);
      } else {
        (this.lifecycle[key] as any).tap(pluginName, pluginLife);
      }
    });
  }
}

// export const hooks = Hooks();
