import { coreLog } from '@garfish/utils';
import { interfaces } from '../interface';

export function GarfishLogger() {
  return function (): interfaces.Plugin {
    return {
      name: 'garfish-logger',
      version: __VERSION__,
      beforeLoad(appInfo, ...args) {
        coreLog(`${appInfo.name} beforeLoad`, [appInfo, ...args]);
      },
      afterLoad(appInfo, appInstance, ...args) {
        coreLog(`${appInfo.name} id: ${appInstance.appId} afterLoad`, [
          appInfo,
          ...args,
        ]);
      },
      beforeMount(appInfo, appInstance, ...args) {
        coreLog(`${appInfo.name} id: ${appInstance.appId} beforeMount`, [
          appInfo,
          ...args,
        ]);
      },
      afterMount(appInfo, appInstance, ...args) {
        coreLog(`${appInfo.name} id: ${appInstance.appId} afterMount`, [
          appInfo,
          ...args,
        ]);
      },
      beforeUnmount(appInfo, appInstance, ...args) {
        coreLog(`${appInfo.name} id: ${appInstance.appId} beforeUnmount`, [
          appInfo,
          ...args,
        ]);
      },
      afterUnmount(appInfo, appInstance, ...args) {
        coreLog(`${appInfo.name} id: ${appInstance.appId} afterUnmount`, [
          appInfo,
          ...args,
        ]);
      },
    };
  };
}
