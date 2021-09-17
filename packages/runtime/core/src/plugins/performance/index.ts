import SubAppObserver from './subAppObserver';
import { interfaces } from '../../index';

// Key nodes in Garfish corresponding to the life cycle of registration
export function GarfishPerformance() {
  const subAppObserver = null;
  return function (_Garfish: interfaces.Garfish): interfaces.Plugin {
    const subAppMap = {};
    return {
      name: 'performance',
      async beforeLoad(appInfo) {
        if (!subAppMap[appInfo.name]) {
          // 运营平台子应用跟节点 id 为 'master-app'
          subAppMap[appInfo.name] = new SubAppObserver({
            subAppRootSelector: appInfo.domGetter as Element,
          });
        }
        subAppMap[appInfo.name].subAppBeforeLoad(appInfo.entry);
        return true;
      },
      afterLoad(appInfo, appInstance: interfaces.App) {
        if (appInstance)
          appInstance.appPerformance = subAppMap[appInfo.name] as any;
      },
      beforeMount(appInfo) {
        subAppMap[appInfo.name].subAppBeforeMount(appInfo.entry);
      },
      beforeUnmount(appInfo) {
        subAppMap[appInfo.name].subAppUnMount(appInfo.entry);
      },
    };
  };
}
