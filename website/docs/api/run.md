---
title: Garfish.run
slug: /api/run
order: 2
---
import Highlight from '@site/src/components/Highlight';
import BeforeLoad from '@site/src/components/lifeCycle/_beforeLoad.mdx';
import AfterLoad from '@site/src/components/lifeCycle/_afterLoad.mdx';
import ErrorLoadApp from '@site/src/components/lifeCycle/_errorLoadApp.mdx';
import BeforeEval from '@site/src/components/lifeCycle/_beforeEval.mdx';
import AfterEval from '@site/src/components/lifeCycle/_afterEval.mdx';
import BeforeMount from '@site/src/components/lifeCycle/_beforeMount.mdx';
import AfterMount from '@site/src/components/lifeCycle/_afterMount.mdx';
import ErrorMountApp from '@site/src/components/lifeCycle/_errorMountApp.mdx';
import BeforeUnmount from '@site/src/components/lifeCycle/_beforeUnmount.mdx';
import AfterUnmount from '@site/src/components/lifeCycle/_afterUnmount.mdx';
import ErrorUnmountApp from '@site/src/components/lifeCycle/_errorUnmountApp.mdx';
import OnNotMatchRouter from '@site/src/components/lifeCycle/_onNotMatchRouter.mdx';
import SandboxConfig from '@site/src/components/config/_sandbox.mdx';
import DomGetter from '@site/src/components/config/_domGetter.mdx';
import BaseNameConfig from '@site/src/components/config/_basename.mdx';
import ProtectVariable from '@site/src/components/config/_protectVariable.mdx';
import InsulationVariable from '@site/src/components/config/_insulationVariable.mdx';
import CustomFetch from '@site/src/components/lifeCycle/_customFetch.mdx';


用于初始化全局配置、注册子应用信息，并启动基于路由匹配的子应用自动渲染流程。

> garfish 基于 `activeWhen` 参数自动进行子应用激活匹配，可参考 [activeWhen](/api/registerApp#activewhen) 了解 garfish 路由匹配逻辑；


## 类型

```ts
run(options?: interfaces.Options): Garfish;
```

```ts
// type 定义
export interface Options extends Config, AppGlobalConfig, GlobalLifecycle {}
```

## 默认值

- {}

## 示例

```ts
import Garfish from "garfish";
import type { interfaces } from "garfish";

const config: interfaces.Options = {
    /* global options */
    basename: '/',
    domGetter: '#subApp',
    disablePreloadApp: false,
    ...
    /* app infos */
    apps: [
      {
        name: 'react',
        activeWhen: '/react',
        entry: 'http://localhost:3000',
        ...
      }
    ],
    /* lifecycle hooks */
    beforeLoad(appInfo) {
      console.log('子应用开始加载', appInfo.name);
    },
    afterLoad(appInfo) {
      console.log('子应用加载完成', appInfo.name);
    },
    ...
}
Garfish.run({ config });
```

## 参数

`options`

### domGetter?

<DomGetter />

### basename?

<BaseNameConfig />

### props?

- Type: <Highlight>Object</Highlight>
- 初始化时主应用传递给子应用的数据，可选。子应用 [`provider` 导出函数](/guide/quickStart/start.md#2导出-provider-函数) 生命周期方法中将接收到此数据；

### disablePreloadApp?

- Type: <Highlight> boolean </Highlight>
- 是否禁用子应用的资源预加载，可选，默认值为 `false`。默认情况下 Garfish 会开启子应用的资源预加载能力；
- Garfish 会在用户端计算子应用打开的次数，应用的打开次数越多，预加载权重越大；
- 预加载能力在弱网情况和手机端将不会开启；

### sandbox?

- Type: <Highlight> SandboxConfig | false </Highlight>可选，默认值为 SandboxConfig。当设置为 false 时关闭沙箱；

```ts
interface SandboxConfig {
  // 是否开启快照沙箱，默认值为 false：关闭快照沙箱，开启 vm 沙箱
  snapshot?: boolean;
  // 是否修复子应用请求的 baseUrl（请求为相对路径时才生效）,默认值为 false
  fixBaseUrl?: boolean;
  // 是否开启开启严格隔离，默认值为 false。开启严格隔离后，子应用的渲染节点将会开启 Shadow DOM close 模式，并且子应用的查询和添加行为仅会在 DOM 作用域内进行
  strictIsolation?: boolean;
  // modules 仅在 vm 沙箱时有效，用于覆盖子应用执行上下文的环境变量，使用自定义的执行上下文，默认值为[]
  modules?: Array<Module> | Record<string, Module>;
}

type Module = (sandbox: Sandbox) => OverridesData | void;

export interface OverridesData {
  recover?: (context: Sandbox['global']) => void;
  prepare?: () => void;
  created?: (context: Sandbox['global']) => void;
  override?: Record<PropertyKey, any>;
}
```

- 示例

```ts
Garfish.run({
  sandbox: {
    snapshot: false,
    strictIsolation: false,
    // 覆盖子应用 localStorage，使用当前主应用 localStorage
    modules: [
      () => ({
        override: {
          localStorage: window.localStorage,
        },
      }),
    ],
  },
});
```

:::caution
请注意：
如果你在沙箱内自定义的行为将会产生副作用，请确保在 recover 函数中清除你的副作用，garfish 将在应用卸载过程中执行 recover 函数销毁沙箱副作用，否则可能会造成内存泄漏。
:::
<SandboxConfig />

### autoRefreshApp?

- Type: <Highlight> boolean </Highlight>
- 主应用在已经打开子应用页面的前提下，跳转子应用的子路由触发子应用的视图更新，默认值为 `true`；
- 若关闭 `autoRefreshApp`, 则跳转 <Highlight>  子应用子路由 </Highlight> 将只能通过 [Garfish.router](/api/router) 进行跳转，使用框架自身路由 API（如 react-router）跳转将失效；
- 在某些场景下，通过主应用触发子应用视图更新可能会导致触发子应用的视图刷新而触发子应用的 hook，所以提供关闭触发子应用视图刷新的能力；

### protectVariable?

<ProtectVariable />

### insulationVariable?

<InsulationVariable />

### apps?

- Type: <Highlight> AppInfo[] </Highlight>
- 子应用列表信息，此字段参数信息与 [registerApp](../api/registerApp.md) 一致，可跳转查看详细介绍；

```ts
export interface AppInfo extends AppConfig, AppLifecycle {}

export interface AppGlobalConfig {
  // 子应用的基础路径，通过路由驱动自动加载子应用时实际传递给子应用的 basename 为计算的值
  // 若手动载入渲染应用时 basename 为这里指定的值
  basename?: string;
  // 子应用挂载点，同上，此处会覆盖全局默认的 domGetter
  domGetter?: DomGetter;
  // 传递给子应用的数据, 同上，此处会覆盖全局默认的 props
  props?: Record<string, any>;
  // 子应用的沙箱配置，同上，此处会覆盖全局默认的 sandbox
  sandbox?: false | SandboxConfig;
}

export type AppConfig = Partial<AppGlobalConfig> & {
  // 子应用的名称，需要唯一
  name: string;
  // 子应用的入口资源地址，支持 HTML 和 JS
  entry?: string;
  // 是否缓存子应用，默认值为 true；
  cache?: boolean;
  // 是否检查 provider, 默认为true；
  noCheckProvider?: boolean;
};
```

- 示例

```ts
Garfish.run({
  ...,
  apps: [
    {
      name: 'vue-app',
      basename: '/demo',
      activeWhen: '/vue-app',
      entry: 'http://localhost:3000',
      props: {
        msg: 'vue-app msg',
      }
    }
  }
]
```

### beforeLoad
<BeforeLoad />

### afterLoad
<AfterLoad />

### errorLoadApp
<ErrorLoadApp />

### beforeMount
<BeforeMount />

### afterMount
<AfterMount />

### beforeEval
<BeforeEval />

### afterEval
<AfterEval />

### errorMountApp
<ErrorMountApp />

### beforeUnmount
<BeforeUnmount />

### afterUnmount
<AfterUnmount />

### errorUnmountApp
<ErrorUnmountApp />

### onNotMatchRouter
<OnNotMatchRouter />
