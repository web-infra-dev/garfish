import React from 'react';
// import {
//   esModule,
//   loadModule,
//   cacheModules,
//   loadModuleSync,
// } from '@garfish/remote-module';

// console.log(cacheModules);

// const RemoteComponent = loadModuleSync('@Component.One', {
//   externals: {
//     a: 1,
//   },
// });
// const RemoteComponentTwo = React.lazy(() =>
//   esModule(loadModule('@Component.Two')),
// );

export default function RemoteCp() {
  return (
    <div>
      <h3 data-test="title">React sub App remote component</h3>
      {/* <RemoteComponent text="cool!" /> */}
      {/* <React.Suspense fallback={<div>loading</div>}>
      <div>
        <RemoteComponentTwo text="good!" />
      </div>
    </React.Suspense> */}
    </div>
  );
}
