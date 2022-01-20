import './index.less';
import reactSvg from '../../static/icons/React.svg';
import vueSvg from '../../static/icons/Vue.svg';
import viteSvg from '../../static/icons/Vite.svg';
import angularSvg from '../../static/icons/Angular.svg';
import multiInstanceSvg from '../../static/icons/MultiInstance.svg';

export const subAppMenus = [
  {
    key: 'react17',
    icon: <img src={reactSvg} className="sidebar-item-icon" />,
    title: '【子应用】react17',
    routes: [
      { path: 'react17/home', title: '【订单列表】' },
      { path: 'react17/about', title: '【订单详情】' },
    ],
  },
  {
    key: 'react16',
    icon: <img src={reactSvg} className="sidebar-item-icon" />,
    title: '【子应用】react16',
    routes: [
      { path: 'react16/home', title: '首页' },
      { path: 'react16/about', title: '关于' },
    ],
  },
  {
    key: 'vue3',
    icon: <img src={vueSvg} className="sidebar-item-icon" />,
    title: '【子应用】vue3',
    routes: [
      { path: 'vue3/home', title: '首页' },
      { path: 'vue3/about', title: '关于' },
    ],
  },
  {
    key: 'vue2',
    icon: <img src={vueSvg} className="sidebar-item-icon" />,
    title: '【子应用】vue2',
    routes: [
      { path: 'vue2/home', title: '首页' },
      { path: 'vue2/about', title: '关于' },
    ],
  },
  {
    key: 'vite',
    icon: <img src={viteSvg} className="sidebar-item-icon" />,
    title: '【子应用】vite',
    routes: [
      // { path: 'vue2/home', title: '首页' },
      // { path: 'vuu2/about', title: '关于' },
    ],
  },
  {
    key: 'angular',
    icon: <img src={angularSvg} className="sidebar-item-icon" />,
    title: '【子应用】angular',
    routes: [
      { path: 'angular/home', title: '首页' },
      { path: 'angular/dashboard', title: '关于' },
    ],
  },
  {
    key: 'loadApp',
    icon: <img src={multiInstanceSvg} className="sidebar-item-icon" />,
    title: '【多实例】',
    routes: [],
  },
];
