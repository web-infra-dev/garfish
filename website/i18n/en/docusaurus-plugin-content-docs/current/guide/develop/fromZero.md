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
title: Build from scratch
slug: /guide/develop/from-zero
order: 1

---

## Main application

### 1. install Garfish

```bash
$ yarn add garfish # or npm i garfish -S
```

### 2. Register the child application on the main application and start Garfish

```js
import Garfish from 'garfish';

Garfish.run({
  // The base path of the main app, this value needs to be the same as the base path of the main app
  basename: '/',
  // Note that the #subApp node should be present in the page when running, and can be a function (if it is a function, it will be used as a mount point when the function returns)
  domGetter: '#subApp',
  apps: [
    {
      // The name of each app needs to be unique
      name: 'react',
      // Can be a function, when the function returns true, the app will be automatically mounted to the page when the activation condition is met.
      activeWhen: '/react',
      // the entry address of the sub-application, can be HTML address and JS address (the rendering function is handled differently for different modes)
      entry: 'http://localhost:3000',
    },
    {
      name: 'vue',
      activeWhen: '/vue',
      entry: 'http://localhost:8080',
    },
  ],
});
```

After the execution of registering the sub-application information and executing `Garfish.run`, the `Garfish` framework will start the route hijacking ability, when the browser address changes, the `Garfish` framework will immediately trigger the matching logic when the application meets the matching logic will automatically mount the application to the page. And in turn, it will trigger the life cycle of the child application during loading and rendering.

For example, in the above example.

- `basename: '/'`
- The React application is activated at `'/react'`
- then the browser jumps to `/react` and `'/react/xxx/xx'` routes will trigger the React app to be mounted in `domGetter`
- If `basename: '/demo'`, then the React app activation path will be `/demo/react` and `'/demo/react/xxx/xx'`

> **Manual mounts**

In practical business scenarios, the application mount does not necessarily follow the route change, but may be triggered by certain events to use the mount capability, details of which can be found in **[manual mount](... /advance/loadApp)**

```javascript
import Garfish from 'garfish';

async function loadApp() {
  const app = await Garfish.loadApp('vue', {
    // loadApp's app will be provided from the information registered during Garfish.run, manually mounted apps appInfo should not provide activeWhen
    basename: '/demo/vue',
    domGetter: '#subModule',
  });

  await app.mount();
}

loadApp();
```

## Sub-applications

### 1. Provide key rendering and destruction hooks

```js
import ReactDOM from 'react-dom';
import App from '. /App';

const render = ({ dom, basename }) => {
  ReactDOM.render(
    // Use the basename provided by the Garfish framework, on which all subroutes of the child app are based, to reach the goal of route isolation and refreshing the route to load the child app components
    <App basename={basename} />,
    // The document here is a Garfish-constructed subapp container where all the content is placed
    // If it's a js entry render it directly in the dom (because there are no other nodes)
    // If it's an html entry, it will be rendered in its own html dom node via a selector
    dom.querySelector('#root'),
  );
};

// This function will be triggered on first load and execution
export const provider = () => {
  return {
    render, // The hook will be triggered when the application is rendered
    destroy({ dom }) {
      // The hook will be triggered when the application is destroyed
      const root = (dom && dom.querySelector('#root')) || dom; // If it is a JS entry, the incoming node will be used directly as the mount point and destroyed node
      if (root) {
        // Do the corresponding destruction logic to ensure that the corresponding side effects are also removed when the child application is destroyed
        ReactDOM.unmountComponentAtNode(root);
      }
    },
  };
};

// This allows the sub-application to run independently of the main application to ensure that subsequent sub-applications can run independently of the main application for easy debugging and development
if (!window.__GARFISH__) {
  render({ dom: document, basename: '/' });
}
```

### 2. Tweak sub-application-related build configuration

In addition to providing `provider` export content, the sub-application also needs to add certain `webpack` configurations, as follows, for the meaning of each webpack configuration refer to [webpack configuration documentation](https://webpack.js.org/configuration/ output/#outputlibrary)

```js
module.exports = {
  output: {
    // needs to be configured for umd specification
    libraryTarget: 'umd',
    // Modify non-standard code format to avoid escaping the sandbox
    globalObject: 'window',
    // Request to ensure that the value is not the same for each child application, otherwise there may be webpack chunks that affect each other
    jsonpFunction: 'vue-app-jsonpFunction',
    // Ensure that the resource path of the child app becomes an absolute path, so that the relative resources of the child app do not become relative resources on the main app, because the child app and the main app are in the same document stream, and the relative path is relative to the main app
    publicPath: 'http://localhost:8000',
  },
  devServer: {
    // ensure that the application port is not the same in development mode
    port: '8000',
    headers: {
      // Ensure that the resources of the sub-application support cross-domain, after online you need to ensure that the resources of the sub-application will not have cross-domain problems when loaded in the environment of the main application (** also need to limit the scope of attention to security issues**)
      'Access-Control-Allow-Origin': '*',
    },
  },
};
```

## Summary

The main cost of building a set of micro front-end master and child applications with Garfish comes from two sources

- Build of the main application
  - Registering the basic information of the sub-application
  - Scheduling and managing the sub-application on the main application using Garfish
- Transformation of the sub-application
  - Provide rendering and destruction lifecycle of the application by exporting `provider`.
  - Provide rendering nodes in the rendering lifecycle for different entry modes provided
  - use `basename` provided by the framework as the base of the application in the rendering lifecycle `basename` has reached the goal of routing isolation, refreshing routes to load sub-application components
  - add compatible rendering logic in non-micro front-end mode so that its sub-applications can run independently (in general it is recommended that users only use html entry)
  - Add the corresponding build configuration
