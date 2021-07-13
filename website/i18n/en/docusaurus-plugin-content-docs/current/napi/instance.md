Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.

THE_END
---The_end
title: API Reference
slug: /napi/new
order: 2

---

## run

`Garfish.run(options: Options) : Garfish`

### Options

#### `domGetter: () => Element | string`

You can fill in the node to get the mount point or the characters that `querySelect` can select.

#### `apps: Array<AppInfo>`

:::note

1. The main framework is not automatically associated with the remote Garfish management platform and needs to be injected manually. 2.
2. Sub-application resource addresses need to support cross-domain (**please control the allowed range, if not set the allowed range may cause security risks**).
3. `Garfish` will determine whether the resource is an `html entry` or a `js entry` based on its `mineType`. 4.
4. for a single `js`, the exported content must be `provider: { render, destroy }`.
   :::

- `AppInfo: { name, entry, activeWhen, active, deactive }`
  - `name` The name of the template, please make sure that the name is unique.
  - `entry` Sub-application entry
  - `activeWhen` path name, the path to activate the sub-application, fill in the root route, use as a function please do not use asynchronous logic
  - `active` Trigger when the application is activated, used instead of the default rendering logic inside Garfish. This hook can be used to render `iframe` if the app is not accessible quickly, [details](https://site.bytedance.net/docs/4545/6924/ifame)
  - `deactive` triggered when the application is destroyed, used instead of `Garfish` internal default destruction logic, with or without `active` configuration

#### `basename?: string`

Base routing address, explained in detail below.

#### `sandbox?: SandboxConfig`

- `open?: boolean` default `true`
- `snapshot?: boolean` Whether to open the snapshot sandbox, default `false`

#### `props?: Object`

Provide parameters as `provider` parameters for the child application

#### `protectVariable?: Array<string>`

Save the specified variable without clearing it during the sandbox switch

#### `autoRefreshApp?: boolean`

Default `true`, the main app will update the component when jumping through the app subroutes

#### `beforeLoad?: (appInfo: AppInfo) => void`

Called before the resource is loaded, returns `false`, which will prevent the `app` from being loaded, when there may be no `app`

#### `beforeMount?: (appInfo: AppInfo, path: string) => void`

Called before the child app is mounted

#### `afterMount?: (appInfo: AppInfo, path: string) => void`

Called after the child app is mounted

#### `beforeUnmount?: (appInfo: AppInfo, path: string) => void`

Called before the child application is destroyed

#### `afterUnmount?: (appInfo: AppInfo, path: string) => void`

Called after the destruction of the sub-application

#### `customLoader?: (provider: any, path: string, module: App) => void`

Custom loading rules

#### `errorLoadApp?: (err: Error, appInfo: AppInfo) => void`

Catch errors in loading sub-applications

#### `errorMountApp?: (err: Error, appInfo: AppInfo) => void`

Catch error when mounting a sub-application

#### `errorUnmountApp?: (err: Error, appInfo: AppInfo) => void`

Catch the error when unmounting a child application

#### `onNotMatchRouter?: (path: string) => void`

Triggered if the corresponding sub-application is not matched

### Example

```js
import Garfish from 'garfish';

Garfish.run({
  sandbox: false,
  basename: '/exmaple',
  domGetter: '#submodule',
  beforeMount() {
    console.log('Before application mount');
  },
  afterUnmount() {
    console.log('After application destruction');
  },
  apps: [
    {
      name: 'index',
      activeWhen: '/index',
      entry: 'sourceUrl', // js entry or html entry
    },
  ],
});
```

### basename

- The default value of `basename` is `'/'`
- This parameter is used as the `basePath` of the child application activation and can be provided to the child application as the `basepath` of the child application.
- Example.
  - Sub-applications: `activeWhen: '/detail'`, `basename: '/toutiao'`.
  - The sub-application will be active when jumping to: `/toutiao/detail`.
  - Sub-application jumps based on: `/toutiao/detail`.

* If the child app has a route itself, you need to use the `basename` passed by the `render` function as the route base path.

Take the example of the main app Vue, and the child app React.

```js
// index.js of the main app
const basePath = 'toutiao';
const router = new VueRouter({
  mode: 'history',
  base: basePath,
});

Garfish.run({
  basename: basePath,
  domGetter: '#submodule',
  apps: [
    {
      name: 'react',
      activeWhen: '/react',
      entry: `http://localhost:3000/index.js`,
    },
  ],
});

const app = new Vue({ router }).$mount('#app');
```

```js
// index.js of the child application
// Get the basename provided by the main app that the framework transfers as the basename of the child app, and use it as the root route when routing hops
class App extends React.Component<Props> {
  render() {
    return (
      <BrowserRouter basename={this.props.basename}>
        <div>
          <ul>
            <li>
              <Link to="/">Home</Link
            </li>
          </ul>
          <Route exact path="/" component={Index}></Route
        </div>
      </BrowserRouter
    );
  }
}

export function provider() {
  return {
    render({ dom, basename }) {
      // Render to a node in the sub-application html
      ReactDOM.render(<App basename={basename} />, dom.querySelector('#root'));
    },

    destroy({ dom }) {
      const root = dom && dom.querySelector('#root');
      if (root) {
        ReactDOM.unmountComponentAtNode(root);
      }
    },
  };
}
```

## registerApp

`Garfish.registerApp(app: AppInfo | AppInfo[]) : Garfish`

This method is used to register subapplication information, in addition to registering information when `Garfish.run` is started.

```js
Garfish.registerApp({
  name: 'childApp',
  entry: 'sourceUrl',
  activeWhen: '/xx',
});

// You can also register multiple apps by passing in an array
Garfish.registerApp([
  {
    name: 'childApp',
    entry: 'sourceUrl',
    activeWhen: '/xx',
  },
]);
```

## loadApp

`Garfish.loadApp(appName: string, options?: Options) : App | null`

Manually loaded api, see [manual load app documentation] for more details on usage (... /napi/attributes/loadApp)
