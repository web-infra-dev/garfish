import React from 'react';
import Garfish from 'garfish';
import * as ReactDom from 'react-dom';
import * as mobxReact from 'mobx-react';
import * as ReactRouterDom from 'react-router-dom';
import { Message } from '@arco-design/web-react';
import { store } from './store';
import { basename, apps } from './constant';

export const GarfishInit = async () => {
  console.log('Garfish.run apps', apps);
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
    Garfish.run({
      /***
       * 子应用的基础路径，默认值为 /，整个微前端应用的 basename。
       * 设置后该值为所有子应用的默认值，若子应用 AppInfo 中也提供了该值会替换全局的 basename 值
       */
      basename,
      /***
       * 子应用的挂载点，提供 string 类型时需要其值是 selector，Garfish 内部会使用 document.querySelector(domGetter) 去选中子应用的挂载点。
       * 当提供函数时，子应用在路由驱动挂载和手动挂载时将会执行该函数并且期望返回一个 dom 元素。设置后该值为所有子应用的默认值，若子应用 AppInfo 中也提供了该值会替换全局的 domGetter
       */
      domGetter: '#submodule',

      /***
       * 是否禁用子应用的资源预加载，默认值为 false，开启子应用的预加载能力，预加载能力在弱网情况和手机端将不会开启。
       * 预加载加载权重会根据子应用的加载次数，预加载会在用户端计算子应用打开的次数，会优先加载打开次数多的子应用
       */
      disablePreloadApp: false,
      apps,

      // sandbox用于配置子应用沙箱的运行参数，当配置 sandbox 为 false 时表示关闭沙箱
      // sandbox: false,
      sandbox: {
        /***
         strictIsolation 表明是否开启开启严格隔离，开启严格隔离后，子应用的渲染节点将会开启 Shadow DOM close 模式，
         * 并且子应用的查询和添加行为仅会在 DOM 作用域内进行
         */
        strictIsolation: false,

        /***
         *  覆盖子应用的执行上下文，使用自定义的执行上下文，例如子应用 localStorage 使用当前主应用 localStorage
         * 仅在 snapshot: false 时有效
         */
        modules: [() => ({ override: { localStorage: window.localStorage } })],

        /***
         * 默认值为 false. snapshot 表明是否开启快照沙箱，默认情况下关闭快照沙箱，使用 VM 沙箱（VM 沙箱支持多实例）
         * 当使用 loadApp 手动挂载子应用时，请确保 snapshot 设置为 false
         */
        snapshot: false,
      },

      /***
       * autoRefreshApp: 主应用在已经打开子应用页面的前提下，跳转子应用的子路由触发子应用的视图更新
       * 在某些场景下通过主应用触发子应用视图更新可能会导致触发子应用的视图刷新而触发子应用的 hook，所以提供关闭触发子应用视图刷新的能力
       * 注意：当 autoRefreshApp 选项关闭后，只能通过 Garfish.router 跳转子应用路由
       */
      autoRefreshApp: true,

      /***
       * 使某些全局变量处于保护状态，值的读写不会受到沙箱的影响（
       * 默认情况，子应用的 window 环境变量值是与主应用和其他子应用是隔离的，如果想主应用提供的值在子应用中也能读到或子应用间的值能进行共享，
       * 将该值的 key 放置数组中即可实现值间进行共享）
       */
      protectVariable: [
        'MonitoringInstance',
        'Garfish',
        '__GARFISH_GLOBAL_APP_LIFECYCLE__',
      ],

      // 传递给子应用的参数，子应用的生命周期将接收到该参数
      props: {
        store,
      },

      /***
       * 开始加载子应用前触发该函数，支持异步函数，可以在该函数中执行异步操作，当返回 false 时表示中断子应用的加载以及后续流程，所有子应用加载都会触发该函数的调用
       */
      beforeLoad(appInfo) {
        console.log('子应用开始加载', appInfo.name);
      },
      /***
       * 加载子应用结束后触发该函数，支持异步函数，可以在该函数中执行异步操作，所有子应用加载完成后都会触发该函数的调用
       */
      afterLoad(appInfo) {
        console.log('子应用加载完成', appInfo);
        store.setActiveApp(appInfo.name);
      },
      /***
       * 加载异常触发该函数的调用，填写该函数之后错误将不会向上丢出全局无法捕获，所有子应用加载失败后都会触发该函数的调用
       */
      errorLoadApp(error, appInfo) {
        console.log('子应用加载异常', appInfo.name);
        console.error(error);
      },
      // 在子应用渲染前触发该函数
      beforeMount(appInfo) {
        console.log('子应用开始渲染', appInfo.name);
      },
      // 在子应用渲染后触发该函数
      afterMount(appInfo) {
        console.log('子应用渲染结束', appInfo.name);
      },
      /***
       * 渲染异常触发该函数的调用，填写该函数之后错误将不会向上丢出, 全局无法捕获，提供给开发者决定如何处理错误
       * 有子应用加载失败后都会触发该函数的调用
       */
      errorMountApp(error, appInfo) {
        console.log('子应用渲染异常', appInfo.name);
        console.error(error);
      },
      // 在子应用销毁前触发该函数
      beforeUnmount(appInfo) {
        console.log('子应用开始销毁', appInfo.name);
      },
      // 在子应用销毁后触发该函数
      afterUnmount(appInfo) {
        console.log('子应用销毁结束', appInfo.name);
      },
      /***
       * 销毁异常触发该函数的调用，填写该函数之后错误将不会向上丢出, 全局无法捕获，提供给开发者决定如何处理错误
       * 有子应用加载失败后都会触发该函数的调用
       */
      errorUnmountApp(error, appInfo) {
        console.log('子应用销毁异常', appInfo.name);
        console.error(error);
      },
      // 在路由发生变化时并且未匹配到任何子应用时触发
      onNotMatchRouter(path) {
        // console.log('子应用路由未匹配', path);
      },
    });
  } catch (error) {
    console.log('garfish init error', error);
  }
};
