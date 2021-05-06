import Garfish, { interfaces } from '@garfish/core';
import { assert, createKey, warn } from '@garfish/utils';
import { listenRouterAndReDirect } from './router';

export default function Router(Garfish: Garfish): interfaces.Plugin {
  return {
    name: 'router',
    bootstrap(options) {
      let activeApp = null;
      const unmounts: Record<string, Function> = {};
      const { apps, basename, autoRefreshApp, onNotMatchRouter } = options;

      async function active(appInfo: interfaces.AppInfo, rootPath: string) {
        const { name, cache, active } = appInfo;
        if (active) return active(appInfo, rootPath);

        const currentApp = (activeApp = createKey());
        const app = await Garfish.loadApp({
          name: appInfo.name,
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

        Garfish.activeApps[name] = app;
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
        delete Garfish.activeApps[name];
      }

      const listenOptions = {
        active,
        deactive,
        autoRefreshApp,
        notMatch: onNotMatchRouter,
        basename,
        apps: apps.filter(
          (app) => app.activeWhen !== null && app.activeWhen !== undefined,
        ) as Array<Required<interfaces.AppInfo>>,
      };

      listenRouterAndReDirect(listenOptions);
    },
  };
}
