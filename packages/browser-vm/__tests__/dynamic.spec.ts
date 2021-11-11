import { Sandbox } from '../src/sandbox';
import { sandboxMap } from '../src/utils';
import fetchMock from 'jest-fetch-mock';

global.fetch = fetchMock;

declare global {
  interface window {
    execOrder: Array<string>;
  }
}

const codeMap = {
  'first.js': `
    Promise.resolve().then(()=>{
      window.execOrder.push('first micro task');
    });
    window.execOrder.push('first normal task');
  `,
  'second.js': `
    Promise.resolve().then(()=>{
      window.execOrder.push('second micro task');
    });
    window.execOrder.push('second normal task');
  `,
};

describe('Sandbox: dynamic script', () => {
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

  const create = (opts = {}) => {
    return new Sandbox({
      ...opts,
      namespace: 'app',
      el: () => document.createElement('div'),
      modules: [
        () => ({
          recover() {},
          override: {
            go,
            jest,
            expect,
          },
        }),
      ],
    });
  };

  beforeEach(() => {
    sandbox = create();
    fetchMock.mockIf(/^https?:\/\/garfish.com.*$/, (req) => {
      const fileList = Object.keys(codeMap);
      const fileIndex = fileList.find(
        (curUrl) => req.url.indexOf(curUrl) !== -1,
      );
      if (codeMap[fileIndex]) {
        return Promise.resolve({
          body: codeMap[fileIndex],
          headers: {
            'Content-Type': 'application/javascript',
          },
        });
      } else {
        return Promise.resolve({
          status: 404,
          body: 'Not Found',
        });
      }
    });
  });

  it('onload Micro macro task task', (done) => {
    sandbox.execScript(
      go(`
        window.execOrder = [];
        const first = document.createElement('script');
        first.src = 'http://garfish.com/first.js';
        first.onload = function () {
          window.execOrder.push('first onload task');
          expect(window.execOrder).toEqual(['first normal task','second normal task','first micro task','first onload task']);
        }
        document.head.appendChild(first);

        const second = document.createElement('script');
        second.src = 'http://garfish.com/second.js';
        second.onload = function () {
          window.execOrder.push('second onload task');
          console.log(window.execOrder);
          expect(window.execOrder).toEqual([
            'first normal task','second normal task','first micro task',
            'first onload task','second micro task','second onload task'
          ]);
          jestDone();
        }
        document.head.appendChild(second);
      `),
      { jestDone: done },
    );
  }, 20000);
});
