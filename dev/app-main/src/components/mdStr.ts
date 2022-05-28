import { basename } from '../constant';

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
- 子应用挂载完成前 loading 状态
- loadApp 异步加载添加 loading 状态
- 页面路由不匹配时 404 页面兜底
- css 隔离能力(css prefix)
- 全局状态更新页面重渲染
- react & vue 应用内部状态管理
- reactBridge 支持 errorBoundary
-
\`\`\`
`;

export const toSubAppStr = `
\`\`\`javascript
import { useNavigate } from 'react-router-dom';
// 使用 Garfish.router 跳转:
Garfish.router.push({ path: '/react17' });
// 使用框架路由跳转:
navigate('/examples/react17');
\`\`\`
`;

export const loadAppStr = `
\`\`\`javascript
function VueApp(basename) {
  useEffect(async () => {
    const app = await Garfish.loadApp('vue-app', {
      cache: true,
      basename:'examples/loadApp',
      domGetter: '#container',
      entry: 'http://localhost:8095',
    });
    // 若已经渲染触发 show，只有首次渲染触发 mount，后面渲染都可以触发 show 提供性能
    app.mounted
      ? app.show()
      : await app.mount();
    return () => app.hide();
  });

  return <div id="container"></div>;
}
\`\`\`
`;

export const upgradeStr = `
\`\`\`javascript
### 如何升级

- 外部用户 升级 garfish
npm update garfish
yarn upgrade garfish
pnpm update garfish

- 内部用户升级 @byted/garfish
npm update @byted/garfish
yarn upgrade @byted/garfish
pnpm update @byted/garfish

由于内部包 @byted/garfish 依赖外部包 garfish, 当 garfish 升级时 @byted/garfish 的依赖可能不会自动升级。
可以尝试如下方式升级隐式依赖，保证使用的是最新版本的包。

- npm 升级隐式依赖
npm update garfish --depth 10
- yarn 升级隐式依赖

- pnpm 升级隐式依赖
pnpm update garfish --depth 10
\`\`\`
`;

export const getAppBasicInfo = (appInfos) => {
  const appInfoStr = Object.keys(appInfos).map((k) => {
    const value = window.Garfish.appInfos[k];
    const tmp = `
    - ${value.name}
      - activeWhen: '${value.activeWhen}',
      - basename: '${value.basename}${value.activeWhen}',
      - 访问地址: '${value.entry}'`;
    return tmp;
  });

  return `
\`\`\`javascript
### Garfish example 基本信息
- garfish 版本: v${window.Garfish.version}
- 全局 basename: '${basename}'
- 主应用信息
  - react: v17
  - react-router-dom: v6
  - basename: 'examples'
  - 访问地址: 'http://localhost:8090'

- 子应用信息 ${appInfoStr}
\`\`\`
`;
};
