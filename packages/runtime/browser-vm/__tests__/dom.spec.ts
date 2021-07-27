import { Sandbox } from '../src/index';

// Garfish 使用 Proxy 对 dom 进行了劫持, 同时对调用 dom 的函数做了劫持, 修正 dom 节点的类型
// 对调用 dom 的相关方法进行测试
describe('Sandbox:Dom & Bom', () => {
  let sandbox: Sandbox;
  window.dispatchEvent = () => true;

  const go = (code: string) => {
    return `
      const sandbox = unstable_sandbox;
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

  it('ownerDocument', () => {
    sandbox.execScript(
      go(`
        const div = document.createElement('div');
        expect(document.ownerDocument === null).toBe(true);
        expect(div.ownerDocument === document).toBe(true);
      `),
    );
  });

  it('document.head', () => {
    sandbox.execScript(
      go(`
        const head = document.head;
        expect(head.tagName.toLowerCase()).toBe('div');
      `),
    );
  });
});
