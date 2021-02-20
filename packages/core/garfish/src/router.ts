import { listenRouterAndReDirect } from '@garfish/router';
import { noop, createKey, callTestCallback } from '@garfish/utils';
import { App } from './module/app';
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
    const call = (app: App, isRender: boolean) => {
      if (!app) return;
      const isDes = cache && app.mounted;
      const fn = isRender
        ? app[isDes ? 'show' : 'mount']
        : app[isDes ? 'hide' : 'unmount'];
      return fn.call(app);
    };

    context.apps[name] = app;
    unmounts[name] = () => call(app, false);

    if (currentApp === activeApp) {
      await call(app, true);
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

  const listenOptions = {
    active,
    deactive,
    autoRefreshApp,
    notMatch: onNotMatchRouter,
    basename,
    apps: apps.filter(
      (app) => app.activeWhen !== null && app.activeWhen !== undefined,
    ) as Array<Required<AppInfo>>,
  };

  if (__TEST__) {
    callTestCallback(startRouter, context, listenOptions);
  }
  listenRouterAndReDirect(listenOptions);
}
