import { Sandbox } from '../src/sandbox';
import { sandboxMap } from '../src/utils';

require('css.escape');

// Garfish 使用 Proxy 对 dom 进行了劫持, 同时对调用 dom 的函数做了劫持, 修正 dom 节点的类型
// 对调用 dom 的相关方法进行测试
describe('Sandbox:Dom & Bom', () => {
  let sandbox: Sandbox;
  window.dispatchEvent = () => true;

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
  });

  it('document method can be invoked correctly', () => {
    sandbox.execScript(
      go(`
        const root = document.getElementById('root');
        const div = document.createElement('div');
        const id = 'test';
        div.id = id;
        expect(root.appendChild(div)).toBeTruthy();
        const divSelect = document.getElementById(id)
        expect(divSelect.id).toBe(id)
      `),
    );
  });

  it('MutationObserver can be used correctly', () => {
    sandbox.execScript(
      go(`
        // const cb = jest.fn();
        // const root = document.getElementById('root');
        // const ob = new MutationObserver(cb);
        // ob.observe(root, {
        //   attributes: true
        // });
        // root.setAttribute('data-test', 1);
        // const ob2 = new MutationObserver(cb);
        // ob2.observe(document, {
        //   attributes: true
        // });
      `),
    );
  });

  it('Number.isInteger can be used correctly', () => {
    sandbox.execScript(
      go(`
        expect(Number.isInteger(5)).toBe(true);
        expect(window.Number.isInteger(5)).toBe(true);
      `),
    );
  });

  it('Static methods of Global Object can be used correctly', () => {
    sandbox.execScript(
      go(`
        expect(Number.isInteger(5)).toBe(true);
        expect(window.Number.isInteger(5)).toBe(true);
      `),
    );
  });

  // it('ownerDocument', () => {
  //   sandbox.execScript(
  //     go(`
  //       const div = document.createElement('div');
  //       expect(document.ownerDocument === null).toBe(true);
  //       expect(div.ownerDocument === document).toBe(true);
  //     `),
  //   );
  // });

  it('document.head', () => {
    sandbox.execScript(
      go(`
        const head = document.head;
        expect(head.tagName.toLowerCase()).toBe('div');
      `),
    );
  });

  it('Document and HTMLDocument', () => {
    sandbox.execScript(
      go(`
      expect(document instanceof HTMLDocument).toBe(true);
      expect(document instanceof Document).toBe(true);
      const documentCopy1 = new HTMLDocument();
      expect(documentCopy1 instanceof HTMLDocument).toBe(true);
      expect(documentCopy1 instanceof Document).toBe(true);
      const documentCopy2 = new Document();
      // jest has issue in Document instanceof proto
      // expect(documentCopy2 instanceof HTMLDocument).toBe(false);
      expect(documentCopy2 instanceof Document).toBe(true);
    `),
    );
  });

  function testGetElementById(sandbox: Sandbox) {
    sandbox.execScript(
      go(`
        const ids = [
          "1asfac",
          "tool#tip",
          "name[value]",
          ":hover",
          "42answer",
          "hello-world"
        ];
        const root = document.body;
        for (const id of ids) {
          const div = document.createElement('div');
          div.id = id;
          expect(root.appendChild(div)).toBeTruthy();
          const divSelect = document.getElementById(id);
          expect(divSelect.id).toBe(id);
        }
      `),
    );
  }

  it('The results of getElementById and querySelector should be same.', () => {
    testGetElementById(sandbox);
    document.body.innerHTML = '<div id="root"></div>';
    testGetElementById(new Sandbox({
      strictIsolation: true,
      namespace: 'app',
      el: () => document.getElementById('root'),
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
    }));
  });

  it('MutationObserver callbacks can be canceled.', (next) => {
    sandboxMap.set(sandbox);
    sandbox.execScript(
      go(`
        let windowObserverTriggered = false;
        let sandboxObserverTriggered = false;
        const root = document.getElementById('root');
        const outer = document.createElement('div');
        outer.innerText = 'outer';
        root.appendChild(outer);
        const inner = document.createElement('div');
        inner.innerText = 'inner';
        outer.appendChild(inner);
        const windowObserver = new nativeWindow.MutationObserver(() => {
          windowObserverTriggered = true;
        });
        windowObserver.observe(outer, { attributes: true, childList: true, subtree: true });
        const sandboxObserver = new MutationObserver(() => {
          sandboxObserverTriggered = true;
        });
        sandboxObserver.observe(outer, { attributes: true, childList: true, subtree: true });
        // To trigger clear effects.
        sandbox.reset();
        Promise.resolve().then(() => {
          expect(windowObserverTriggered).toBe(true);
          expect(sandboxObserverTriggered).toBe(false);
          next();
        });
      `),
      { next },
    );
  });
});
