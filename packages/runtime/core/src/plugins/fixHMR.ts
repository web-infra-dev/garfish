import { interfaces } from '../interface';

export default function fixHMR() {
  let hasInit = false;
  let isHotUpdate = false;
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    return {
      name: 'fix-hmr',
      version: __VERSION__,
      bootstrap() {
        if (hasInit) return;
        hasInit = true;
        const webpackHotUpdate = (window as any).webpackHotUpdate;

        if (typeof webpackHotUpdate === 'function') {
          (window as any).webpackHotUpdate = function () {
            isHotUpdate = true;
            return webpackHotUpdate.apply(this, arguments);
          };

          const observer = new MutationObserver(() => {
            if (!isHotUpdate) return;
            isHotUpdate = false;

            Object.keys(Garfish.activeApps).forEach((appName) => {
              const app = Garfish.activeApps[appName];
              if (app.mounted) {
                // app.display && app.hide();
                // app.show();
              }
            });
          });

          observer.observe(document.documentElement, {
            subtree: true,
            childList: true,
            attributes: true,
          });
        }
      },
    };
  };
}
