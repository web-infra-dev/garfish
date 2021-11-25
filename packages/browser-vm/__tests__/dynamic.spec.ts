import { Sandbox } from '../src/sandbox';
import { sandboxMap } from '../src/utils';
import fetchMock from 'jest-fetch-mock';
global.fetch = fetchMock;

// https://www.npmjs.com/package/jest-fetch-mock
function mockScript(code: string) {
  const url = `http://garfish-mock.com/${performance.now()}`;
  fetchMock.mockIf(url, () => {
    return Promise.resolve({
      body: code,
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  });
  return url;
}

declare global {
  interface window {
    execOrder: Array<string>;
  }
}

describe('Sandbox: dynamic script', () => {
  let sandbox: Sandbox;
  let secondScriptUrl: string;
  const go = (code: string) => {
    return `
      const sandbox = __debug_sandbox__;
      const Sandbox = sandbox.constructor;
      const nativeWindow = Sandbox.getNativeWindow();
      document.body.innerHTML = '<div id="root">123</div><div __garfishmockhead__></div>'
      ${code}
    `;
  };

  const create = (opts = {}) => {
    return new Sandbox({
      ...opts,
      namespace: 'app',
      el: () => document.createElement('div'),
      modules: [
        () => ({
          recover() {},
          override: { go, jest, expect },
        }),
      ],
    });
  };

  beforeEach(() => {
    sandbox = create();

    secondScriptUrl = mockScript(`
      setTimeout(()=>{
        window.execOrder.push('second macro task');
      })
      Promise.resolve().then(()=>{
        window.execOrder.push('second micro task');
      });
      window.execOrder.push('second normal task');
    `);
  });

  it('onload Micro macro normal task', (done) => {
    sandbox.execScript(
      go(`
        window.execOrder = [];
        const second = document.createElement('script');
        second.src = "${secondScriptUrl}";
        second.onload = function () {
          window.execOrder.push('second onload task');
          setTimeout(()=>{
            expect(window.execOrder).toEqual([
              'second normal task', 'second micro task','second onload task','second macro task'
            ]);
            jestDone();
          })
        }
        document.head.appendChild(second);
      `),
      { jestDone: done },
    );
  });
});
