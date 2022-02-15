import { interfaces } from '../interface';

// When the main application is updated, the currently active child applications need to rerender.
export function GarfishHMRPlugin() {
  let hasInit = false;
  let isHotUpdate = false;
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    return {
      name: 'fix-hmr',
      version: __VERSION__,

      bootstrap() {
        if (hasInit) return;
        hasInit = true;

        let webpackHotUpdateName = 'webpackHotUpdate';
        let webpackHotUpdate = (window as any)[webpackHotUpdateName];

        for (const i in window) {
          if (i.includes('webpackHotUpdate')) {
            webpackHotUpdateName = i;
            webpackHotUpdate = window[i];
          }
        }

        for (const i in window) {
          if (i.includes('webpackHotUpdate')) {
            webpackHotUpdate = window[i];
            webpackHotUpdateName = i;
          }
        }

        if (typeof webpackHotUpdate === 'function') {
          (window as any)[webpackHotUpdateName] = function () {
            isHotUpdate = true;
            return webpackHotUpdate.apply(this, arguments);
          };

          const observer = new MutationObserver(() => {
            if (!isHotUpdate) return;
            isHotUpdate = false;

            Garfish.activeApps.forEach((app) => {
              if (app.mounted) {
                setTimeout(() => {
                  app.display && app.hide();
                  app.show();
                });
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
