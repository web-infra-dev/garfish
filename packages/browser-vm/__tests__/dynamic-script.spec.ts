import { mockStaticServer } from '@garfish/test-suite';
import { Sandbox } from '../src/sandbox';

declare global {
  interface window {
    execOrder: Array<string>;
  }
}

describe('Sandbox: dynamic script', () => {
  const eventTaskScriptUrl = '/resources/eventTask.js';
  const dynamicInjectJsonp = '/resources/jsonp';
  const dynamicContentTypeJsonp = '/resources/contentTypeJsonp';
  const dynamicInjectNoTypeJsonp = '/resources/noTypeJsonp?callback_';

  mockStaticServer({
    baseDir: __dirname,
    customerHeaders: {
      [dynamicInjectJsonp]: {
        'Content-Type': 'application/json',
      },
      [dynamicContentTypeJsonp]: {
        'Content-Type': 'text/javascript',
      },
      '/resources/noTypeJsonp': {
        'Content-Type': 'application/json',
      },
    },
  });

  let sandbox: Sandbox;

  const go = (code: string) => {
    return `
      const sandbox = __debug_sandbox__;
      const Sandbox = sandbox.constructor;
      const nativeWindow = Sandbox.getNativeWindow();
      document.body.innerHTML = '<div id="root">123</div><div __garfishmockhead__></div>'
      ${code}
    `;
  };

  beforeEach(() => {
    sandbox = new Sandbox({
      namespace: 'app',
      el: () => document.createElement('div'),
      modules: [
        () => ({
          recover() {},
          override: { go, jest, expect },
        }),
      ],
    });
    (global as any).fetch = fetch;
  });

  it('event loop', (done) => {
    sandbox.execScript(
      go(`
        window.execOrder = [];
        const dynamicScript = document.createElement('script');
        dynamicScript.src = "${eventTaskScriptUrl}";
        dynamicScript.onload = function () {
          window.execOrder.push('onload task');
          setTimeout(()=>{
            expect(window.execOrder).toEqual([
              'normal task',
              'micro task',
              'onload task',
              'macro task',
            ]);
            jestDone();
          })
        }
        document.head.appendChild(dynamicScript);
      `),
      { jestDone: done },
    );
  });

  it('dynamic inject jsonp script with type attribute', (done) => {
    sandbox.execScript(
      go(`
        const dynamicScript = document.createElement('script');
        dynamicScript.src = "${dynamicInjectJsonp}";
        dynamicScript.type = 'text/javascript';
        dynamicScript.onload = function () {
          expect(window.jsonpVariable).toBe(true);
          jestDone();
        }
        document.head.appendChild(dynamicScript);
      `),
      { jestDone: done },
    );
  });

  it('dynamic inject jsonp script with content-type attribute', (done) => {
    sandbox.execScript(
      go(`
        const dynamicScript = document.createElement('script');
        dynamicScript.src = "${dynamicContentTypeJsonp}";
        dynamicScript.onload = function () {
          expect(window.contentTypeJsonp).toBe(true);
          jestDone();
        }
        document.head.appendChild(dynamicScript);
      `),
      { jestDone: done },
    );
  });

  it('dynamic inject jsonp script with jsonp key', (done) => {
    sandbox.execScript(
      go(`
        const dynamicScript = document.createElement('script');
        dynamicScript.src = "${dynamicInjectNoTypeJsonp}";
        dynamicScript.onload = function () {
          expect(window.noTypeJsonp).toBe(true);
          jestDone();
        }
        document.head.appendChild(dynamicScript);
      `),
      { jestDone: done },
    );
  });
});
