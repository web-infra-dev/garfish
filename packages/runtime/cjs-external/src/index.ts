import Garfish, { Plugin } from '@garfish/core';
import { assert, warn } from '@garfish/utils';

declare module '@garfish/core' {
  export default interface Garfish {
    setExternal: (
      nameOrExtObj: string | Record<string, any>,
      value?: any,
    ) => void;
    externals: Record<string, any>;
  }
}

export default function addCjsExternalPlugin(Garfish: Garfish): Plugin {
  Garfish.setExternal = setExternal;

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
    name: 'bb',
    beforeEval(appInfo, code, env) {
      env.require = (name) => Garfish.externals[name];
    },
    // initialize() {
    //   // Garfish.fe = setExternal;
    // },
    // beforeLoad(context, _config) {
    //   (context as any).loadApp = 'woshi';
    //   return new Promise((resolve) => {
    //     setTimeout(() => {
    //       console.log('过来bb 插件了');
    //       resolve();
    //     }, 1000);
    //   });
    // }
  };
}
