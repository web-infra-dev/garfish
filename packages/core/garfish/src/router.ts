import { noop, createKey } from '@garfish/utils';
import { listenRouterAndReDirect } from '@garfish/router';
import { AppInfo } from './config';
import { Garfish } from './garfish';

export function startRouter(context: Garfish) {
  let activeApp = null;
  const unmounts: Record<string, Function> = {};
  const {
    apps,
    basename,
    autoRefreshApp,
    onNotMatchRouter = noop,
  } = context.options;

  async function active(appInfo: AppInfo, rootPath: string) {
    const { name, cache, active } = appInfo;
    if (active) return active(appInfo, rootPath);

    const currentApp = (activeApp = createKey());
    const app = await context.loadApp(name, {
      cache,
      basename: rootPath,
    });

    context.apps[name] = app;

    unmounts[name] = () => {
      if (app) {
        if (app.mounted && cache) {
          app.hide();
        } else {
          app.unmount();
        }
      }
    };

    if (app && currentApp === activeApp) {
      if (app.mounted && cache) {
        app.show();
      } else {
        await app.mount();
      }
    }
  }

  async function deactive(appInfo: AppInfo, rootPath: string) {
    activeApp = null;
    const { name, deactive } = appInfo;
    if (deactive) return deactive(appInfo, rootPath);

    const unmount = unmounts[name];
    unmount && unmount();
    delete context.apps[name];
  }

  listenRouterAndReDirect({
    active,
    deactive,
    autoRefreshApp,
    notMatch: onNotMatchRouter,
    basename,
    apps: apps.filter(
      (app) => app.activeWhen !== null && app.activeWhen !== undefined,
    ) as Array<Required<AppInfo>>,
  });
}
