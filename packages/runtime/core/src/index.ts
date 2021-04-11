import { Plugin } from './utils/hooks';
import { Garfish } from './instance/context';
export { Plugin, Lifecycle } from './utils/hooks';

Garfish.usePlugin(envModifyPlugin);
Garfish.usePlugin(addAppPlugin);
const GarfishInstance = new Garfish();

GarfishInstance.run({});

function envModifyPlugin(): Plugin {
  return {
    name: 'envModify',
    beforeLoadApp(context, _config) {
      // config.appID = 'appA';
      // return config
      (context as any).loadApp = 'woshi';
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('过来envModify 插件了');
          resolve(false);
        }, 3000);
      });
    },
  };
}

function addAppPlugin(): Plugin {
  return {
    name: 'bb',
    beforeLoadApp(context, _config) {
      // config.appID = 'appA';
      // return config
      (context as any).loadApp = 'woshi';
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('过来bb 插件了');
          resolve();
        }, 1000);
      });
    },
    // beforeBootstrap(_con, config){
    //   config.apps= [
    //     ...config.apps,
    //     {
    //       name: 'appA',
    //       entry: 'https://baidu.com'
    //     }
    //   ]
    //   console.log(config);
    //   return config;
    // }
  };
}
console.log(GarfishInstance);

export default Garfish;

// import Garfish from '@garfish/core';

// let GF = new Garfish({
//   domGetter: ''
// });

// GF.run();
