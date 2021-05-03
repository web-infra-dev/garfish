import Garfish, { interfaces } from '@garfish/core';
import { assert, warn } from '@garfish/utils';

// declare module '@garfish/core' {
//   export default interface Garfish {
//     setExternal: (
//       nameOrExtObj: string | Record<string, any>,
//       value?: any,
//     ) => void;
//     externals: Record<string, any>;
//   }
// }

export default function BrowserVm(_Garfish: Garfish): interfaces.Plugin {
  return {
    name: 'bb',
    initialize() {
      // Garfish.fe = setExternal;
    },
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
