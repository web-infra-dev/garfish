import { basename } from '../constant';
export const mkdStr = `
\`\`\`javascript
import React from "react";
import ReactDOM from "react-dom";
import MEDitor from '@uiw/react-md-editor';

// 方式一： navigate('/${basename}/react17/home');
// 方式二： Garfish.router.push({ path: '/react17/home' });

export default function App() {
  const [value, setValue] = React.useState("**Hello world!!!**");
  return (
    <div className="container">
      <MEDitor
        value={value}
        onChange={setValue}
      />
      <MDEditor.Markdown source={value} />
    </div>
  );
}
\`\`\`
`;

export const basicInfoStr_dev = `
\`\`\`javascript
### Garfish example 基本信息

- garfish 版本: v1.2.17
- 全局 basename: 'examples'
- 主应用信息
  - react: v17
  - react-router-dom: v6
  - basename: 'examples'
  - 访问地址: 'http://localhost:8090'

- 子应用信息
  - react17
    - activeWhen: '/react17',
    - basename: 'examples/react17'
    - 独立应用访问地址: 'http://localhost:8091'
  - react16:
    - activeWhen: '/react16',
    - basename: 'examples/react16'
    - 独立应用访问地址:'http://localhost:8092'
  - vue3:
    - activeWhen: '/vue3',
    - basename: 'examples/vue3'
    - 独立应用访问地址: 'http://localhost:8093'
  - vue2:
    - activeWhen: (path) => path.includes('/vue2'),
    - basename: 'examples/vue2'
    - 独立应用访问地址: 'http://localhost:8094'
  - vite:
    - activeWhen: '/vite',
    - basename: 'examples/vite'
    - 独立应用访问地址: 'http://localhost:8095'
  - angular:
    - activeWhen: '/angular',
    - basename: 'examples/angular'
    - 独立应用访问地址: 'http://localhost:4200'
\`\`\`
`;

export const basicInfoStr_prod = `
\`\`\`javascript
### Garfish example 基本信息
- 全局 basename: 'examples'
- garfish 版本: v1.2.17
- 主应用信息
  - react: v17
  - react-router-dom: v6
  - basename: 'examples'
  - 访问地址: 'http://garfish.bytedance.net/examples/main'

- 子应用信息
  - react17
    - activeWhen: '/react17',
    - basename: 'examples/react17'
    - 独立应用访问地址: 'http://garfish.bytedance.net/examples/subapp/react17'
  - react16:
    - activeWhen: '/react16',
    - basename: 'examples/react16'
    - 独立应用访问地址: 'http://garfish.bytedance.net/examples/subapp/react16'
  - vue3:
    - activeWhen: '/vue3',
    - basename: 'examples/vue3'
    - 独立应用访问地址: 'http://garfish.bytedance.net/examples/subapp/vue3'
  - vue2:
    - activeWhen: (path) => path.includes('/vue2'),
    - basename: 'examples/vue2'
    - 独立应用访问地址: 'http://garfish.bytedance.net/examples/subapp/vue2'
  - vite:
    - activeWhen: '/vite',
    - basename: 'examples/vite'
    - 独立应用访问地址: 'http://garfish.bytedance.net/examples/subapp/vite/'
  - angular:
    - activeWhen: '/angular',
    - basename: 'examples/angular'
    - 独立应用访问地址: 'http://garfish.bytedance.net/examples/angular'
\`\`\`
`;

export const featuresStr = `
\`\`\`javascript
### examples 当前已实现feature

- Garfish 微前端 dev 模式加载子应用(react17|react16|vue3|vue2|vite|angular)
- 子应用独立运行可访问
- 主子应用支持热更新
- 多实例场景
- 应用间使用 Garfish.router 进行跳转
- 应用间使用 Garfish.channel 进行通信
- 使用 Garfish.loadApp 动态加载子应用
- 使用 Garfish.registerApp 动态注册子应用
- activeWhen 为函数使用场景
- 子应用挂载完成前 laoding 状态
- loadApp 异步加载添加 loading 状态
- 页面路由不匹配时 404 页面兜底
- css 隔离能力(arco + prefix)
- 全局状态更新页面重渲染
- react & vue 应用内部状态管理
- reactBridge 支持 errorBoundary
-
\`\`\`
`;

export const toSubAppStr = `
\`\`\`javascript
Garfish.router.push({ path: '/react17' });
navigate('/examples/react17');
\`\`\`
`;

export const loadAppStr = `
\`\`\`javascript
Garfish.loadApp(id, {
  entry:'http://localhost:8095',
  basename: 'examples/loadApp',
  domGetter: () => document.getElementById(domID),
  // 缓存设置，建议开启缓存避免重复的编译代码造成的性能浪费
  cache: true,
});
\`\`\`
`;

export const channelStr = `
\`\`\`javascript
// 子应用注册监听
useEffect(() => {
  window?.Garfish.channel.on('sayHello', handleMsg);
  return () => {
    window?.Garfish.channel.removeListener('sayHello', handleMsg);
  };
}, []);

// 主应用触发监听
window?.Garfish.channel.emit('sayHello', 'hello, i am main app');
\`\`\`
`;

export const upgradeStr = `
\`\`\`javascript
### 如何升级

- 外部用户 升级 garfish 包
npm update garfish
yarn upgrade garfish
pnpm update garfish

- 内部用户升级 @byted/garfish 包
npm update @byted/garfish
yarn upgrade @byted/garfish
pnpm update @byted/garfish

由于 内部包 @byted/garfish 依赖外部包 garfish, 当 garfish 升级时 @byted/garfish 的依赖可能不会自动升级。
可以尝试如下方式升级隐式依赖，保证使用的是最新版本的包。

- npm 升级隐式依赖
npm update garfish --depth 10
- yarn 升级隐式依赖

- pnpm 升级隐式依赖
pnpm update garfish --depth 10
\`\`\`
`;
