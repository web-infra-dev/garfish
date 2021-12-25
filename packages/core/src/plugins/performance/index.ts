import { getRenderNode } from '@garfish/utils';
import { interfaces } from '../../index';
import { SubAppObserver } from './subAppObserver';

// Key nodes in Garfish corresponding to the life cycle of registration
export function GarfishPerformance() {
  return function (): interfaces.Plugin {
    const subAppMap = {};
    return {
      name: 'performance',

      async beforeLoad(appInfo) {
        if (!subAppMap[appInfo.name]) {
          const appDomGetter = await getRenderNode(appInfo.domGetter);
          subAppMap[appInfo.name] = new SubAppObserver({
            subAppRootSelector: appDomGetter as Element,
          });
        }
        subAppMap[appInfo.name].subAppBeforeLoad(appInfo.entry);
        return true;
      },

      afterLoad(appInfo, appInstance: interfaces.App) {
        if (appInstance) {
          appInstance.appPerformance = subAppMap[appInfo.name] as any;
        }
      },

      beforeMount(appInfo) {
        subAppMap[appInfo.name].subAppBeforeMount(appInfo.entry);
      },

      beforeUnmount(appInfo) {
        subAppMap[appInfo.name].subAppUnmount(appInfo.entry);
      },
    };
  };
}
