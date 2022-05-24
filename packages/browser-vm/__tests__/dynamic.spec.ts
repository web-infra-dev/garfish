import { mockStaticServer } from '@garfish/test-suite';
import { Sandbox } from '../src/sandbox';

declare global {
  interface window {
    execOrder: Array<string>;
  }
}

describe('Sandbox: dynamic script', () => {
  mockStaticServer(__dirname);

  let sandbox: Sandbox;
  const secondScriptUrl = './resources/eventTask.js';

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
    (global as any).fetch = fetch;
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
              'second normal task',
              'second micro task',
              'second onload task',
              'second macro task',
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
