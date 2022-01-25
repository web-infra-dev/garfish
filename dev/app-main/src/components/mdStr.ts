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

export const basicInfoStr = `
\`\`\`javascript
### Garfish example 基本信息

- garfish 版本: v1.2.17
- 主应用信息
  - react: v17
  - react-router-dom: v6
  - basename: '/'
  - 访问地址: 'http://localhost:8090/examples/main'

- 子应用信息
  - react17
    - basename: 'subapp/react17'
    - 独立应用访问地址: 'http://localhost:8091/examples/subapp/react17/'
  - react16:
    - basename: 'subapp/react16'
    - 独立应用访问地址:'http://localhost:8092/examples/subapp/react16/'
  - vue3:
    - basename: 'subapp/vue3'
    - 独立应用访问地址: 'http://localhost:8093/examples/subapp/vue3/'
  - vue2:
    - basename: 'subapp/vue2'
    - 独立应用访问地址: 'http://localhost:8094/examples/subapp/vue2/'
  - vite:
    - basename: 'subapp/vite'
    - 独立应用访问地址: 'http://localhost:8095/examples/subapp/vite/'
  - angular: 'http://localhost:4200/examples/subapp/angular/'
    - basename: 'subapp/angular'
    - 独立应用访问地址: 'http://localhost:8094/examples/subapp/vue2/'
\`\`\`
`;

export const featuresStr = `
\`\`\`javascript
### examples 当前已实现feature

- Garfish 微前端 dev 模式加载子应用(react17|react16|vue3|vue2|angular|)
- 子应用独立运行可访问
- 子应用使用 Garfish.router 跳转主应用
- 主应用使用 Garfish.router 跳转子应用
- 主、子 应用使用 Garfish.channel 进行通信
- 使用 Garfish.loadApp 动态加载子应用
- 异步加载应用前的 loading 状态
- 页面不匹配时 404 页面兜底能力
- 应用通过设置 prefix 达到 css 隔离能力
- 应用嵌套能力
- 主应用通过 props 参数传递数据给子应用，子应用 rerender
- 各应用 hmr 能力

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
  entry:'http://localhost:8095/examples/subapp/vite/',
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
- 外部用户 升级 garfish 包
npm update garfish
yarn update garfish
pnpm update garfish

- 内部用户升级 @byted/garfish 包
npm update @byted/garfish
yarn update @byted/garfish
pnpm update @byted/garfish

由于 内部包 @byted/garfish 依赖外部包 garfish, 当 garfish 升级时 @byted/garfish 的依赖可能不会自动升级。
可以尝试如下方式升级隐式依赖，保证使用的是最新版本的包。

- npm 升级隐式依赖
npm update garfish --depth 10
- yarn 升级隐式依赖
yarn update garfish --depth 10
- pnpm 升级隐式依赖
npm update garfish --depth 10
\`\`\`
`;
