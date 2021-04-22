import { Plugin } from './utils/hooks';
import { Garfish } from './instance/context';
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

// function addAppPlugin(): Plugin {
//   return {
//     name: 'bb',
//     initialize(context) {
//       console.log(context);
//     },
//     beforeLoad(context, _config) {
//       // config.appID = 'appA';
//       // return config
//       (context as any).loadApp = 'woshi';
//       return new Promise((resolve) => {
//         setTimeout(() => {
//           console.log('过来bb 插件了');
//           resolve();
//         }, 1000);
//       });
//     },
//     // beforeBootstrap(_con, config){
//     //   config.apps= [
//     //     ...config.apps,
//     //     {
//     //       name: 'appA',
//     //       entry: 'https://baidu.com'
//     //     }
//     //   ]
//     //   console.log(config);
//     //   return config;
//     // }
//   };
// }

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
