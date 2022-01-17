import {
  IconSun,
  IconSchedule,
  IconBulb,
  IconQqZone,
  IconSend,
  IconVoice,
  IconCommand,
} from '@arco-design/web-react/icon';
import './index.less';

export const subAppMenus = [
  {
    key: 'react17',
    icon: <IconSun />,
    title: '【子应用】react17',
    routes: [
      { path: 'react17/home', title: '【订单列表】' },
      { path: 'react17/about', title: '【订单详情】' },
    ],
  },
  {
    key: 'react16',
    icon: <IconSchedule />,
    title: '【子应用】react16',
    routes: [
      { path: 'react16/home', title: '首页' },
      { path: 'react16/about', title: '关于' },
    ],
  },
  {
    key: 'vue3',
    icon: <IconBulb />,
    title: '【子应用】vue3',
    routes: [
      { path: 'vue3/home', title: '首页' },
      { path: 'vue3/about', title: '关于' },
    ],
  },
  {
    key: 'vue2',
    icon: <IconQqZone />,
    title: '【子应用】vue2',
    routes: [
      { path: 'vue2/home', title: '首页' },
      { path: 'vue2/about', title: '关于' },
    ],
  },
  {
    key: 'vite',
    icon: <IconSend />,
    title: '【子应用】vite',
    routes: [
      // { path: 'vue2/home', title: '首页' },
      // { path: 'vuu2/about', title: '关于' },
    ],
  },
  {
    key: 'angular',
    icon: <IconVoice />,
    title: '【子应用】angular',
    routes: [
      { path: 'angular/home', title: '首页' },
      { path: 'angular/dashboard', title: '关于' },
    ],
  },
  {
    key: 'loadApp',
    icon: <IconCommand />,
    title: '【多实例】',
    routes: [],
  },
];
