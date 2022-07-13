import { mockStaticServer } from '@garfish/test-suite';
import assert from 'assert';
import Garfish from '../src/index';

const vueHtmlEntry = 'http://localhost:1000/vue.html';
const reactHtmlEntry = 'http://localhost:1001/react.html';
const reactJsEntry = 'http://localhost:1001/index.js';
const fetchResourceMap = {
  [vueHtmlEntry]: {
    text: 'hello world vue app',
    type: 'text/html',
    body: `
      <div id="vue-app"></div>
      <script>
        __GARFISH_EXPORTS__.provider = function (){
          return {
            render (){
              const dom = document.querySelector('#vue-app');
              dom.innerHTML = '<div>hello world vue app</div>';
            },
            destroy(){},
          };
        };
      </script>
    `,
  },
  [reactHtmlEntry]: {
    text: 'dynamic inject react msg',
    type: 'text/html',
    body: `
      <script src="${reactJsEntry}"></script>
      <div id="react-app"></div>
    `,
  },
  [reactJsEntry]: {
    type: 'application/javascript',
    body: `
      __GARFISH_EXPORTS__.provider = function (){
        return {
          render (){
            const dom = document.querySelector('#react-app');
            dom.innerHTML = '<div>dynamic inject react msg</div>';
          },
          destroy(){},
        };
      };
    `,
  },
};

describe('Core: custom fetch', () => {
  let GarfishInstance: Garfish;
  let container;
  mockStaticServer({
    baseDir: __dirname,
  });

  beforeEach(() => {
    container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);
    GarfishInstance = new Garfish({});
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('custom fetch resource entry', async () => {
    const GarfishInstance = new Garfish({});
    GarfishInstance.loader.setLifeCycle({
      fetch(url) {
        if (fetchResourceMap[url]) {
          return Promise.resolve(
            new Response(fetchResourceMap[url].body, {
              status: 200,
              headers: {
                'content-type': fetchResourceMap[url].type,
              },
            }),
          );
        }
      },
    });
    GarfishInstance.run({
      disablePreloadApp: false,
      domGetter: '#container',
      apps: [
        {
          name: 'vue-app',
          entry: vueHtmlEntry,
        },
      ],
    });
    const app = await GarfishInstance.loadApp('vue-app');
    assert(app, 'app should be loaded');
    expect(app).toBeDefined();
    await (app as any).mount();
    const node = document.body.querySelector('#vue-app');
    assert(node, 'node should be exist');
    expect(node.innerHTML).toBe(
      `<div>${fetchResourceMap[vueHtmlEntry].text}</div>`,
    );
  });

  it('custom fetch entry and dynamic js', async () => {
    const GarfishInstance = new Garfish({});
    GarfishInstance.loader.setLifeCycle({
      fetch(url) {
        if (fetchResourceMap[url]) {
          return Promise.resolve(
            new Response(fetchResourceMap[url].body, {
              status: 200,
              headers: {
                'content-type': fetchResourceMap[url].type,
              },
            }),
          );
        }
      },
    });
    GarfishInstance.run({
      disablePreloadApp: false,
      domGetter: '#container',
      apps: [
        {
          name: 'react-app',
          entry: reactHtmlEntry,
        },
      ],
    });
    const app = await GarfishInstance.loadApp('react-app');
    assert(app, 'app should be loaded');
    expect(app).toBeDefined();
    await (app as any).mount();
    const node = document.body.querySelector('#react-app');
    assert(node, 'node should be exist');
    expect(node.innerHTML).toBe(
      `<div>${fetchResourceMap[reactHtmlEntry].text}</div>`,
    );
  });
});
