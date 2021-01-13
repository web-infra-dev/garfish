import Sandbox from '../src/index';

// Garfish使用Proxy对dom进行了劫持, 同时对调用dom的函数做了劫持, 修正dom节点的类型
// 对调用dom的相关方法进行测试

describe('Sandbox:Dom & Bom', () => {
  let sandbox: Sandbox;
  window.dispatchEvent = () => true;

  const go = (code: string) => {
    return `
      const sandbox = unstable_sandbox;
      const Sandbox = sandbox.constructor;
      const nativeWindow = Sandbox.getGlobalObject();
      const parentWindow = sandbox.context[Symbol.for('__garModule__')];
      document.body.innerHTML = '<div id="root">123</div>'
      ${code}
    `;
  };

  const create = (opts = {}) => {
    return new Sandbox({
      ...opts,
      namespace: 'app',
      modules: {
        // 注入测试的一些方法
        jest: () => ({
          recover() {},
          override: {
            go,
            jest,
            expect,
          },
        }),
      },
    });
  };

  beforeEach(() => {
    // 由于 proxy 是 polyfill 的性质，所以需要提前定义好才能拦截到
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

  it('MutationObserver can be used correctly', async () => {
    sandbox.execScript(
      go(`
        const cb = jest.fn();
        const root = document.getElementById('root');
        const ob = new MutationObserver(cb);
        ob.observe(root, {
          attributes: true
        });
        root.setAttribute('data-test', 1);
        const ob2 = new MutationObserver(cb);
        ob2.observe(document, {
          attributes: true
        });
      `),
    );
  });

  it('Number.isInteger can be used correctly', async () => {
    sandbox.execScript(
      go(`
        expect(Number.isInteger(5)).toBe(true);
        expect(window.Number.isInteger(5)).toBe(true);
      `),
    );
  });

  it('Static methods of Global Object can be used correctly', async () => {
    sandbox.execScript(
      go(`
        expect(Number.isInteger(5)).toBe(true);
        expect(window.Number.isInteger(5)).toBe(true);
      `),
    );
  });
});
