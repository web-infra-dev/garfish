import reactSvg from '../static/icons/React.svg';
import vueSvg from '../static/icons/Vue.svg';
import viteSvg from '../static/icons/Vite.svg';
import angularSvg from '../static/icons/Angular.svg';
import multiInstanceSvg from '../static/icons/MultiInstance.svg';

export const subAppMenus = [
  {
    key: 'react17',
    path: '/eact17',
    icon: <img src={reactSvg} className="sidebar-item-icon" />,
    title: '【子应用】react17',
    routes: [
      { path: 'react17/home', title: '首页' },
      { path: 'react17/list', title: '员工列表' },
      { path: 'react17/detail', title: '员工详情', query: { id: '002' } },
    ],
  },
  {
    key: 'react16',
    path: '/react16',
    icon: <img src={reactSvg} className="sidebar-item-icon" />,
    title: '【子应用】react16',
    routes: [
      { path: 'react16/home', title: '首页' },
      { path: 'react16/about', title: '关于' },
    ],
  },
  {
    key: 'vue3',
    path: '/vue3',
    icon: <img src={vueSvg} className="sidebar-item-icon" />,
    title: '【子应用】vue3',
    routes: [
      { path: 'vue3/home', title: '首页' },
      { path: 'vue3/about', title: '关于' },
    ],
  },
  {
    key: 'vue2',
    path: '/vue2',
    icon: <img src={vueSvg} className="sidebar-item-icon" />,
    title: '【子应用】vue2',
    routes: [
      { path: 'vue2/index', title: '首页' },
      { path: 'vue2/about', title: '关于' },
    ],
  },
  {
    key: 'vite',
    path: '/vite',
    icon: <img src={viteSvg} className="sidebar-item-icon" />,
    title: '【子应用】vite',
    routes: [],
  },
  {
    key: 'angular',
    path: '/angular',
    icon: <img src={angularSvg} className="sidebar-item-icon" />,
    title: '【子应用】angular',
    routes: [
      { path: 'angular/home', title: '首页' },
      { path: 'angular/dashboard', title: '关于' },
    ],
  },
  {
    key: 'loadApp',
    path: '/loadApp',
    icon: <img src={multiInstanceSvg} className="sidebar-item-icon" />,
    title: '【多实例】',
    routes: [],
  },
];

export const subAppslinks = {
  react17: 'http://localhost:8091',
  react16: 'http://localhost:8092',
  vue3: 'http://localhost:8093/examples/subapp/vue3/',
  vue2: 'http://localhost:8094/examples/subapp/vue2/',
  vite: 'http://localhost:8095/examples/subapp/vite/',
  angular: 'http://localhost:4200/examples/subapp/angular/',
};
