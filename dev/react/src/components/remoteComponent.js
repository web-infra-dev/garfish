import React from 'react';
import {
  hooks,
  esModule,
  loadModule,
  setModuleConfig,
} from '@garfish/remote-module';
import { remoteComponentUrl } from '../config';

setModuleConfig({
  externals: { React },
  alias: { Component: remoteComponentUrl },
});

const RemoteComponent = React.lazy(() => {
  return esModule(loadModule('@Component.One'));
});

hooks.usePlugin({
  name: 'devTest',
  asyncBeforeLoadModule(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, 1000);
    });
  },
});

export default function RemoteCp() {
  return (
    <div>
      <h3 data-test="title">React sub App remote component</h3>
      <React.Suspense fallback={<div>loading</div>}>
        <div>
          <RemoteComponent text="cool!" />
        </div>
      </React.Suspense>
    </div>
  );
}
