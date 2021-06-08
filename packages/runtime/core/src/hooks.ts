import {
  SyncHook,
  AsyncSeriesBailHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
} from '@garfish/hooks';
import { warn } from '@garfish/utils';
import { interfaces } from './interface';

export function keys<O>(o: O) {
  return Object.keys(o) as (keyof O)[];
}

export class Hooks {
  public lifecycle: interfaces.Lifecycle;

  constructor() {
    this.lifecycle = {
      // beforeInitialize: new SyncHook(['options']),
      initialize: new SyncHook(['options']),
      beforeBootstrap: new SyncHook(['options']),
      bootstrap: new SyncHook(['options']),
      beforeRegisterApp: new SyncHook(['appInfos']),
      registerApp: new SyncHook(['appInfos']),
      beforeLoad: new AsyncSeriesBailHook(['appInfo']),
      afterLoad: new SyncHook(['appInfo', 'appInstance']),
      processResource: new SyncHook(['appInfo', 'manager', 'resources']),
      initializeApp: new AsyncSeriesBailHook([
        'context',
        'appInfo',
        'entryResManager',
        'resources',
        'isHtmlMode',
      ]),
      errorLoadApp: new SyncHook(['appInfo', 'error']),
      beforeEval: new SyncHook([
        'appInfo',
        'code',
        'env',
        'sourceUrl',
        'options',
      ]),
      afterEval: new SyncHook([
        'appInfo',
        'code',
        'env',
        'sourceUrl',
        'options',
      ]),
      beforeMount: new SyncHook(['appInfo', 'appInstance']),
      afterMount: new SyncHook(['appInfo', 'appInstance']),
      errorMount: new SyncHook(['appInfo', 'error']),
      beforeUnMount: new SyncHook(['appInfo', 'appInstance']),
      afterUnMount: new SyncHook(['appInfo', 'appInstance']),
      errorExecCode: new SyncHook(['appInfo', 'error']),
    };
  }

  public usePlugins(plugin: interfaces.Plugin) {
    const lifecycleKeys = keys(this.lifecycle);
    const pluginName = plugin.name;

    if (typeof plugin !== 'object')
      __DEV__ && warn('Plug-in must return object type');
    if (pluginName) __DEV__ && warn('Plug-in must provide a name');

    lifecycleKeys.forEach((key) => {
      const pluginLife = plugin[key];
      if (!pluginLife) return;

      const cst = this.lifecycle[key].constructor;
      // 区分不同的hooks类型，采用不同的注册策略
      if (
        cst === AsyncParallelBailHook ||
        cst === AsyncSeriesBailHook ||
        cst === AsyncParallelBailHook
      ) {
        (this.lifecycle[key] as any).tapPromise(pluginName, pluginLife);
      } else {
        (this.lifecycle[key] as any).tap(pluginName, pluginLife);
      }
    });
  }
}

export const hooks = new Hooks();
