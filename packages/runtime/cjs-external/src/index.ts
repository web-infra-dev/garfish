import { interfaces } from '@garfish/core';
import { assert, warn } from '@garfish/utils';

declare module '@garfish/core' {
  export default interface Garfish {
    setExternal: (
      nameOrExtObj: string | Record<string, any>,
      value?: any,
    ) => void;
    externals: Record<string, any>;
  }

  export namespace interfaces {
    export interface Garfish {
      setExternal: (
        nameOrExtObj: string | Record<string, any>,
        value?: any,
      ) => void;
      externals: Record<string, any>;
    }
  }
}

export default function cjsExternal() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    Garfish.setExternal = setExternal;
    Garfish.externals = {};

    function setExternal(
      nameOrExtObj: string | Record<string, any>,
      value?: any,
    ) {
      assert(nameOrExtObj, 'Invalid parameter.');
      if (typeof nameOrExtObj === 'object') {
        for (const key in nameOrExtObj) {
          if (Garfish.externals[key]) {
            __DEV__ && warn(`The "${key}" will be overwritten in external.`);
          }
          Garfish.externals[key] = nameOrExtObj[key];
        }
      } else {
        Garfish.externals[nameOrExtObj] = value;
      }
    }

    return {
      name: 'cjs-app',
      version: __VERSION__,
      afterLoad(appInfo, appInstance) {
        if (!appInstance) return;
        appInstance.cjsModules.require = (name) =>
          Garfish.externals && Garfish.externals[name];
      },
    };
  };
}
