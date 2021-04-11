import {
  SyncHook,
  AsyncSeriesBailHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
} from '@garfish/hooks';
import { Garfish } from '../instance/context';
import { Options, AppInfo } from '../type';

export function keys<O>(o: O) {
  return Object.keys(o) as (keyof O)[];
}

type BootStrapArgs = [Garfish, Options];

type ConstructorParameters<T> = T extends SyncHook<any, any>
  ? T extends { tap: (options: any, fn: (...args: infer P) => infer R) => any }
    ? (...args: P) => R
    : never
  : T extends {
      tapPromise: (options: any, fn: (...args: infer A) => infer AR) => any;
    }
  ? (...args: A) => AR
  : never;

type PickParam<T> = {
  [k in keyof T]: ConstructorParameters<T[k]>;
};

export interface Lifecycle {
  initialize: SyncHook<BootStrapArgs, void>;
  beforeBootstrap: SyncHook<BootStrapArgs, void>;
  bootstrap: SyncHook<BootStrapArgs, void>;
  beforeRegisterApp: SyncHook<[Garfish, AppInfo | Array<AppInfo>], void>;
  registerApp: SyncHook<[Garfish, AppInfo | Array<AppInfo>], void>;
  beforeLoad: AsyncSeriesBailHook<[AppInfo, string], void | boolean>; // 根据返回值决定是否继续执行后续代码
}

export type Plugin = { name: string } & PickParam<Partial<Lifecycle>>;

export class Hooks {
  public lifecycle: Lifecycle;

  constructor() {
    this.lifecycle = {
      initialize: new SyncHook(['context', 'options']),
      beforeBootstrap: new SyncHook(['context', 'options']),
      bootstrap: new SyncHook(['context', 'options']),
      beforeRegisterApp: new SyncHook(['context', 'appInfos']),
      registerApp: new SyncHook(['context', 'appInfos']),
      beforeLoad: new AsyncSeriesBailHook(['context', 'appInfo']),
    };
  }

  public usePlugins(plugin: Plugin) {
    const lifecycleKeys = keys(this.lifecycle);
    const pluginName = plugin.name;
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
