import { SyncHook, AsyncHook, PluginSystem } from '@garfish/hooks';
import { interfaces } from './interface';

// prettier-ignore
export function globalLifecycle() {
  return new PluginSystem({
    beforeBootstrap: new SyncHook<[interfaces.Options], void>(),
    bootstrap: new SyncHook<[interfaces.Options], void>(),
    beforeRegisterApp: new SyncHook<[interfaces.AppInfo | Array<interfaces.AppInfo>], void>(),
    registerApp: new SyncHook<[Record<string, interfaces.AppInfo>], void>(),
    beforeLoad: new AsyncHook<[interfaces.AppInfo]>(),
    afterLoad: new AsyncHook<[interfaces.AppInfo, interfaces.App | null]>(),
    errorLoadApp: new SyncHook<[Error, interfaces.AppInfo], void>(),
  });
}

// prettier-ignore
export function appLifecycle() {
  return new PluginSystem({
    beforeEval: new SyncHook<[
        interfaces.AppInfo,
        string,
        Record<string, any> | undefined,
        string | undefined,
        { async?: boolean; noEntry?: boolean } | undefined,
      ],
      void
    >(),
    afterEval: new SyncHook<
      [
        interfaces.AppInfo,
        string,
        Record<string, any> | undefined,
        string | undefined,
        { async?: boolean; noEntry?: boolean } | undefined,
      ],
      void
    >(),
    beforeMount: new SyncHook<[interfaces.AppInfo, interfaces.App, boolean], void>(),
    afterMount: new SyncHook<[interfaces.AppInfo, interfaces.App, boolean], void>(),
    errorMountApp: new SyncHook<[Error, interfaces.AppInfo], void>(),
    beforeUnmount: new SyncHook<[interfaces.AppInfo, interfaces.App, boolean], void>(),
    afterUnmount: new SyncHook<[interfaces.AppInfo, interfaces.App, boolean], void>(),
    errorUnmountApp: new SyncHook<[Error, interfaces.AppInfo], void>(),
    errorExecCode: new SyncHook<
      [
        Error,
        interfaces.AppInfo,
        string,
        Record<string, any> | undefined,
        string | undefined,
        { async?: boolean; noEntry?: boolean } | undefined,
      ],
      void
    >(),
  });
}
