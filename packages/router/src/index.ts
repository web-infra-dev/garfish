import type { interfaces } from '@garfish/core';
import { createKey, routerLog } from '@garfish/utils';
import { RouterConfig } from './config';
import router, {
  initRedirect,
  RouterInterface,
  listenRouterAndReDirect,
} from './context';

declare module '@garfish/core' {
  export default interface Garfish {
    router: RouterInterface;
    apps: Record<string, interfaces.App>;
  }

  export namespace interfaces {
    export interface Config {
      autoRefreshApp?: boolean;
      onNotMatchRouter?: (path: string) => Promise<void> | void;
    }

    export interface AppInfo {
      activeWhen?: string | ((path: string) => boolean); // 手动加载，可不填写路由
      active?: (appInfo: AppInfo, rootPath: string) => void;
      deactive?: (appInfo: AppInfo, rootPath: string) => void;
      rootPath?: string;
      basename?: string;
    }
  }
}

export type { RouterInterface } from './context';

interface Options {
  autoRefreshApp?: boolean;
  onNotMatchRouter?: (path: string) => Promise<void> | void;
}

export function GarfishRouter(_args?: Options) {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    Garfish.apps = {};
    Garfish.router = router;

    return {
      name: 'router',
      version: __VERSION__,

      bootstrap(options: interfaces.Options) {
        let activeApp: null | string = null;
        const unmounts: Record<string, Function> = {};
        const { basename } = options;
        const { autoRefreshApp = true, onNotMatchRouter = () => null } =
          Garfish.options;

        async function active(
          appInfo: interfaces.AppInfo,
          rootPath: string = '/',
        ) {
          routerLog(`${appInfo.name} active`, {
            appInfo,
            rootPath,
            listening: RouterConfig.listening,
          });

          // In the listening state, trigger the rendering of the application
          if (!RouterConfig.listening) return;

          const { name, active, cache = true } = appInfo;
          if (active) return active(appInfo, rootPath);
          appInfo.rootPath = rootPath;

          const currentApp = (activeApp = createKey());
          let { entry } = appInfo;
          if(typeof entry === 'function'){
            entry = entry();
          }
          const app = await Garfish.loadApp(appInfo.name, {
            cache,
            basename: rootPath,
            entry,
            domGetter: appInfo.domGetter,
          });

          if (app) {
            app.appInfo.basename = rootPath;

            const call = async (app: interfaces.App, isRender: boolean) => {
              if (!app) return;
              const isDes = cache && app.mounted;
              if (isRender) {
                return await app[isDes ? 'show' : 'mount']();
              } else {
                return app[isDes ? 'hide' : 'unmount']();
              }
            };

            Garfish.apps[name] = app;
            unmounts[name] = () => {
              // Destroy the application during rendering and discard the application instance
              if (app.mounting) {
                delete Garfish.cacheApps[name];
              }
              call(app, false);
            };

            if (currentApp === activeApp) {
              await call(app, true);
            }
          }
        }

        async function deactive(appInfo: interfaces.AppInfo, rootPath: string) {
          routerLog(`${appInfo.name} deactive`, {
            appInfo,
            rootPath,
          });

          activeApp = null;
          const { name, deactive } = appInfo;
          if (deactive) return deactive(appInfo, rootPath);

          const unmount = unmounts[name];
          unmount && unmount();
          delete Garfish.apps[name];

          // Nested scene to remove the current application of nested data
          // To avoid the main application prior to application
          const needToDeleteApps = router.routerConfig.apps.filter((app) => {
            if (appInfo.rootPath === app.basename) return true;
          });
          if (needToDeleteApps.length > 0) {
            needToDeleteApps.forEach((app) => {
              delete Garfish.appInfos[app.name];
              delete Garfish.cacheApps[app.name];
            });
            router.setRouterConfig({
              apps: router.routerConfig.apps.filter((app) => {
                return !needToDeleteApps.some(
                  (needDelete) => app.name === needDelete.name,
                );
              }),
            });
          }
        }

        const apps = Object.values(Garfish.appInfos);

        const appList = apps.filter((app) => {
          if (!app.basename) app.basename = basename;
          return !!app.activeWhen;
        }) as Array<Required<interfaces.AppInfo>>;

        const listenOptions = {
          basename,
          active,
          deactive,
          autoRefreshApp,
          notMatch: onNotMatchRouter,
          apps: appList,
          listening: true,
        };
        routerLog('listenRouterAndReDirect', listenOptions);
        listenRouterAndReDirect(listenOptions);
      },

      registerApp(appInfos) {
        const appList = Object.values(appInfos);
        // @ts-ignore
        router.registerRouter(appList.filter((app) => !!app.activeWhen));
        // After completion of the registration application, trigger application mount
        // Has been running after adding routing to trigger the redirection
        if (!Garfish.running) return;
        routerLog('registerApp initRedirect', appInfos);
        initRedirect();
      },
    };
  };
}
