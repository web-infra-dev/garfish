import { Plugin } from './utils/hooks';
import { Garfish } from './instance/context';
import { assert, warn } from '@garfish/utils/src';
export { Plugin, Lifecycle } from './utils/hooks';

// Garfish.usePlugin(envModifyPlugin);
// Garfish.usePlugin(addAppPlugin);
const GarfishInstance = new Garfish();


// function envModifyPlugin(): Plugin {
//   return {
//     name: 'envModify',
//     beforeLoad(context, _config) {
//       // config.appID = 'appA';
//       // return config
//       (context as any).loadApp = 'woshi';
//       return new Promise((resolve) => {
//         setTimeout(() => {
//           console.log('过来envModify 插件了');
//           resolve();
//         }, 3000);
//       });
//     },
//   };
// }



// declare class Garfish {
//   public setExternal: (nameOrExtObj: string | Record<string, any>, value?: any) => void
// }

function addCjsExternalPlugin( Garfish: Garfish ): Plugin {
  function setExternal(nameOrExtObj: string | Record<string, any>, value?: any) {
    assert(nameOrExtObj, 'Invalid parameter.');
    if (typeof nameOrExtObj === 'object') {
      for (const key in nameOrExtObj) {
        if (this.externals[key]) {
          __DEV__ && warn(`The "${key}" will be overwritten in external.`);
        }
        this.externals[key] = nameOrExtObj[key];
      }
    } else {
      this.externals[nameOrExtObj] = value;
    }
    return this;
  }

  return {
    name: 'bb',
    initialize() {
      // Garfish.setExternal = setExternal;
    },
    beforeLoad(context, _config) {
      // config.appID = 'appA';
      // return config
      (context as any).loadApp = 'woshi';
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('过来bb 插件了');
          resolve();
        }, 1000);
      });
    }
  };
}

declare global {
  interface Window {
    Garfish: Garfish;
    __GARFISH__: boolean;
  }
}

window.__GARFISH__ = true;


async function use () {
  let app = await GarfishInstance.loadApp({
    name: 'vue',
    cache: false,
    entry: 'http://localhost:3000' ,
    domGetter: '#submoduleByCunstom'
  })
  console.log(await app.mount());

  // setTimeout(()=>{
  //   app.unmount();
  // },4000)
}

use();

GarfishInstance.run();
export default Garfish;

// import Garfish from '@garfish/core';

// let GF = new Garfish({
//   domGetter: ''
// });

// GF.run();
