import React from 'react';
import Garfish from 'garfish';
import * as ReactDom from 'react-dom';
import * as mobxReact from 'mobx-react';
import * as ReactRouterDom from 'react-router-dom';
import { Message } from '@arco-design/web-react';
import { store } from './store';
import { localApps } from './constant';
import { Config } from './config';

export const GarfishInit = async () => {
  const apps = localApps;
  console.log('Garfish.run apps', apps);

  store.setApps(apps);
  Garfish.setExternal({
    react: React,
    'react-dom': ReactDom,
    'react-router-dom': ReactRouterDom,
    'mobx-react': mobxReact,
  });

  Garfish.channel.on('event', (msg: string) => {
    Message.success(`主应用收到消息：${msg}`);
  });

  Garfish.router.beforeEach((to, from, next) => {
    next();
  });

  Garfish.router.afterEach((to, from, next) => {
    next();
  });

  try {
    console.log('Garfish.run');

    Garfish.run(Config);
  } catch (error) {
    console.log('garfish init error', error);
  }
};
