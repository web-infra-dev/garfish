import { interfaces } from '@garfish/core';
import { createKey } from '@garfish/utils';
import router, {
  initRedirect,
  listenRouterAndReDirect,
  RouterInterface,
} from './context';

declare module '@garfish/core' {
  export interface Garfish {
    router: RouterInterface;
    apps: Record<string, interfaces.App>;
  }

  export namespace interfaces {
    export interface Garfish {
      router: RouterInterface;
      apps: Record<string, interfaces.App>;
    }

    export interface Config {
      autoRefreshApp?: boolean;
      onNotMatchRouter?: (path: string) => Promise<void> | void;
    }

    export interface AppInfo {
      activeWhen?: string | ((path: string) => boolean); // 手动加载，可不填写路由
      active?: (appInfo: AppInfo, rootPath: string) => void;
      deactive?: (appInfo: AppInfo, rootPath: string) => void;
      basename?: string;
    }
  }
}

interface Options {
  autoRefreshApp?: boolean;
  onNotMatchRouter?: (path: string) => Promise<void> | void;
}

export default function Router(_args?: Options) {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    Garfish.apps = {};
    Garfish.router = router;

    return {
      name: 'router',
      version: __VERSION__,
      bootstrap(options: interfaces.Options) {
        let activeApp = null;
        const unmounts: Record<string, Function> = {};
        const { apps, basename } = options;
        const {
          autoRefreshApp = true,
          onNotMatchRouter = () => null,
        } = Garfish.options;

        async function active(appInfo: interfaces.AppInfo, rootPath: string) {
          const { name, cache, active } = appInfo;
          if (active) return active(appInfo, rootPath);

          const currentApp = (activeApp = createKey());
          const app = await Garfish.loadApp(appInfo.name, {
            basename: rootPath,
            entry: appInfo.entry,
            domGetter: appInfo.domGetter || options.domGetter,
          });

          const call = (app: interfaces.App, isRender: boolean) => {
            if (!app) return;
            const isDes = cache && app.mounted;
            const fn = isRender
              ? app[isDes ? 'show' : 'mount']
              : app[isDes ? 'hide' : 'unmount'];
            return fn.call(app);
          };

          Garfish.apps[name] = app;
          unmounts[name] = () => call(app, false);

          if (currentApp === activeApp) {
            await call(app, true);
          }
        }

        async function deactive(appInfo: interfaces.AppInfo, rootPath: string) {
          activeApp = null;
          const { name, deactive } = appInfo;
          if (deactive) return deactive(appInfo, rootPath);

          const unmount = unmounts[name];
          unmount && unmount();
          delete Garfish.apps[name];
        }

        const appList = apps.filter(
          (app) => app.activeWhen !== null && app.activeWhen !== undefined,
        ) as Array<Required<interfaces.AppInfo>>;

        if (appList.length === 0) return;

        const listenOptions = {
          basename,
          active,
          deactive,
          autoRefreshApp,
          notMatch: onNotMatchRouter,
          apps: appList,
        };

        listenRouterAndReDirect(listenOptions);
      },

      registerApp(appInfos) {
        // Has been running after adding routing to trigger the redirection
        if (!Garfish.running) return;

        const appList = Object.keys(appInfos).map((key) => {
          return appInfos[key];
        });
        router.registerRouter(appList);

        // After completion of the registration application, trigger application mount
        initRedirect();
      },
    };
  };
}

export { RouterInterface } from './context';
